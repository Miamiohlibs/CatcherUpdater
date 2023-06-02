const dotenv = require('dotenv').config();
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const TransactionsApi = require('./models/transactions/TransactionApi');
const transactionsApi = new TransactionsApi();
const BatchApi = require('./models/batches/BatchApi');
const batchApi = new BatchApi();
const config = require('config');
const defaults = config.get('defaults');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
const Logger = console; //require('./helpers/Logger');
const db = require('./utilities/database');

/* content secuirity policy and related headers */
const cspPolicy = require('./utilities/contentSecurityPolicy');
app.use(helmet.frameguard());
app.use(helmet.contentSecurityPolicy({ directives: cspPolicy }));

global.onServer =
  config.has('defaults.onServer') && config.get('defaults.onServer') === true;
Logger.debug('On Server: ' + global.onServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// use ejs for templating
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  Logger.log('GET /');
  res.render('index.ejs', { defaults: defaults });
});

app.post('/formsubmit', async (req, res) => {
  Logger.log('POST /formsubmit');
  Logger.log('form submit body', req.body);
  await db.connect();
  const CatcherController = require('./controllers/CatcherController');
  const catcherController = new CatcherController(req);
  const timeEstimate = await catcherController.getTimeEstimate();
  if (timeEstimate.success === false) {
    res.render('errors', { errors: timeEstimate.errors, defaults: defaults });
    return;
  }
  let details = await catcherController.initializeBatch();
  details.timeEstimate = timeEstimate.time;
  res.render('confirm.ejs', { details: details, defaults: defaults });
  let { successes, failures } = await catcherController.processEdits();
  // await db.disconnect();
});

app.post('/estimate', async (req, res) => {
  Logger.log('POST /estimate');
  Logger.log('estimate body', req.body);
  await db.connect();
  const CatcherController = require('./controllers/CatcherController');
  const catcherController = new CatcherController(req);
  const timeEstimate = await catcherController.getTimeEstimate();
  let responseJson = { timeEstimate: timeEstimate };
  res.json(responseJson);
  // await db.disconnect();
});

app.get('/logs', async (req, res) => {
  Logger.log('GET /logs');
  await db.connect();
  const transactions = await transactionsApi.getBatches();
  const batches = await batchApi.getBatches();
  // res.send(transactions);
  res.render('logs.ejs', {
    transactions: transactions,
    batches: batches,
    defaults: defaults,
  });
  // await db.disconnect();
});

app.get('/logs/:id', async (req, res) => {
  Logger.log(`GET /logs/${req.params.id}`);
  await db.connect();
  let referer = req.get('Referrer');
  Logger.log('referer', referer);
  let fromSubmit = false;
  let msgs = [];
  let successes = [];
  let failures = [];
  if (typeof referer !== 'undefined' && referer.match(/formsubmit/)) {
    fromSubmit = true;
  }
  Logger.log('fromSubmit', fromSubmit); // true if coming from a form submit
  const transactions = await transactionsApi.getBatch(req.params.id);
  if (!Array.isArray(transactions)) {
    msgs.push({
      msg: `Database query failed. Try reloading page.`,
      type: 'danger',
    });
  } else {
    successes = transactions.filter((t) => t.success);
    failures = transactions.filter((t) => !t.success);
  }
  batchId = req.params.id;
  let batch = await batchApi.getBatch(batchId);
  if (batch.length === 0) {
    msgs.push({ msg: `Batch ${batchId} not found`, type: 'danger' });
  }
  res.render('output', {
    successes,
    failures,
    batch,
    fromSubmit,
    defaults,
    msgs,
  });
  // await db.disconnect();
});

app.post('/logs/search/', async (req, res) => {
  Logger.log('POST /logs/search');
  await db.connect();
  const results = await transactionsApi.findInQuery(req.body.query);
  res.render('search', { query: req.body.query, results: results, defaults });
  // await db.disconnect();
});

app.get('/logs/check/:id', async (req, res) => {
  Logger.log(`GET /logs/check/${req.params.id}`);
  await db.connect();
  // returns true if success value set, can be zero
  const batchArr = await batchApi.getBatch(req.params.id);
  if (batchArr === false || batchArr.length === 0) {
    res.send({ complete: false, message: 'Batch not found' });
  } else {
    const batch = batchArr[0];
    Logger.log(batch);
    if (typeof batch.successes === 'undefined') {
      returnObj = { complete: false, message: 'Batch not complete' };
    } else {
      returnObj = { complete: true };
    }
    Logger.log(returnObj);
    res.send(returnObj);
  }
  // await db.disconnect();
});

if (global.onServer === true) {
  const server = config.get('server');

  https
    .createServer(
      {
        key: fs.readFileSync(server.key),
        cert: fs.readFileSync(server.cert),
      },
      app
    )
    .listen(PORT, function () {
      console.log(
        `Catcher app listening on port ${PORT}! Go to https://${server.hostname}:${PORT}/`
      );
    });
} else {
  app.listen(PORT, function () {
    console.log(
      `Catcher app listening on port ${PORT}! Go to http://localhost:${PORT}/`
    );
  });
}
