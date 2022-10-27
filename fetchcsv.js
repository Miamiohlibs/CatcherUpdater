const axios = require('axios');
const csvjson = require('csvjson');

let sheetId = '135kcWLvG2aGCIfTlF2LDej2vhZjBLPfgh-MobEscGSg'; // Amber's Test
// let sheetId = '14seQgOZq8dokT1ogG5KuQQHYS6KJYf2xz7IwIcyuGY8'; // Ken Test
let url =
  'https://docs.google.com/spreadsheets/d/' + sheetId + '/export?format=csv';

(async () => {
  let res = await axios.get(url);
  let opt = {
    delimiter: ',',
    quote: '"',
  };
  console.log(JSON.stringify(csvjson.toObject(res.data, opt), null, 2));
})();
