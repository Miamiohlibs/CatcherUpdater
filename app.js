const config = require('config');
const CatcherSoap = require('./models/CatcherSoap');
let conf = config.get('catcher');
// console.log(conf);

let catcher = new CatcherSoap(conf);

let fieldname = 'identi';
let cdmAlias = "/BowdenTest";
let cdmNumber = 7;
let value = 'horse in the house';

let res = catcher.DoEditRequest(cdmAlias, fieldname, cdmNumber, value);
console.log(res);