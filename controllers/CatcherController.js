const CatcherEditService = require('../services/CatcherEditService');

class CatcherController {
  constructor(req) {
    this.req = req;
    this.clearEmptyFields();
    this.editor = new CatcherEditService(this.req.body);
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

  async getTimeEstimate() {
    await this.editor.fetchGoogleData();
    this.editor.dataFilter();
    return this.editor.data.length;
  }

  async processEdits() {
    await this.editor.fetchGoogleData();
    this.editor.dataFilter();
    await this.editor.sendCatcherRequests();
    this.editor.prepResponseStats();
    await this.editor.logResponsesToDatabase();
    return this.editor;
  }
}

module.exports = CatcherController;
