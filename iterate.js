const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const config = require('config');
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

let data = [
  {
    Title: "Murray State Teachers' College",
    Identifier: 'B-KY-MUR1-8',
    'CONTENTdm number': '636',
  },
  {
    Title: 'Recto',
    Identifier: 'B-KY-MUR1-8_Recto',
    'CONTENTdm number': '637',
  },
  {
    Title: 'Verso',
    Identifier: 'B-KY-MUR1-8_Verso',
    'CONTENTdm number': '638',
  },
];

const start = async () => {
  await asyncForEach(data, async (row) => {
    // await waitFor(1000);
    // console.log(row.Identifier);
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

// (async () => {
//   await sleep(1000);
//   console.log('done');
// })();
