const axios = require('axios');
// const csv = require('@fast-csv/parse');
const Papa = require('papaparse');

const fetchGoogleData = async () => {
  let sheetId = '1fbs98T7BN0bl6bbAB-ELjNaigwLO0KCp'; // May 2023 test set
  let url =
    'https://docs.google.com/spreadsheets/d/' + sheetId + '/export?format=csv';
  //   let res = await axios.get(url);
  //   let data = csv.parseString(res.data, { headers: true });
  const response = await axios.get(url);
  const csvData = response.data;

  const parsedData = Papa.parse(csvData, {
    header: true, // Assumes first row is header row
    dynamicTyping: true, // Converts strings to numbers, etc. when possible
    skipEmptyLines: true, // Skips empty rows
  }).data;

  return parsedData;
};

module.exports = fetchGoogleData;
