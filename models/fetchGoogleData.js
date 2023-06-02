const axios = require('axios');
const Papa = require('papaparse');
const Logger = require('../utilities/Logger');
const { parse } = require('dotenv');

const fetchGoogleData = async (sheetId) => {
  let url =
    'https://docs.google.com/spreadsheets/d/' + sheetId + '/export?format=csv';
  try {
    const response = await axios.get(url);
    if (response.headers['content-type'] != 'text/csv') {
      throw new Error(
        'Google did not return CSV data. May need increase permissions on Google Sheet.'
      );
    }
    const csvData = response.data;
    Logger.debug({
      message: 'received CSV data from Google',
      length: csvData.length,
    });
    const parsedData = Papa.parse(csvData, {
      header: true, // Assumes first row is header row
      dynamicTyping: true, // Converts strings to numbers, etc. when possible
      skipEmptyLines: true, // Skips empty rows
    }).data;
    Logger.debug({
      message: 'Google data parsed',
      length: parsedData.length,
    });
    Logger.silly({
      message: 'Google data parsed',
      fullContent: parsedData,
    });
    return { success: true, data: parsedData };
  } catch (error) {
    let errorMessage =
      error.message || error.response.status + ' ' + error.response.statusText;
    Logger.error({
      message: 'Error retrieving Google data:' + errorMessage,
    });
    return {
      success: false,
      error: `${errorMessage}`,
    };
  }
};

module.exports = fetchGoogleData;
