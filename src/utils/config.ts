require('dotenv').config();

const Joi = require('joi');

const schema = Joi.object({
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 332c1ca (owo)
  // NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
  NODE_ENV: Joi.string().valid('production', 'development').required(),
  SVR_PORT: Joi.number().default(3001),
  DB_USER: Joi.string().default('postgres'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PASSWORD: Joi.string().default(''),
  DB_DATABASE: Joi.string().default('postgres'),
  DB_PORT: Joi.number().default(5432),
<<<<<<< HEAD
  CLIENT_DOMAIN: Joi.string().default('http://localhost:3001'),
  STORAGE_API_KEY: Joi.string().required()
})
=======
    // NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    NODE_ENV: Joi.string().valid('production', 'development').required(),
    SVR_PORT: Joi.number().default(3001),
    DB_USER: Joi.string().default('postgres'),
    DB_HOST: Joi.string().default('localhost'),
    DB_PASSWORD: Joi.string().default(''),
    DB_DATABASE: Joi.string().default('postgres'),
    DB_PORT: Joi.number().default(5432),
    CLIENT_DOMAIN: Joi.string().default('http://localhost:3001')
  })
>>>>>>> 0718f96 (Changed to TypeScript)
=======
  CLIENT_DOMAIN: Joi.string().default('http://localhost:3001')
})
>>>>>>> 332c1ca (owo)
  .unknown();

const { error, value } = schema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) console.error(error);

export default {
  env: value.NODE_ENV,
  server: {
    port: value.SVR_PORT,
  },
<<<<<<< HEAD
<<<<<<< HEAD
  client: {
    domain: value.CLIENT_DOMAIN
  },
=======
>>>>>>> 0718f96 (Changed to TypeScript)
=======
  client: {
    domain: value.CLIENT_DOMAIN
  },
>>>>>>> b2c0254 (some fixes)
  db: {
    user: value.DB_USER,
    host: value.DB_HOST,
    password: value.DB_PASSWORD,
    database: value.DB_DATABASE,
    port: value.DB_PORT,
<<<<<<< HEAD
  },
  storage: {
    apiKey: value.STORAGE_API_KEY
=======
>>>>>>> 0718f96 (Changed to TypeScript)
  }
};