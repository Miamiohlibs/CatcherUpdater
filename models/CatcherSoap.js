const soap = require('soap');

class CatcherSoap {
  constructor(conf) {
    this.license = conf.licenseCode;
    this.serverUrl = conf.serverUrl;
    this.endpoint = conf.endpoint;
    this.username = conf.username;
    this.password = conf.password;
  }

  DoEditRequest(cdmAlias, fieldname, cdmNumber, value) {
    //wrap data a million times
    var recordArray = {
      field: 'dmrecord',
      value: cdmNumber,
    };
    var textArray = {
      field: fieldname,
      value: value,
    };
    var metarray = [recordArray, textArray];
    var metadataWrapper = {
      metadataList: { metadata: metarray },
    };

    //prepare data for the request
    var url = this.endpoint;
    var args = {
      action: 'edit',
      cdmurl: this.serverUrl,
      username: this.username,
      password: this.password,
      license: this.license,
      collection: cdmAlias,
      metadata: metadataWrapper,
    };

    soap.createClient(url, {}, function (err, client) {
      client.processCONTENTdm(args, function (err, result) {
        console.log(result);
        let editSummary =
          'edit ' + cdmNumber + ' field: ' + fieldname + ' to be: ' + value;
        // let returnObject = { result, editSummary, err };
        if (result.return.includes('Error')) {
          err = result.return;
        }
        console.log('editSummary: ', editSummary);
        console.log('err: ', err);
      });
      //prints out generated xml for debugging (turn off for prod)
      //console.log('last request: ', client.lastRequest);
    });
  }
}

module.exports = CatcherSoap;
