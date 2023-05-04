const fetchGoogleData = require('./models/fetchGoogleData');
const config = require('config');
const axios = require('axios');
const csv = require('@fast-csv/parse');
const CatcherSoap = require('./models/CatcherSoap');
let conf = config.get('catcher');

let catcher = new CatcherSoap(conf);
let successes = [];
let failures = [];

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

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
      let res = await catcher.DoEditRequest(
        cdmAlias,
        fieldname,
        cdmNumber,
        value
      );
      // let res = cdmAlias + fieldname + cdmNumber + value;
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
