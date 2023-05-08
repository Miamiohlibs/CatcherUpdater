const CatcherEditService = require('../services/CatcherEditService');

class CatcherController {
  constructor(req) {
    this.req = req;
    // this.res = res;
    this.clearEmptyFields();
  }

  clearEmptyFields() {
    if (this.req.body.firstCdmNumber === '') {
      this.req.body.firstCdmNumber = undefined;
    }
    if (this.req.body.lastCdmNumber === '') {
      this.req.body.lastCdmNumber = undefined;
    }
    if (this.req.body.firstSheetRow === '') {
      this.req.body.firstSheetRow = undefined;
    }
    if (this.req.body.lastSheetRow === '') {
      this.req.body.lastSheetRow = undefined;
    }
  }

  async processEdits() {
    const editor = new CatcherEditService(this.req.body);
    this.clearEmptyFields;
    await editor.fetchGoogleData();
    console.log(editor.data.length);
    editor.dataFilter();
    console.log(editor.data.length);
    await editor.sendCatcherRequests();
    editor.prepResponseStats();
    await editor.logResponsesToDatabase();
    return editor;
  }
}

module.exports = CatcherController;
