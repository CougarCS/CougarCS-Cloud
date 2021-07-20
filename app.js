const express = require('express');
const cors = require('cors');
// const compression = require('compression');

const app = express()

app.use(express.json())
app.use(cors());
// app.use(compression());
app.use(express.urlencoded({ extended: false }));

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var contactRouter = require('./routes/contact');
var contactsRouter = require('./routes/contacts');

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/contact', contactRouter);
app.use('/contacts', contactsRouter);

// Default to 404 if Endpoint/Method Not Recognized
app.use((req, res, next) => {
  res.status(404);
  if (req.accepts('json')) res.json({ error: 'Not found' });
  else res.type('txt').send('Not found');
});


module.exports = app;
