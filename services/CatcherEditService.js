const config = require('config');
const colors = require('colors');
const fetchGoogleData = require('../models/fetchGoogleData');
const asyncForEach = require('../utilities/asyncForEach');
const TransactionApi = require('../models/transactions/TransactionApi');
const transactionApi = new TransactionApi();
const BatchApi = require('../models/batches/BatchApi');
const batchApi = new BatchApi();
const CatcherSoap = require('../models/CatcherSoap');
const catcherConf = config.get('catcher');
const catcher = new CatcherSoap(catcherConf);

class CatcherEditService {
  constructor(setup) {
    this.batchId = new Date().getTime().toString();
    console.log('batchId', this.batchId, typeof this.batchId);
    this.mode = setup.mode;
    this.user = setup.user;
    this.sheetId = setup.sheetId;
    this.fieldName = setup.fieldName;
    this.fieldLabelInSheet = setup.fieldLabelInSheet;
    this.cdmAlias = setup.cdmAlias;
    this.batchName = setup.batchName;
    this.firstCdmNumber = setup.firstCdmNumber || undefined;
    this.lastCdmNumber = setup.lastCdmNumber || undefined;
    this.firstSheetRow = setup.firstSheetRow || undefined;
    this.lastSheetRow = setup.lastSheetRow || undefined;
    this.data = [];
    this.successes = [];
    this.failures = [];
    this.allCdms = [];
    this.errors = [];
  }

  async submitInitialLog() {
    let batchInit = {
      batchId: this.batchId,
      batchName: this.batchName,
      user: this.user,
      collectionAlias: this.cdmAlias,
    };
    if (this.firstCdmNumber !== undefined) {
      batchInit.firstCdmNumber = this.firstCdmNumber;
    }
    if (this.lastCdmNumber !== undefined) {
      batchInit.lastCdmNumber = this.lastCdmNumber;
    }
    if (this.firstSheetRow !== undefined) {
      batchInit.firstSheetRow = this.firstSheetRow;
    }
    if (this.lastSheetRow !== undefined) {
      batchInit.lastSheetRow = this.lastSheetRow;
    }
    await batchApi.insertBatch(batchInit);
    return;
  }

  async fetchGoogleData() {
    let res = await fetchGoogleData(this.sheetId);
    if (res.success) {
      this.data = res.data;
      // console.log('Google Sheet data', this.data);
    } else {
      this.errors.push({
        message:
          `Error fetching Google Sheet data with id:<br>${this.sheetId}<br><br> ` +
          res.error,
        hint: 'Check that the sheet id is correct and that sheet is shared with anyone with the URL.',
      });
      console.log('error fetching Google sheet:', res.error);
    }
    return;
  }

  dataFilter() {
    // filter data by row
    // note: offset by two because of header row and zero-indexing
    // limit to just index, fieldToChange, and cdm number
    this.data = this.data.map((row, index) => {
      return { index: index, ...row };
    });

    if (this.firstSheetRow !== undefined) {
      this.firstRowIndex = this.firstSheetRow - 2;
      this.data = this.data.filter((row) => row.index >= this.firstRowIndex);
    }
    // console.log('after first row filter', this.data.length);
    if (this.lastSheetRow !== undefined) {
      this.lastRowIndex = this.lastSheetRow - 2;
      this.data = this.data.filter((row) => row.index <= this.lastRowIndex);
    }
    // console.log('after last row filter', this.data.length);
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
      // console.log(row[this.fieldLabelInSheet]);
      let cdmNumber = row['CONTENTdm number'];
      this.allCdms.push(cdmNumber);
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
        // console.log(colors.green('success', res));
      } catch (err) {
        this.failures.push(err);
      }
    });
  }

  prepResponseStats() {
    if (this.mode == 'edit') {
      if (this.successes.length > 0) {
        this.successes.map((item) => {
          item.success = true;
          item.batch = this.batchId;
          item.collectionAlias = this.cdmAlias.substr(1);
        });
      }
      if (this.failures.length > 0) {
        this.failures.map((item) => {
          item.success = false;
          item.batch = this.batchId;
          item.collectionAlias = this.cdmAlias.substr(1);
        });
      }
    }
  }

  async updateLog() {
    if (this.mode == 'edit') {
      await transactionApi.insertMany(this.successes);
      await transactionApi.insertMany(this.failures);
      let allRecords = this.successes.concat(this.failures);
      // console.log('this.successes', this.successes);
      // console.log('this.failures', this.failures);
      // console.log('allCdms', this.allCdms);
      if (this.firstCdmNumber === undefined) {
        this.firstCdmNumber = Math.min(...this.allCdms);
      }
      if (this.lastCdmNumber === undefined) {
        this.lastCdmNumber = Math.max(...this.allCdms);
      }
      // console.log('firstCdmNumber', this.firstCdmNumber);
      // console.log('lastCdmNumber', this.lastCdmNumber);
      // console.log(`line 160: ${this.batchId}`.red, typeof this.batchId);
      await batchApi.updateBatch(this.batchId, {
        successes: this.successes.length,
        failures: this.failures.length,
        collectionAlias: this.cdmAlias.substr(1),
        firstCdmNumber: this.firstCdmNumber,
        lastCdmNumber: this.lastCdmNumber,
      });
    }
  }

  // logResponseToConsole() {
  //   console.log(' Successes '.green.inverse);
  //   console.log(this.successes);
  //   console.log('-------------------');
  //   console.log(' Failures '.yellow.inverse);
  //   console.log(this.failures);
  //   console.log('-------------------');
  //   console.log(' Summary '.blue.inverse);
  //   console.log(`Successes: ${this.successes.length}`.green);
  //   console.log(`Failures: ${this.failures.length}`.yellow);
  //   process.exit();
  // }
}

module.exports = CatcherEditService;
