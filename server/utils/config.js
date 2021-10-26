require('dotenv').config();

const Joi = require('joi');

const schema = Joi.object({
    // NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    NODE_ENV: Joi.string().valid('production', 'development').required(),
    SVR_PORT: Joi.number().default(3001),
    WS_HOST: Joi.string().default('localhost'),
    WS_PORT: Joi.number().default(3000),
    WS_KEY: Joi.string().required(),
    DB_USER: Joi.string().default('postgres'),
    DB_HOST: Joi.string().default('localhost'),
    DB_PASSWORD: Joi.string().default(''),
    DB_DATABASE: Joi.string().default('postgres'),
    DB_PORT: Joi.number().default(5433),
  })
  .unknown();

const { error, value } = schema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) console.error(error);

module.exports = {
  env: value.NODE_ENV,
  server: {
    port: value.SVR_PORT,
  },
  ws: {
    host: value.WS_HOST,
    port: value.WS_PORT,
    key: value.WS_KEY,
  },
  db: {
    user: value.DB_USER,
    host: value.DB_HOST,
    password: value.DB_PASSWORD,
    database: value.DB_DATABASE,
    port: value.DB_PORT,
  }
};