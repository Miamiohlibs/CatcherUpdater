const axios = require('axios');
const Papa = require('papaparse');

const fetchGoogleData = async (sheetId) => {
  let url =
    'https://docs.google.com/spreadsheets/d/' + sheetId + '/export?format=csv';
  try {
    const response = await axios.get(url);
    const csvData = response.data;
    const parsedData = Papa.parse(csvData, {
      header: true, // Assumes first row is header row
      dynamicTyping: true, // Converts strings to numbers, etc. when possible
      skipEmptyLines: true, // Skips empty rows
    }).data;

    return { success: true, data: parsedData };
  } catch (error) {
    // console.error(error);
    return {
      success: false,
      error: `${error.response.status} ${error.response.statusText}`,
    };
  }
};

module.exports = fetchGoogleData;
