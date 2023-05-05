// basic express app
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// use ejs for templating
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.post('/formsubmit', (req, res) => {
  console.log(req.body);
  if (req.body.firstCdmNumber === '') {
    req.body.firstCdmNumber = undefined;
  }
  if (req.body.lastCdmNumber === '') {
    req.body.lastCdmNumber = undefined;
  }
  if (req.body.firstSheetRow === '') {
    req.body.firstSheetRow = undefined;
  }
  if (req.body.lastSheetRow === '') {
    req.body.lastSheetRow = undefined;
  }

  (async () => {
    const CatcherEditService = require('./services/CatcherEditService');
    const editor = new CatcherEditService(req.body);
    await editor.fetchGoogleData();
    console.log(editor.data.length);
    editor.dataFilter();
    console.log(editor.data.length);
    await editor.sendCatcherRequests();
    editor.prepResponseStats();
    await editor.logResponsesToDatabase();
    res.render('output.ejs', {
      successes: editor.successes,
      failures: editor.failures,
    });
  })();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
