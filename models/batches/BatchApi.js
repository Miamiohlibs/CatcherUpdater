const mongoose = require('mongoose');
const approot = require('app-root-path');
const db = require(approot + '/utilities/database');
require(approot + '/models/batches/Batches');
const Crud = mongoose.model('Batches');
const Logger = console; //require(approot + '/helpers/Logger');

module.exports = class BatchApi {
  async getBatches() {
    try {
      await db.connect();
      let batches = await Crud.find();
      await db.disconnect();
      return batches;
    } catch (err) {
      Logger.error({
        message: 'Error reading distinct batches',
        errorMessage: err.message,
        error: err,
      });
      return false;
    }
  }

  async getBatch(batchId) {
    try {
      await db.connect();
      let batch = await Crud.find({ batchId });
      await db.disconnect();
      return batch;
    } catch (err) {
      Logger.error({
        message: 'Error reading batch',
        errorMessage: err.message,
        error: err,
      });
      return false;
    }
  }

  async insertBatch(batch) {
    try {
      await db.connect();
      await Crud.create(batch);
      await db.disconnect();
      Logger.log('Batch saved');
      return true;
    } catch (err) {
      Logger.error({
        message: 'Error saving batch',
        errorMessage: err.message,
        error: err,
      });
      return false;
    }
  }
};
