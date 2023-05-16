const mongoose = require('mongoose');
const approot = require('app-root-path');
const db = require(approot + '/utilities/database');
require(approot + '/models/transactions/Transactions');
const Crud = mongoose.model('Transactions');
const Logger = console; //require(approot + '/helpers/Logger');

module.exports = class TransactionApi {
  async insert(msg, query, success) {
    let transaction = new Crud({
      msg,
      query,
      success,
    });
    try {
      // await db.connect();
      await transaction.save();
      // await db.disconnect();
      Logger.log('Transaction saved', transaction);
      return transaction;
    } catch (err) {
      Logger.error({
        message: 'Error saving transaction',
        errorMessage: err.message,
        error: err,
        transaction,
      });
      return false;
    }
  }

  async insertMany(transactions) {
    try {
      // await db.connect();
      await Crud.insertMany(transactions);
      // await db.disconnect();
      Logger.log('Transactions saved', transactions.length);
      return true;
    } catch (err) {
      Logger.error({
        message: 'Error connecting to database',
        errorMessage: err.message,
        error: err,
      });
      return false;
    }
  }

  async read(query) {
    try {
      // await db.connect();
      let transactions = await Crud.find(query);
      // await db.disconnect();
      Logger.log('Transactions read');
      return transactions;
    } catch (err) {
      Logger.error({
        message: 'Error reading transactions',
        errorMessage: err.message,
        error: err,
      });
      return false;
    }
  }

  async getBatches() {
    try {
      // await db.connect();
      Logger.log('getting batches');
      let transactions = await Crud.distinct('batch');
      Logger.log('got # batches', transactions.length);
      // await db.disconnect();
      return transactions;
    } catch (err) {
      Logger.error({
        message: 'Error reading distinct transactions',
        errorMessage: err.message,
        error: err,
      });
      return false;
    }
  }

  async getBatch(batch) {
    try {
      // await db.connect();
      Logger.log('getting batch', batch);
      let transactions = await Crud.find({ batch: batch });
      Logger.log('got batch of# transactions', transactions.length);
      // await db.disconnect();
      return transactions;
    } catch (err) {
      Logger.error({
        message: 'Error reading transactions',
        errorMessage: err.message,
        error: err,
      });
      return false;
    }
  }

  async findInField(field, value) {
    // await db.connect();
    let transactions = await Crud.find({
      [field]: {
        $regex: value,
      },
    });
    // await db.disconnect();
    return transactions;
  }

  async findInQuery(value) {
    Logger.log('finding value in query:', value);
    return await this.findInField('query', value);
  }
};
