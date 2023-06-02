const soap = require('soap');
const Logger = require('../utilities/Logger');

class CatcherSoap {
  constructor(conf) {
    this.license = conf.licenseCode;
    this.serverUrl = conf.serverUrl;
    this.endpoint = conf.endpoint;
    this.username = conf.username;
    this.password = conf.password;
  }

  CreateEditArgs(cdmAlias, fieldname, cdmNumber, value) {
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
    var args = {
      action: 'edit',
      cdmurl: this.serverUrl,
      username: this.username,
      password: this.password,
      license: this.license,
      collection: cdmAlias,
      metadata: metadataWrapper,
    };
    return args;
  }

  async DoEditRequest(cdmAlias, fieldname, cdmNumber, value) {
    let url = this.endpoint;
    let args = this.CreateEditArgs(cdmAlias, fieldname, cdmNumber, value);
    let querySummary =
      'Edit collection: ' +
      cdmAlias +
      '; cdmNumber:' +
      cdmNumber +
      '; set field: ' +
      fieldname +
      ' to be: ' +
      value;
    // let query = { cdmAlias, fieldname, cdmNumber, value };
    return await this.DoSoapRequest(url, args, querySummary);
  }

  DoSoapRequest(url, args, querySummary) {
    return new Promise((resolve, reject) => {
      soap.createClient(url, {}, function (err, client) {
        client.processCONTENTdm(args, function (err, result) {
          // console.log(result);
          if (result.return.includes('Error')) {
            Logger.error({
              message: 'Soap Request failed: ' + result.return,
              query: querySummary,
            });
            return reject({ msg: result.return, query: querySummary });
          } else {
            Logger.debug({
              message: 'SOAP query success: ' + result.return,
              query: querySummary,
            });
            return resolve({ msg: result.return, query: querySummary });
          }
        });
        //prints out generated xml for debugging (turn off for prod)
        //console.log('last request: ', client.lastRequest);
      });
    });
  }
  cleanSoapResponse(msg) {
    msg = msg.replace(/Warning: This service.*/, '');
    return msg;
  }
}

module.exports = CatcherSoap;
