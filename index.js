const TransactionsApi = require('./models/transactions/TransactionApi');
const transactionsApi = new TransactionsApi();
const config = require('config');
const defaults = config.get('defaults');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// use ejs for templating
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.ejs', { defaults: defaults });
});

app.post('/formsubmit', async (req, res) => {
  let startTime = new Date();
  console.log('form submit body', req.body);
  const CatcherController = require('./controllers/CatcherController');
  const catcherController = new CatcherController(req);
  //   const timeEstimate = await catcherController.getTimeEstimate();
  //   res.send(timeEstimate.toString());
  let { successes, failures } = await catcherController.processEdits();
  let endTime = new Date();
  let elapsedTime = (endTime - startTime) / 1000;
  res.render('output.ejs', {
    successes: successes,
    failures: failures,
    elapsedTime: elapsedTime,
  });
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
  res.render('logs.ejs', { transactions: transactions });
  // res.json(transactions);
});

app.get('/logs/:id', async (req, res) => {
  const transaction = await transactionsApi.getBatch(req.params.id);
  res.json(transaction);
});

app.listen(port, () => {
  console.log(`Catcher app listening at http://localhost:${port}`);
});
