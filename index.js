const dotenv = require('dotenv').config();
const TransactionsApi = require('./models/transactions/TransactionApi');
const transactionsApi = new TransactionsApi();
const BatchApi = require('./models/batches/BatchApi');
const batchApi = new BatchApi();
const config = require('config');
const defaults = config.get('defaults');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// use ejs for templating
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.ejs', { defaults: defaults });
});

// app.post('/formsubmit', async (req, res) => {
//   let startTime = new Date();
//   console.log('form submit body', req.body);
//   const CatcherController = require('./controllers/CatcherController');
//   const catcherController = new CatcherController(req);
//   //   const timeEstimate = await catcherController.getTimeEstimate();
//   //   res.send(timeEstimate.toString());
//   let { successes, failures } = await catcherController.processEdits();
//   let endTime = new Date();
//   let elapsedTime = (endTime - startTime) / 1000;
//   res.render('output.ejs', {
//     successes: successes,
//     failures: failures,
//     elapsedTime: elapsedTime,
//     batch: req.body,
//   });
// });

app.post('/formsubmit', async (req, res) => {
  console.log('form submit body', req.body);
  const CatcherController = require('./controllers/CatcherController');
  const catcherController = new CatcherController(req);
  const timeEstimate = await catcherController.getTimeEstimate();
  let details = await catcherController.initializeBatch();
  details.timeEstimate = timeEstimate;
  res.render('confirm.ejs', { details: details, defaults: defaults });
  let { successes, failures } = await catcherController.processEdits();
});

app.post('/estimate', async (req, res) => {
  console.log('estimate body', req.body);
  const CatcherController = require('./controllers/CatcherController');
  const catcherController = new CatcherController(req);
  const timeEstimate = await catcherController.getTimeEstimate();
  let responseJson = { timeEstimate: timeEstimate };
  res.json(responseJson);
});

app.get('/logs', async (req, res) => {
  const transactions = await transactionsApi.getBatches();
  const batches = await batchApi.getBatches();
  // res.send(transactions);
  res.render('logs.ejs', {
    transactions: transactions,
    batches: batches,
    defaults: defaults,
  });
  // res.json(transactions);
});

app.get('/logs/:id', async (req, res) => {
  let referer = req.get('Referrer');
  console.log('referer', referer);
  let fromSubmit = false;
  let msgs = [];
  if (typeof referer !== 'undefined' && referer.match(/formsubmit/)) {
    fromSubmit = true;
  }
  console.log('fromSubmit', fromSubmit); // true if coming from a form submit
  const transactions = await transactionsApi.getBatch(req.params.id);
  let successes = transactions.filter((t) => t.success);
  let failures = transactions.filter((t) => !t.success);
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
});

app.post('/logs/search/', async (req, res) => {
  const results = await transactionsApi.findInQuery(req.body.query);
  res.render('search', { query: req.body.query, results: results, defaults });
});

app.get('/logs/check/:id', async (req, res) => {
  // returns true if success value set, can be zero
  const batchArr = await batchApi.getBatch(req.params.id);
  if (batchArr.length === 0) {
    res.send({ complete: false, message: 'Batch not found' });
  } else {
    const batch = batchArr[0];
    console.log(batch);
    if (typeof batch.successes === 'undefined') {
      res.send({ complete: false, message: 'Batch not complete' });
    } else {
      res.send({ complete: true });
    }
  }
});

app.listen(port, () => {
  console.log(`Catcher app listening at http://localhost:${port}`);
});
