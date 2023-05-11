const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const TransactionsSchema = new Scheme({
  batchId: {
    type: String,
    required: true,
  },
  batchName: {
    type: String,
    required: false,
  },
  user: {
    type: String,
    required: true,
  },
  successes: {
    type: Number,
    required: false,
  },
  failures: {
    type: Number,
    required: false,
  },
  collectionAlias: {
    type: String,
    required: true,
  },
  firstCdmNumber: {
    type: Number,
    required: false,
  },
  lastCdmNumber: {
    type: Number,
    required: false,
  },

  created: { type: Date, default: Date.now },
});

mongoose.model('Batches', TransactionsSchema);
