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

app.post('/formsubmit', async (req, res) => {
  console.log(req.body);
  const CatcherController = require('./controllers/CatcherController');
  const catcherController = new CatcherController(req);
  let { successes, failures } = await catcherController.processEdits();
  res.render('output.ejs', {
    successes: successes,
    failures: failures,
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
