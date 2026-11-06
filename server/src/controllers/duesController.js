const mongoose = require('mongoose');
const DueEntry = require('../models/DueEntry');
const FinancialAccount = require('../models/FinancialAccount');
const MonthlyCharge = require('../models/MonthlyCharge');
const Payment = require('../models/Payment');
const User = require('../models/User');

function parseAmountCentavos(value) {
  const text = String(value ?? '').trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const amount = Number(`${whole}${fraction.padEnd(2, '0')}`);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

function transactionUnavailable(error) {
  return error.code === 20 || /replica set|transaction numbers are only allowed/i.test(error.message);
}

function statusForBalance(centavos) {
  return centavos > 0 ? 'Outstanding' : 'Paid';
}

async function buildResidentSummary(residentId) {
  const [account, dues, approvedPayments] = await Promise.all([
    FinancialAccount.findOne({ resident: residentId }),
    DueEntry.find({ resident: residentId }).sort({ month: 1 }),
    Payment.find({ resident: residentId, status: 'approved' })
      .select('amountCentavos')
      .sort({ createdAt: 1, _id: 1 }),
  ]);

  let credit = approvedPayments.reduce((total, payment) => total + payment.amountCentavos, 0);
  let paidThrough = null;
  const items = dues.map((due) => {
    const paid = Math.min(due.amountCentavos, credit);
    credit -= paid;
    if (paid === due.amountCentavos) paidThrough = due.month;
    return {
      _id: due._id,
      month: due.month,
      amountCentavos: due.amountCentavos,
      outstandingCentavos: due.amountCentavos - paid,
    };
  });
  const outstandingCentavos = account?.outstandingCentavos ?? 0;

  return {
    outstandingCentavos,
    creditCentavos: account?.creditCentavos ?? 0,
    status: statusForBalance(outstandingCentavos),
    paidThrough,
    dues: items,
  };
}

exports.getMyDues = async (req, res) => {
  try {
    const summary = await buildResidentSummary(req.user._id);
    res.json(summary);
  } catch (error) {
    console.error('Could not load resident dues:', error.message);
    res.status(500).json({ message: 'Could not load dues' });
  }
};

exports.getDuesOverview = async (req, res) => {
  try {
    const [residents, accounts, dues, totalCollectedCentavos, pendingVerification] =
      await Promise.all([
        User.find({ role: 'resident' }).select('name email unit').sort({ name: 1 }),
        FinancialAccount.find().select(
          'resident outstandingCentavos collectedCentavos creditCentavos'
        ),
        DueEntry.find().select('resident month').sort({ month: -1 }),
        FinancialAccount.aggregate([
          { $group: { _id: null, total: { $sum: '$collectedCentavos' } } },
        ]),
        Payment.countDocuments({ status: 'pending' }),
      ]);

    const accountByResident = new Map(accounts.map((account) => [String(account.resident), account]));
    const latestMonthByResident = new Map();
    dues.forEach((due) => {
      const id = String(due.resident);
      if (!latestMonthByResident.has(id)) latestMonthByResident.set(id, due.month);
    });

    const rows = residents.map((resident) => {
      const account = accountByResident.get(String(resident._id));
      const outstandingCentavos = account?.outstandingCentavos ?? 0;
      return {
        _id: resident._id,
        resident,
        month: latestMonthByResident.get(String(resident._id)) ?? null,
        outstandingCentavos,
        collectedCentavos: account?.collectedCentavos ?? 0,
        creditCentavos: account?.creditCentavos ?? 0,
        status: statusForBalance(outstandingCentavos),
      };
    });

    res.json({
      summary: {
        totalCollectedCentavos: totalCollectedCentavos[0]?.total ?? 0,
        outstandingCentavos: accounts.reduce((total, account) => total + account.outstandingCentavos, 0),
        pendingVerification,
      },
      dues: rows,
    });
  } catch (error) {
    console.error('Could not load dues overview:', error.message);
    res.status(500).json({ message: 'Could not load dues overview' });
  }
};

exports.createMonthlyDues = async (req, res) => {
  const { month, amount } = req.body ?? {};
  const amountCentavos = parseAmountCentavos(amount);

  if (typeof month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return res.status(400).json({ message: 'Choose a valid billing month' });
  }
  if (!amountCentavos) {
    return res.status(400).json({ message: 'Enter a valid amount greater than zero' });
  }

  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const residents = await User.find({ role: 'resident' }).select('_id').session(session);
      if (residents.length === 0) {
        const error = new Error('There are no resident accounts to charge');
        error.status = 400;
        throw error;
      }

      const [charge] = await MonthlyCharge.create(
        [{ month, amountCentavos, createdBy: req.user._id }],
        { session }
      );
      await DueEntry.insertMany(
        residents.map((resident) => ({
          resident: resident._id,
          charge: charge._id,
          month,
          amountCentavos,
        })),
        { session }
      );
      const residentIds = residents.map((resident) => resident._id);
      const accounts = await FinancialAccount.find({ resident: { $in: residentIds } })
        .select('resident creditCentavos')
        .session(session);
      const accountByResident = new Map(
        accounts.map((account) => [String(account.resident), account])
      );
      await FinancialAccount.bulkWrite(
        residents.map((resident) => {
          const account = accountByResident.get(String(resident._id));
          const creditApplied = Math.min(account?.creditCentavos ?? 0, amountCentavos);
          const update = account
            ? {
                $inc: {
                  outstandingCentavos: amountCentavos - creditApplied,
                  creditCentavos: -creditApplied,
                },
              }
            : {
                $inc: { outstandingCentavos: amountCentavos },
                $setOnInsert: {
                  resident: resident._id,
                  collectedCentavos: 0,
                  creditCentavos: 0,
                },
              };
          return {
            updateOne: {
              filter: { resident: resident._id },
              update,
              upsert: true,
            },
          };
        }),
        { session }
      );
      result = { month, amountCentavos, residentsCharged: residents.length };
    });
    console.info('Monthly dues posted', {
      month: result.month,
      amountCentavos: result.amountCentavos,
      residentsCharged: result.residentsCharged,
      by: String(req.user._id),
    });
    res.status(201).json({ charge: result });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Dues have already been posted for this month' });
    }
    if (transactionUnavailable(error)) {
      return res.status(503).json({
        message: 'Financial changes require MongoDB transaction support; no dues were posted',
      });
    }
    console.error('Could not post monthly dues:', error.message);
    res.status(500).json({ message: 'Could not post monthly dues' });
  } finally {
    await session.endSession();
  }
};

exports.buildResidentSummary = buildResidentSummary;
