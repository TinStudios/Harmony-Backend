import { Info, ReturnedUser, User } from "interfaces";

import express from "express";
import { SignJWT } from 'jose/jwt/sign';
import { importPKCS8 } from 'jose/key/import';
import { Client } from 'pg';
import crypto from 'crypto';
import mime from 'mime-types';
import multer from "multer";
import { NFTStorage, File } from 'nft.storage';
const upload = multer({ storage: multer.memoryStorage() });

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, storage: NFTStorage) => {
    app.get('/bots', (req: express.Request, res: express.Response) => {
        database.query('SELECT * FROM users', (err, dbRes) => {
            if (!err) {
                const bots = dbRes.rows.filter(x => x?.owner === res.locals.user);
                res.send(bots.map(x => {
                    delete x.email;
                    delete x.password;
                    delete x.owner;
                    delete x.verified;
                    delete x.verificator;
                    delete x.otp;
                    x.creation = Number(x.creation);
                    return x;
                }));
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.post('/bots', (req: express.Request, res: express.Response) => {
        if (req.body.username && req.body.username.length < 31) {
            database.query('SELECT * FROM users', async (err, dbRes) => {
                if (!err) {
                    const id = crypto.randomUUID();
                    const token = 'Bot ' + await generateToken({ id: id });
                    const discriminator = generateDiscriminator(dbRes.rows.filter(x => x.username === req.body.username).map(x => x.discriminator) ?? []);
                    const creation = Date.now();
                    database.query('INSERT INTO users (id, token, email, password, username, discriminator, creation, type, owner, verified, verificator, otp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)', [id, token, '', '', req.body.username, discriminator, creation, 'BOT', res.locals.user, true, '', ''], (err, dbRes) => {
                        if (!err) {
                            const returnedBot = {
                                id: id,
                                token: token,
                                username: req.body.username,
                                discriminator: discriminator,
                                creation: creation,
                                type: "BOT"
                            };
                            websockets.get(res.locals.user)?.forEach(websocket => {
                                websocket.send(JSON.stringify({ event: 'botCreated', bot: returnedBot }));
                            });
                            res.status(201).send(returnedBot);
                        } else {
                            res.status(500).send({ error: "Something went wrong with our server." });
                        }
                    });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.get('/bots/*', (req: express.Request, res: express.Response) => {
        const botId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query('SELECT * FROM users', (err, dbRes) => {
            if (!err) {
                const bot = dbRes.rows.find(x => x?.type === 'BOT' && x?.id === botId);
                if (bot) {
                    const { token, email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                    returnedBot.creation = Number(bot.creation);
                    res.send(returnedBot);
                } else {
                    res.status(404).send({ error: "Not found." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.patch('/bots/*', (req: express.Request, res: express.Response) => {
        const botId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (req.body.username && req.body.username.length < 31) {
            database.query('SELECT * FROM users', async (err, dbRes) => {
                if (!err) {
                    const bot = dbRes.rows.find(x => x?.owner === res.locals.user && x?.id === botId);
                    if (bot) {
                        database.query('UPDATE users SET username = $1 WHERE id = $2', [req.body.username, botId], err => {
                            if (!err) {
                                const { email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                                returnedBot.creation = Number(bot.creation);
                                returnedBot.username = req.body.username;
                                websockets.get(res.locals.user)?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'botEdited', bot: returnedBot }));
                                });
                                res.send(returnedBot);
                            }
                        });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/bots/*/icon', upload.single('icon'), (req: express.Request, res: express.Response) => {
        const botId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query('SELECT * FROM users', async (err, dbRes) => {
            if (!err) {
                const bot = dbRes.rows.find(x => x?.owner === res.locals.user && x?.id === botId);
                if (bot) {
                    if (req.file) {
                        if (mime.extension(req.file?.mimetype ?? '') === 'png') {
                            const icon = await storage.store({
                                name: bot.id + '\'s avatar',
                                description: 'Seltorn\'s ' + bot.id + ' avatar',
                                image: new File([req.file.buffer], bot.id + '.png', { type: 'image/png' })
                            });
                            database.query('INSERT INTO files (id, type, url) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET url = $3', [bot.id, 'users', icon.url], (err, dbRes) => {
                                if (!err) {
                                    const { email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                                    returnedBot.creation = Number(bot.creation);
                                    res.send(returnedBot);
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
                        } else {
                            res.status(400).send({ error: "We only accept PNG." });
                        }
                    } else {
                        database.query('SELECT * FROM files', (err, dbRes) => {
                            if (!err) {
                                if (dbRes.rows.find(x => x.id === bot.id && x.type === 'users')) {
                                    database.query('DELETE FROM files WHERE id = $1', [bot.id], async (err, dbRes) => {
                                        if (!err) {
                                            const { email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                                            returnedBot.creation = Number(bot.creation);
                                            res.send(returnedBot);
                                        } else {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                        }
                                    });
                                } else {
                                    res.status(400).send({ error: "Something is missing or it's not appropiate." });
                                }
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    }
                } else {
                    res.status(403).send({ error: "Missing permission." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." })
            }
        });
    });

    app.delete('/bots/*', (req: express.Request, res: express.Response) => {
        const botId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query('SELECT * FROM users', async (err, dbRes) => {
            if (!err) {
                const bot = dbRes.rows.find(x => x?.owner === res.locals.user && x?.id === botId);
                if (bot) {
                    database.query('DELETE FROM users WHERE id = $1', [botId], async (err, dbRes) => {
                        if (!err) {
                            websockets.get(res.locals.user)?.forEach(websocket => {
                                websocket.send(JSON.stringify({ event: 'botDeleted', bot: botId }));
                            });
                            res.send({});
                        } else {
                            res.status(500).send({ error: "Something went wrong with our server." });
                        }
                    });
                } else {
                    res.status(403).send({ error: "Missing permission." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.post('/bots/*/reset', (req: express.Request, res: express.Response) => {
        const botId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query('SELECT * FROM users', async (err, dbRes) => {
            if (!err) {
                const bot = dbRes.rows.find(x => x?.owner === res.locals.user && x?.id === botId);
                if (bot) {
                    const token = 'Bot ' + await generateToken({ id: botId });
                    database.query('UPDATE users SET token = $1 WHERE id = $2', [token, botId], err => {
                        if (!err) {
                            const { email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                            returnedBot.token = token;
                            returnedBot.creation = Number(bot.creation);
                            websockets.get(res.locals.user)?.forEach(websocket => {
                                websocket.send(JSON.stringify({ event: 'botReset', bot: returnedBot }));
                            });
                            res.send(returnedBot);
                        }
                    });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    function generateDiscriminator(excluded: string[]): string {
        const pre = Math.floor(Math.random() * (9999 - 1 + 1) + 1);
        const final = pre.toString().padStart(4, '0');
        if (excluded.includes(final)) {
            return generateDiscriminator(excluded);
        } else {
            return final;
        }
    }

    async function generateToken(info: Info) {
        const privateKey = await importPKCS8(require('fs').readFileSync(__dirname + '/../../private.key').toString(), 'ES256');
        return await new SignJWT({ info })
            .setProtectedHeader({ alg: 'ES256' })
            .setIssuedAt()
            .setIssuer('seltorn')
            .setAudience('seltorn')
            .setExpirationTime('365d')
            .sign(privateKey);
    }
};
