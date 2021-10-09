module.exports = (websockets, app, database, flake) => {
    const argon2 = require('argon2');
    const { SignJWT } = require('jose/jwt/sign');
    const { importPKCS8 } = require('jose/key/import');

    app.post('/login', (req, res) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.email == req.body.email);
                if (user) {
                    try {
                        if (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id })) {
                            const oldToken = user.token;
                            const token = "Bearer " +  await generateToken({ id: user.id });
                            database.query(`UPDATE users SET token = '${token}' WHERE id = '${user.id}'`, err => {
                                if (!err) {
                                    if (websockets.has(oldToken)) {
                                        websockets.get(oldToken).forEach(websocket => {
                                            websocket.send(JSON.stringify({ event: "tokenChange", newToken: token }));
                                            websocket.terminate();
                                        });
                                        websockets[token] = websockets[oldToken];
                                        delete websockets[oldToken];
                                    }
                                    res.send({ token: token });
                                } else {
                                    res.status(500).send({});
                                }
                            });
                        } else {
                            res.status(401).send({});
                        }
                    } catch {
                        res.status(500).send({});
                    }
                } else {
                    res.status(401).send({});
                }
            } else {
                res.status(500).send({});
            }
        });
    });

    app.post('/register', (req, res) => {
        if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email) && req.body.username && req.body.username.length < 31 && req.body.password) {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    if (!dbRes.rows.find(x => x.email == req.body.email)) {
                        const id = flake.gen().toString();
                        const password = await argon2.hash(req.body.password, { type: argon2.argon2id });
                        const token = "Bearer " +  await generateToken({ id: id });
                        const discriminator = generateDiscriminator(dbRes.rows.filter(x => x.username == req.body.username).map(x => x.discriminator) ?? []);
                        database.query(`INSERT INTO users (id, token, email, password, username, discriminator, creation, guilds) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [id, token, req.body.email, password, req.body.username, discriminator, Date.now(), '[]'], (err, dbRes) => {
                            if (!err) {
                                res.status(200).send({ token: token });
                            } else {
                                res.status(500).send({});
                            }
                        });
                    } else {
                        res.status(401).send({});
                    }
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