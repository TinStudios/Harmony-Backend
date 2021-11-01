import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
const xss = require('xss-clean');

const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(xss());

app.use(compression());

app.use(cors());
<<<<<<< HEAD
=======
app.options('*', cors);
>>>>>>> 0718f96 (Changed to TypeScript)

export default app;