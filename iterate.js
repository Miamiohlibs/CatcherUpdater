const fetchGoogleData = require('./models/fetchGoogleData');
const asyncForEach = require('./utilities/asyncForEach');
const config = require('config');
const CatcherSoap = require('./models/CatcherSoap');
let conf = config.get('catcher');

let setup = {
  sheetId: '1fbs98T7BN0bl6bbAB-ELjNaigwLO0KCp',
  fieldName: 'identi',
  cdmAlias: '/BowdenTest',
  firstCdmNumber: 626,
  lastCdmNumber: 626,
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
  console.log(successes);
  console.log('-------------------');
  console.log(failures);
};

start(setup);
