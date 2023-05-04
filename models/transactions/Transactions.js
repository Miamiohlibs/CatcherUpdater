const mongoose = require('mongoose');
const Scheme = mongoose.Schema;

const TransactionsSchema = new Scheme({
  msg: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
  },
  created: { type: Date, default: Date.now },
});

mongoose.model('Transactions', TransactionsSchema);
