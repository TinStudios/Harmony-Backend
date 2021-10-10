module.exports = (websockets, app, database) => {
    const argon2 = require('argon2');
    const { SignJWT } = require('jose/jwt/sign');
    const { importPKCS8 } = require('jose/key/import');

    app.get('/users/@me', async (req, res) => {
        if (await checkLogin(req.headers.authorization)) {
                database.query(`SELECT * FROM users`, async (err, dbRes) => {
                    if (!err) {
                        const user = dbRes.rows.find(x => x.token == req.headers.authorization);
                        res.send(Object.keys(user).reduce((obj, key, index) => key != "token" && key != "password" ? ({ ...obj, [key]: Object.keys(user).map(x => x == "guilds" ? JSON.parse(user[x]) : user[x])[index] }) : null, {}));
                    } else {
                        res.status(500).send({});
                    }
                });
        } else {
            res.status(401).send({});
        }
    });

    app.delete('/users/@me', async (req, res) => {
        if (await checkLogin(req.headers.authorization)) {
                database.query(`DELETE FROM users WHERE token = '${req.headers.authorization}'`, async (err, dbRes) => {
                    if (!err) {
                        res.send({});
                    } else {
                        res.status(500).send({});
                    }
                });
        } else {
            res.status(401).send({});
        }
    });

    app.patch('/users/@me', async (req, res) => {
        const userId = await checkLogin(req.headers.authorization);
        if (userId) {
            if ((req.body.username && req.body.username.length < 31) || req.body.password) {
                database.query(`SELECT * FROM users`, async (err, dbRes) => {
                    if (!err) {
                        const user = dbRes.rows.find(x => x.token == req.headers.authorization);
                        const discriminator = dbRes.rows.find(x => x.username == req.body.username && x.discriminator == user.discriminator) ? generateDiscriminator(dbRes.rows.filter(x => x.username == req.body.username)) : user.discriminator;
                        const token = req.body.password ? "Bearer " + await generateToken({ id: userId }) : user.token;
                        database.query(`UPDATE users SET username = $1, discriminator = $2, password = $3, token = $4 WHERE id = '${userId}'`, [req.body.username ?? user.username, discriminator, await argon2.hash(req.body.password, { type: argon2.argon2id }) ?? user.password, token], err => {
                            if (!err) {
                                const returnedUser = Object.keys(user).reduce((obj, key, index) => key != "token" && key != "password" ? ({ ...obj, [key]: Object.keys(user).map(x => x == "guilds" ? JSON.parse(user[x]) : user[x])[index] }) : null, {});
                                returnedUser.username = req.body.username;
                                returnedUser.discriminator = discriminator;
                                websockets[req.headers.authorization]?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: "userChange", id: userId, username: req.body.username }));
                                    if (req.body.password) {
                                        websocket.send(JSON.stringify({ event: "tokenChange", newToken: token }));
                                        websocket.terminate();
                                    }
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
        } else {
            res.status(401).send({});
        }
    });

    async function checkLogin(token) {
        return await new Promise(resolve => {
            database.query(`SELECT token FROM users`, async (err, res) => {
                if (!err) {
                    if (res.rows.map(x => x.token == token).includes(true)) {
                        try {
                            const { importSPKI } = require('jose/key/import');
                            const { jwtVerify } = require('jose/jwt/verify');

                            const ecPublicKey = await importSPKI(require('fs').readFileSync(__dirname  + '/../../public.key').toString(), 'ES256');

                            const info = await jwtVerify(token.split("Bearer ")[1], ecPublicKey, {
                                issuer: 'dot-studios',
                                audience: 'dot-studios'
                            });
                            resolve(info.payload.info.id);

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
        const privateKey = await importPKCS8(`-----BEGIN PRIVATE KEY-----
                    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgR252wNfLbo3OaP47
                    onGOGsL/YIj+iAUA/AK0dP6hW1WhRANCAAT6m/cL0d62FZFEWFjndgPpcNGlhqDp
                    2msc+XGMbRsgbL7YUxWFa60lNyc6UcCCZi/kZFeSarkAbClv6yNB4esV
                    -----END PRIVATE KEY-----`, 'ES256');
        return await new SignJWT({ info })
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuedAt()
            .setIssuer('dot-studios')
            .setAudience("dot-studios")
            .setExpirationTime('7d')
            .sign(privateKey);
    }
};