const mongoose = require('mongoose');
const FinancialAccount = require('../models/FinancialAccount');
const Payment = require('../models/Payment');

const MAX_RECEIPT_BYTES = 3 * 1024 * 1024;
const RECEIPT_TYPES = {
  'image/jpeg': (data) => data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff,
  'image/png': (data) =>
    data.length >= 8 &&
    data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (data) =>
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP',
};

function transactionUnavailable(error) {
  return error.code === 20 || /replica set|transaction numbers are only allowed/i.test(error.message);
}

function safePayment(payment) {
  return {
    _id: payment._id,
    resident: payment.resident,
    amountCentavos: payment.amountCentavos,
    referenceNumber: payment.referenceNumber,
    receiptFileName: payment.receiptFileName,
    status: payment.status,
    rejectionReason: payment.rejectionReason,
    verificationHistory: payment.verificationHistory,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

exports.createPayment = async (req, res) => {
  const { amount, referenceNumber, receiptBase64, receiptMimeType, receiptFileName } =
    req.body ?? {};
  const amountText = String(amount ?? '').trim();
  const match = amountText.match(/^(\d+)(?:\.(\d{1,2}))?$/);
  const amountCentavos = match
    ? Number(`${match[1]}${(match[2] ?? '').padEnd(2, '0')}`)
    : null;
  const reference = typeof referenceNumber === 'string' ? referenceNumber.trim() : '';

  if (!Number.isSafeInteger(amountCentavos) || amountCentavos <= 0) {
    return res.status(400).json({ message: 'Enter a valid payment amount' });
  }
  if (!/^[\w][\w -]{2,79}$/.test(reference)) {
    return res.status(400).json({ message: 'Enter a valid reference number' });
  }
  if (
    typeof receiptBase64 !== 'string' ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(receiptBase64) ||
    receiptBase64.length > Math.ceil((MAX_RECEIPT_BYTES * 4) / 3)
  ) {
    return res.status(400).json({ message: 'Upload a receipt image under 3 MB' });
  }
  if (
    typeof receiptMimeType !== 'string' ||
    !Object.hasOwn(RECEIPT_TYPES, receiptMimeType)
  ) {
    return res.status(400).json({ message: 'Choose a JPEG, PNG, or WebP receipt image' });
  }

  const receiptData = Buffer.from(receiptBase64, 'base64');
  if (
    receiptData.length === 0 ||
    receiptData.length > MAX_RECEIPT_BYTES ||
    receiptData.toString('base64') !== receiptBase64 ||
    !RECEIPT_TYPES[receiptMimeType](receiptData)
  ) {
    return res.status(400).json({ message: 'The receipt must be a valid JPEG, PNG, or WebP image' });
  }
  const fileName =
    typeof receiptFileName === 'string'
      ? receiptFileName.replace(/[\\/\u0000-\u001f]/g, '').slice(0, 120)
      : '';
  if (!fileName) return res.status(400).json({ message: 'The receipt file name is invalid' });

  try {
    await FinancialAccount.updateOne(
      { resident: req.user._id },
      {
        $setOnInsert: {
          resident: req.user._id,
          outstandingCentavos: 0,
          collectedCentavos: 0,
          creditCentavos: 0,
        },
      },
      { upsert: true }
    );
    const payment = await Payment.create({
      resident: req.user._id,
      amountCentavos,
      referenceNumber: reference,
      receiptData,
      receiptMimeType,
      receiptFileName: fileName,
    });
    console.info('Payment submitted', {
      paymentId: String(payment._id),
      amountCentavos,
      resident: String(req.user._id),
    });
    res.status(201).json({ payment: safePayment(payment) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'That reference number has already been submitted' });
    }
    console.error('Could not save payment:', error.message);
    res.status(500).json({ message: 'Could not save payment' });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ resident: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ payments });
  } catch (error) {
    console.error('Could not load resident payment history:', error.message);
    res.status(500).json({ message: 'Could not load payment history' });
  }
};

exports.getPayments = async (req, res) => {
  const filter = {};
  if (typeof req.query.status === 'string' && ['pending', 'approved', 'rejected'].includes(req.query.status)) {
    filter.status = req.query.status;
  }

  try {
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .populate('resident', 'name email unit')
      .populate('verificationHistory.by', 'name')
      .lean();
    res.json({ payments });
  } catch (error) {
    console.error('Could not load payments:', error.message);
    res.status(500).json({ message: 'Could not load payments' });
  }
};

exports.getReceipt = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Receipt not found' });
  }
  try {
    const payment = await Payment.findById(req.params.id).select('+receiptData +receiptMimeType');
    if (!payment) return res.status(404).json({ message: 'Receipt not found' });
    res.set({
      'Content-Type': payment.receiptMimeType,
      'Content-Length': payment.receiptData.length,
      'Content-Disposition': 'inline',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(payment.receiptData);
  } catch (error) {
    console.error('Could not load receipt:', error.message);
    res.status(500).json({ message: 'Could not load receipt' });
  }
};

exports.updateVerification = async (req, res) => {
  const { status, note } = req.body ?? {};
  if (note !== undefined && note !== null && typeof note !== 'string') {
    return res.status(400).json({ message: 'The admin note must be text' });
  }
  const reason = typeof note === 'string' ? note.trim() : '';
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Choose approve or reject' });
  }
  if (status === 'rejected' && !reason) {
    return res.status(400).json({ message: 'A reason is required to reject a payment' });
  }
  if (reason.length > 1000) {
    return res.status(400).json({ message: 'The note must be 1000 characters or fewer' });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  const session = await mongoose.startSession();
  let updatedPayment;
  try {
    await session.withTransaction(async () => {
      const payment = await Payment.findById(req.params.id).session(session);
      if (!payment) {
        const error = new Error('Payment not found');
        error.status = 404;
        throw error;
      }
      if (payment.status !== 'pending') {
        const error = new Error('This payment has already been reviewed');
        error.status = 409;
        throw error;
      }

      if (status === 'approved') {
        const account = await FinancialAccount.findOne({ resident: payment.resident }).session(session);
        if (!account) {
          const error = new Error('Resident financial account not found');
          error.status = 409;
          throw error;
        }
        const appliedCentavos = Math.min(account.outstandingCentavos, payment.amountCentavos);
        account.outstandingCentavos -= appliedCentavos;
        account.collectedCentavos += payment.amountCentavos;
        account.creditCentavos += payment.amountCentavos - appliedCentavos;
        await account.save({ session });
      } else {
        payment.rejectionReason = reason;
      }

      payment.status = status;
      payment.verificationHistory.push({ status, note: reason, by: req.user._id });
      await payment.save({ session });
      updatedPayment = payment;
    });

    await updatedPayment.populate([
      { path: 'resident', select: 'name email unit' },
      { path: 'verificationHistory.by', select: 'name' },
    ]);
    console.info(`Payment ${status}`, {
      paymentId: String(updatedPayment._id),
      amountCentavos: updatedPayment.amountCentavos,
      by: String(req.user._id),
    });
    res.json({ payment: safePayment(updatedPayment) });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    if (transactionUnavailable(error)) {
      return res.status(503).json({
        message: 'Payment verification requires MongoDB transaction support; no changes were made',
      });
    }
    console.error('Could not verify payment:', error.message);
    res.status(500).json({ message: 'Could not verify payment' });
  } finally {
    await session.endSession();
  }
};
