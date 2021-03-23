const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const boxRouter = require('./routes/box');
const pushRouter = require('./routes/push');

const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb',extended: true }));
app.use(cors());

app.use(express.static(`${__dirname}/public`));

app.use(express.static(`${__dirname}/uploads`));

app.use('/api/v1/box', boxRouter);
app.use('/api/v1/push', pushRouter);

module.exports = app;
