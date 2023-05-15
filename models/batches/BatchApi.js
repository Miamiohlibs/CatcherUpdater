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
      Logger.log('getting batches');
      let batches = await Crud.find();
      Logger.log('got # batches', batches.length);
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
      Logger.log('getting batchId', batchId);
      let batch = await Crud.find({ batchId });
      Logger.log('batch', batch);
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
      Logger.log('inserting batch', batch);
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

  async updateBatch(batchId, updates) {
    try {
      await db.connect();
      Logger.log('updating batch', batchId, updates);
      let res = await Crud.updateOne(
        { batchId: batchId },
        { $set: { ...updates } },
        { upsert: false }
      );
      Logger.log('batch update results:', res);
      {
      }
      await db.disconnect();
      if (res.acknowledged) {
        Logger.log('Batch updated');
        return true;
      } else {
        Logger.error({
          message: 'Error updating batch',
          errorMessage: 'Batch not acknowledged',
        });
        return false;
      }
    } catch (err) {
      Logger.error({
        message: 'Error updating batch',
        errorMessage: err.message,
        error: err,
      });
      return false;
    }
  }
};
