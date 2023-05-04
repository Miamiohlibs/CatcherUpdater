const config = require('config');
const CatcherSoap = require('./models/CatcherSoap');
let conf = config.get('catcher');
// console.log(conf);

let catcher = new CatcherSoap(conf);

let fieldname = 'identi';
let cdmAlias = '/BowdenTest';
// let cdmNumber = 608;
let cdmNumber = '12/01/2020';
let value = 'B-KY-PAR1-9_KenTest';

(async () => {
  try {
    let res = await catcher.DoEditRequest(
      cdmAlias,
      fieldname,
      cdmNumber,
      value
    );
    console.log(res);
  } catch (err) {
    console.log(err);
  }
  //   console.log(catcher.editSuccesses);
  //   console.log('-------------------');
  //   console.log(catcher.editFailures);
})();
