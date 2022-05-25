require('dotenv').config();

const Joi = require('joi');

const schema = Joi.object({
  // NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  NODE_ENV: Joi.string().valid('production', 'development').required(),
  SVR_PORT: Joi.number().default(3001),
  DB_USERNAME: Joi.string().default('cassandra'),
  DB_PASSWORD: Joi.string().default('cassandra'),
  STORAGE_DOMAIN: Joi.string().default('http://localhost:3001'),
  CLIENT_DOMAIN: Joi.string().default('http://localhost:3002'),
  STORAGE_API_KEY: Joi.string().required(),
  RECAPTCHA_SECRET_KEY: Joi.string().required()
})
  .unknown();

const { error, value } = schema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) console.error(error);

export default {
  env: value.NODE_ENV,
  server: {
    port: value.SVR_PORT,
  },
  client: {
    domain: value.CLIENT_DOMAIN
  },
  db: {
    username: value.DB_USERNAME,
    password: value.DB_PASSWORD,
  },
  storage: {
    domain: value.STORAGE_DOMAIN,
    apiKey: value.STORAGE_API_KEY
  },
  recaptcha: {
    secretKey: value.RECAPTCHA_SECRET_KEY
  }
};