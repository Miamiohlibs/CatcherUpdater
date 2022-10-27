const { default: axios } = require('axios');
// const soap = require('soap');

class CatcherSoap {
  constructor(conf) {
    this.license = conf.licenseCode;
    this.serverUrl = conf.serverUrl;
  }

  DoEditRequest(cdmNumber, fieldname, value) {
    // axios.post(url: this.serverUrl})
    console.log(
      'edit' + cdmNumber + ' field: ' + fieldname + ' to be: ' + value
    );
  }
}

module.exports = CatcherSoap;
