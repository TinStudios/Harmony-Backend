import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
const xss = require('xss-clean');
import rateLimit from 'express-rate-limit';

const app = express();

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(xss());

app.use(compression());

app.use(cors());

app.use(rateLimit({
	windowMs: 5000,
	max: 25,
    message: { error: "You are sending way too many requests!" }
}));

export default app;