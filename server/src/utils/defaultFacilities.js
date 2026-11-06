const Facility = require('../models/Facility');

const DEFAULT_FACILITIES = [
  {
    name: 'Clubhouse',
    description: 'Spacious venue for community gatherings, private parties, and meetings.',
    feeCentavos: 150000,
    feeDescription: '₱1,500 per 4-hour block',
  },
  {
    name: 'Court',
    description: 'Full-sized covered basketball and badminton court with lighting.',
    feeCentavos: 20000,
    feeDescription: 'From ₱200 per hour',
  },
  {
    name: 'Swimming pool',
    description: 'Adult and kiddie pools open for resident leisure and private celebrations.',
    feeCentavos: 10000,
    feeDescription: '₱100 per guest',
  },
  {
    name: 'Function hall',
    description: 'Air-conditioned hall equipped with sound system and projector.',
    feeCentavos: 250000,
    feeDescription: '₱2,500 per 4-hour block',
  },
];

async function ensureDefaultFacilities() {
  for (const facility of DEFAULT_FACILITIES) {
    await Facility.updateOne(
      { name: facility.name },
      { $setOnInsert: facility },
      { upsert: true }
    );
  }
}

module.exports = { ensureDefaultFacilities };
