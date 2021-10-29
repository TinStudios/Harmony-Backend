const argon2 = require('argon2');
    const { SignJWT } = require('jose/jwt/sign');
    const { importPKCS8 } = require('jose/key/import');

module.exports = (websockets, app, database) => {
    app.get('/users/@me', async (req, res) => {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.token == req.headers.authorization);
                    let returnedUser = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {});
                    delete returnedUser['token'];
                    delete returnedUser['password'];
                    res.send(returnedUser);
                } else {
                    res.status(500).send({});
                }
            });
    });

    app.get('/users/*', async (req, res) => {
        const userId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.id == userId);
                    if (user) {
                        let returnedUser = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {});
                        delete returnedUser['token'];
                        delete returnedUser['password'];
                        res.send(returnedUser);
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
    });

    app.delete('/users/@me', async (req, res) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.id == res.locals.user);
            database.query(`DELETE FROM users WHERE token = '${req.headers.authorization}'`, async (err, dbRes) => {
                if (!err) {
                    let returnedUser = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {});
                    delete returnedUser['token'];
                    delete returnedUser['password'];
                         websockets.get(user.id)?.forEach(websocket => {
                        websocket.send(JSON.stringify({ event: 'userDeleted', user: returnedUser }));
                    });
                    res.send(returnedUser);
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(500).send({});
        }
    });
    });

    app.patch('/users/@me', async (req, res) => {
            if ((req.body.username && req.body.username.length < 31) || req.body.password) {
                database.query(`SELECT * FROM users`, async (err, dbRes) => {
                    if (!err) {
                        const discriminator = dbRes.rows.find(x => x.username == req.body.username && x.discriminator == user.discriminator) ? generateDiscriminator(dbRes.rows.filter(x => x.username == req.body.username)) : user.discriminator;
                        const token = req.body.password ? 'Bearer ' + await generateToken({ id: user.id }) : user.token;
                        database.query(`UPDATE users SET username = $1, discriminator = $2, password = $3, token = $4 WHERE id = $5`, [req.body.username ?? user.username, discriminator, await argon2.hash(req.body.password ?? user.password, { type: argon2.argon2id }), token, user.id], err => {
                            if (!err) {
                                const user = dbRes.rows.find(x => x.id == res.locals.user);
                                let returnedUser = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {});
                                delete returnedUser['token'];
                                delete returnedUser['password'];
                                returnedUser.username = req.body.username;
                                returnedUser.discriminator = discriminator;
        
                                     websockets.get(user.id)?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'userEdited', user: returnedUser }));
                                });
                                res.send(returnedUser);
                            } else {
                                res.status(500).send({});
                            }
                        });
                    } else {
                        res.status(500).send({});
                    }
                });
            } else {
                res.status(400).send({});
            }
    });

    function generateDiscriminator(excluded) {
        const pre = Math.floor(Math.random() * (9999 - 1 + 1) + 1);
        const final = pre.toString().padStart(4, '0');
        if (excluded.includes(final)) {
            return generateDiscriminator(excluded);
        } else {
            return final;
        }
    }

    async function generateToken(info) {
        const privateKey = await importPKCS8(require('fs').readFileSync(__dirname + '/../../../private.key').toString(), 'ES256');
        return await new SignJWT({ info })
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuedAt()
            .setIssuer('seltorn')
            .setAudience('seltorn')
            .setExpirationTime('7d')
            .sign(privateKey);
    }
};