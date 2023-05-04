const fetchGoogleData = require('./models/fetchGoogleData');
const asyncForEach = require('./utilities/asyncForEach');
const config = require('config');
const CatcherSoap = require('./models/CatcherSoap');
let conf = config.get('catcher');

let catcher = new CatcherSoap(conf);
let successes = [];
let failures = [];

const start = async () => {
  // get data from google sheet
  let data = await fetchGoogleData();
  // console.log(data);
  data = data.filter((row) => row['CONTENTdm number'] > 630);

  await asyncForEach(data, async (row) => {
    // await waitFor(1000);
    console.log(row.Identifier);
    let fieldname = 'identi';
    let cdmAlias = '/BowdenTest';
    let cdmNumber = row['CONTENTdm number'];
    let value = row['Identifier'];
    try {
      // let res = await catcher.DoEditRequest(
      //   cdmAlias,
      //   fieldname,
      //   cdmNumber,
      //   value
      // );
      let res = cdmAlias + fieldname + cdmNumber + value;
      successes.push(res);
    } catch (err) {
      failures.push(err);
    }
  });
  console.log(successes);
  console.log('-------------------');
  console.log(failures);
};

start();
