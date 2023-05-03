const axios = require('axios');
const csv = require('@fast-csv/parse');

let sheetId = '1fbs98T7BN0bl6bbAB-ELjNaigwLO0KCp'; // May 2023 test set
let url =
  'https://docs.google.com/spreadsheets/d/' + sheetId + '/export?format=csv';

(async () => {
  let res = await axios.get(url);
  let data = csv.parseString(res.data, { headers: true });
  data.forEach((row) => {
    // console.log(row);
    let fieldname = 'identi';
    let cdmAlias = '/BowdenTest';
    let cdmNumber = row['CONTENTdm number'];
    let value = row['Identifier'];
    console.log(fieldname, cdmAlias, cdmNumber, value);
  });

  // console.log(JSON.stringify(data, null, 2));
})();
