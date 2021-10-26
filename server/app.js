const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');

const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(xss());

app.use(compression());

app.use(cors());
app.options('*', cors());

module.exports = app;