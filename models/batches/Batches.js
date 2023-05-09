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
  successes: {
    type: Number,
    required: true,
  },
  failures: {
    type: Number,
    required: true,
  },
  collectionAlias: {
    type: String,
    required: true,
  },
  //   firstCdmNumber: {
  //     type: Number,
  //     required: false,
  //   },
  //   lastCdmNumber: {
  //     type: Number,
  //     required: false,
  //   },

  created: { type: Date, default: Date.now },
});

mongoose.model('Batches', TransactionsSchema);
