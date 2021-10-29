const FlakeId = require('flakeid');
const flake = new FlakeId();
const config = require('../utils/config');

module.exports = (websockets, app, database) => {
    app.use('/icons', require('express').static(__dirname + '/../../icons'));

    require('./account')(websockets, app, database, flake);

    app.use(async (req, res, next) => {
        const user = await checkLogin(req.headers.authorization);
       if(user) {
                    res.locals.user = user.id;
                    next();
       } else {
           res.status(401).send({});
       }
    });

    require('./users')(websockets, app, database);

    require('./messages')(websockets, app, database, flake);

    require('./channels')(websockets, app, database, flake);

    require('./roles')(websockets, app, database, flake);

    require('./members')(websockets, app, database);

    require('./guilds')(websockets, app, database, flake);

    require('./friends')(websockets, app, database);

    app.use((req, res, next) => {
        res.status(404).send({});
    });

    app.use((err, req, res, next) => {
        res.status(500).send({});
    });

    async function checkLogin(token) {
        return await new Promise(resolve => {
            database.query(`SELECT * FROM users`, async (err, res) => {
                if (!err) {
                    if (res.rows.map(x => x.token == token).includes(true)) {
                        try {
                            const { importSPKI } = require('jose/key/import');
                            const { jwtVerify } = require('jose/jwt/verify');

                            const ecPublicKey = await importSPKI(require('fs').readFileSync(__dirname + '/../../public.key').toString(), 'ES256');

                            const info = await jwtVerify(token.split('Bearer ')[1], ecPublicKey, {
                                issuer: 'seltorn',
                                audience: 'seltorn'
                            });
                            resolve(res.rows.find(x => x.token == token));

                        } catch {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }
};