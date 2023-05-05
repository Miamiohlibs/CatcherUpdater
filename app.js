const CatcherEditService = require('./services/CatcherEditService');

let setup = {
  mode: 'edit', // edit mode makes changes to ContentDM
  //   mode: 'testing', // testing mode lists changes but does not make them
  sheetId: '1fbs98T7BN0bl6bbAB-ELjNaigwLO0KCp',
  fieldName: 'identi',
  fieldLabelInSheet: 'Identifier',
  cdmAlias: '/BowdenTest',
  firstCdmNumber: 528,
  lastCdmNumber: 529,
  // firstSheetRow: 2,
  // lastSheetRow: 5,
};

(async () => {
  const editor = new CatcherEditService(setup);
  await editor.fetchGoogleData();
  console.log(editor.data.length);
  editor.dataFilter();
  console.log(editor.data.length);
  await editor.sendCatcherRequests();
  editor.prepResponseStats();
  await editor.logResponsesToDatabase();
  editor.logResponseToConsole();
})();
