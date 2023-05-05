const config = require('config');
const colors = require('colors');
const fetchGoogleData = require('../models/fetchGoogleData');
const asyncForEach = require('../utilities/asyncForEach');
const TransactionApi = require('../models/transactions/TransactionApi');
const transactionApi = new TransactionApi();
const CatcherSoap = require('../models/CatcherSoap');
const catcherConf = config.get('catcher');
const catcher = new CatcherSoap(catcherConf);

class CatcherEditService {
  constructor(setup) {
    this.mode = setup.mode;
    this.sheetId = setup.sheetId;
    this.fieldName = setup.fieldName;
    this.fieldLabelInSheet = setup.fieldLabelInSheet;
    this.cdmAlias = setup.cdmAlias;
    this.firstCdmNumber = setup.firstCdmNumber || undefined;
    this.lastCdmNumber = setup.lastCdmNumber || undefined;
    this.firstSheetRow = setup.firstSheetRow || undefined;
    this.lastSheetRow = setup.lastSheetRow || undefined;
    this.data = [];
    this.successes = [];
    this.failures = [];
  }

  async fetchGoogleData() {
    this.data = await fetchGoogleData(this.sheetId);
    return;
  }

  dataFilter() {
    // filter data by row
    // note: offset by two because of header row and zero-indexing
    if (this.firstSheetRow !== undefined) {
      this.data = this.data.filter(
        (value, rowIndex) => rowIndex + 2 >= this.firstSheetRow
      );
    }
    if (this.lastSheetRow !== undefined) {
      this.data = this.data.filter(
        (value, rowIndex) => rowIndex + 2 <= this.lastSheetRow
      );
    }
    // filter data by CdM number
    if (this.firstCdmNumber !== undefined) {
      this.data = this.data.filter(
        (row) => row['CONTENTdm number'] >= this.firstCdmNumber
      );
    }
    if (this.lastCdmNumber !== undefined) {
      this.data = this.data.filter(
        (row) => row['CONTENTdm number'] <= this.lastCdmNumber
      );
    }
    return;
  }

  async sendCatcherRequests() {
    await asyncForEach(this.data, async (row) => {
      console.log(row[this.fieldLabelInSheet]);
      let cdmNumber = row['CONTENTdm number'];
      let value = row[this.fieldLabelInSheet];
      try {
        let res;
        if (this.mode === 'edit') {
          res = await catcher.DoEditRequest(
            this.cdmAlias,
            this.fieldName,
            cdmNumber,
            value
          );
        } else if (this.mode === 'testing') {
          res = this.cdmAlias + this.fieldName + cdmNumber + value;
        }
        if (res.hasOwnProperty('msg')) {
          res.msg = catcher.cleanSoapResponse(res.msg);
        }
        this.successes.push(res);
      } catch (err) {
        this.failures.push(err);
      }
    });
  }

  prepResponseStats() {
    if (this.mode == 'edit') {
      let batchNumber = Date.now();

      if (this.successes.length > 0) {
        this.successes.map((item) => {
          item.success = true;
          item.batch = batchNumber;
          item.collectionAlias = this.cdmAlias.substr(1);
        });
      }
      if (this.failures.length > 0) {
        this.failures.map((item) => {
          item.success = false;
          item.batch = batchNumber;
          item.collectionAlias = this.cdmAlias.substr(1);
        });
      }
    }
  }

  async logResponsesToDatabase() {
    if (this.mode == 'edit') {
      await transactionApi.insertMany(this.successes);
      await transactionApi.insertMany(this.failures);
    }
  }

  logResponseToConsole() {
    console.log(' Successes '.green.inverse);
    console.log(this.successes);
    console.log('-------------------');
    console.log(' Failures '.yellow.inverse);
    console.log(this.failures);
    console.log('-------------------');
    console.log(' Summary '.blue.inverse);
    console.log(`Successes: ${this.successes.length}`.green);
    console.log(`Failures: ${this.failures.length}`.yellow);
    process.exit();
  }
}

module.exports = CatcherEditService;