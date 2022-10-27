const config = require('config');
const CatcherSoap = require('./models/CatcherSoap');
let conf = config.get('catcher');
// console.log(conf);

let catcher = new CatcherSoap(conf);

let cdmNumber = 1;
let fieldname = 'identi';
let value = 'i like fish';
let res = catcher.DoEditRequest(cdmNumber, fieldname, value);
console.log(res);
