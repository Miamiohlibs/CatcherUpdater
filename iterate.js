const fetchGoogleData = require('./models/fetchGoogleData');
const asyncForEach = require('./utilities/asyncForEach');
const config = require('config');
const CatcherSoap = require('./models/CatcherSoap');
let conf = config.get('catcher');
const TransactionApi = require('./models/transactions/TransactionApi');
const transactionApi = new TransactionApi();

let setup = {
  // mode: 'edit', // edit mode makes changes to ContentDM
  mode: 'testing', // testing mode lists changes but does not make them
  sheetId: '1fbs98T7BN0bl6bbAB-ELjNaigwLO0KCp',
  fieldName: 'identi',
  cdmAlias: '/BowdenTest',
  // firstCdmNumber: 550,
  // lastCdmNumber: 609,
  firstSheetRow: 2,
  lastSheetRow: 5,
};

let catcher = new CatcherSoap(conf);
let successes = [];
let failures = [];

const start = async ({
  mode,
  sheetId,
  fieldName,
  cdmAlias,
  firstCdmNumber,
  lastCdmNumber,
  firstSheetRow,
  lastSheetRow,
}) => {
  // get data from google sheet
  let data = await fetchGoogleData(sheetId);
  // console.log(data);

  // filter data by row
  // note: offset by two because of header row and zero-indexing
  if (firstSheetRow !== undefined) {
    data = data.filter((value, rowIndex) => rowIndex + 2 >= firstSheetRow);
  }
  if (lastSheetRow !== undefined) {
    data = data.filter((value, rowIndex) => rowIndex + 2 <= lastSheetRow);
  }
  // filter data by CdM number
  if (firstCdmNumber !== undefined) {
    data = data.filter((row) => row['CONTENTdm number'] >= firstCdmNumber);
  }
  if (lastCdmNumber !== undefined) {
    data = data.filter((row) => row['CONTENTdm number'] <= lastCdmNumber);
  }

  // console.log(data);

  await asyncForEach(data, async (row) => {
    console.log(row.Identifier);
    // let fieldName = 'identi';
    // let cdmAlias = '/BowdenTest';
    let cdmNumber = row['CONTENTdm number'];
    let value = row['Identifier'];
    try {
      let res;
      if (mode === 'edit') {
        let res = await catcher.DoEditRequest(
          cdmAlias,
          fieldName,
          cdmNumber,
          value
        );
      } else if (mode === 'testing') {
        res = cdmAlias + fieldName + cdmNumber + value;
      }
      if (res.hasOwnProperty('msg')) {
        res.msg = catcher.cleanSoapResponse(res.msg);
      }
      successes.push(res);
    } catch (err) {
      failures.push(err);
    }
  });
  if (successes.length > 0) {
    successes.map((item) => {
      item.success = true;
    });
    if (mode === 'edit') {
      await transactionApi.insertMany(successes);
    }
  }
  if (failures.length > 0) {
    failures.map((failure) => {
      failure.success = false;
    });
    if (mode === 'edit') {
      await transactionApi.insertMany(failures);
    }
  }
  console.log(successes);
  console.log('-------------------');
  console.log(failures);
  process.exit();
};

start(setup);
