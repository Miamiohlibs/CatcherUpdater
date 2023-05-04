const fetchGoogleData = require('./models/fetchGoogleData');
const asyncForEach = require('./utilities/asyncForEach');
const config = require('config');
const CatcherSoap = require('./models/CatcherSoap');
let conf = config.get('catcher');
const TransactionApi = require('./models/transactions/TransactionApi');
const transactionApi = new TransactionApi();

let setup = {
  sheetId: '1fbs98T7BN0bl6bbAB-ELjNaigwLO0KCp',
  fieldName: 'identi',
  cdmAlias: '/BowdenTest',
  firstCdmNumber: 623,
  lastCdmNumber: 624,
};

let catcher = new CatcherSoap(conf);
let successes = [];
let failures = [];

const start = async ({
  sheetId,
  fieldName,
  cdmAlias,
  firstCdmNumber,
  lastCdmNumber,
}) => {
  // get data from google sheet
  let data = await fetchGoogleData(sheetId);
  // console.log(data);
  if (firstCdmNumber !== undefined) {
    data = data.filter((row) => row['CONTENTdm number'] >= firstCdmNumber);
  }
  if (lastCdmNumber !== undefined) {
    data = data.filter((row) => row['CONTENTdm number'] <= lastCdmNumber);
  }

  await asyncForEach(data, async (row) => {
    console.log(row.Identifier);
    // let fieldName = 'identi';
    // let cdmAlias = '/BowdenTest';
    let cdmNumber = row['CONTENTdm number'];
    let value = row['Identifier'];
    try {
      let res = await catcher.DoEditRequest(
        cdmAlias,
        fieldName,
        cdmNumber,
        value
      );
      // let res = cdmAlias + fieldName + cdmNumber + value;
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
    await transactionApi.insertMany(successes);
  }
  if (failures.length > 0) {
    failures.map((failure) => {
      failure.success = false;
    });
    await transactionApi.insertMany(failures);
  }
  console.log(successes);
  console.log('-------------------');
  console.log(failures);
};

start(setup);
