import { Info, ReturnedUser, User } from "interfaces";

import express from "express";
import { SignJWT } from 'jose/jwt/sign';
import { importPKCS8 } from 'jose/key/import';
import cassandra from 'cassandra-driver';
import crypto from 'crypto';
import mime from 'mime-types';
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage(), limits: {
    fileSize: 1000000000
} });

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client, uploadFile: any) => {
    app.get('/bots', (req: express.Request, res: express.Response) => {
        database.execute('SELECT * FROM users WHERE owner = ? ALLOW FILTERING', [res.locals.user], { prepare: true }).then(dbRes => {

                res.send(dbRes.rows.map((x: any) => {
                    delete x.email;
                    delete x.password;
                    delete x.owner;
                    delete x.verified;
                    delete x.verificator;
                    delete x.otp;
                    return x;
                }));
            
        });
    });

    app.post('/bots', (req: express.Request, res: express.Response) => {
        if (req.body.username && req.body.username.length < 31) {
            database.execute('SELECT * FROM users WHERE username = ? ALLOW FILTERING', [req.body.username], { prepare: true }).then(async dbRes => {
                
                    const id = crypto.randomUUID();
                    const token = 'Bot ' + await generateToken({ id: id });
                    const discriminator = generateDiscriminator(dbRes.rows.map(x => x.discriminator) ?? []);
                    const creation = Date.now();
                    database.execute('INSERT INTO users (id, "token", username, discriminator, avatar, creation, type, owner, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, token, req.body.username, discriminator, 'botDefault', creation, 'BOT', res.locals.user, true], { prepare: true }).then(() => {
                        
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
                        
                    });
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
        database.execute('SELECT * FROM users WHERE (id = ? AND type = ?)', [botId, 'BOT'], { prepare: true }).then(dbRes => {
            
                const bot = dbRes.rows[0];
                if (bot) {
                    const { token, email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                    res.send(returnedBot);
                } else {
                    res.status(404).send({ error: "Not found." });
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
            database.execute('SELECT * FROM users WHERE (id = ? AND owner = ?)', [botId, res.locals.user], { prepare: true }).then(dbRes => {
                
                    const bot = dbRes.rows[0];
                    if (bot) {
                        database.execute('UPDATE users SET username = ? WHERE id = ?', [req.body.username, botId], { prepare: true }).then(() => {
                            
                                const { email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                                returnedBot.username = req.body.username;
                                websockets.get(res.locals.user)?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'botEdited', bot: returnedBot }));
                                });
                                res.send(returnedBot);
                            });
                        }
                    });
                    } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/bots/*/avatar', upload.single('avatar'), (req: express.Request, res: express.Response) => {
        const botId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
            database.execute('SELECT * FROM users WHERE (id = ? AND owner = ?)', [botId, res.locals.user], { prepare: true }).then(async dbRes => {
                
                const bot = dbRes.rows[0];
                if (bot) {
                    if (req.file) {
                        if (mime.extension(req.file?.mimetype ?? '') === 'png') {
                            const icon = await uploadFile(req.file);
                            database.execute('UPDATE users SET avatar = ? WHERE id = ?', [icon, bot.id], { prepare: true }).then(() => {
                                
                                    const { email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                                    res.send(returnedBot);
                                
                            });
                        } else {
                            res.status(400).send({ error: "We only accept PNG." });
                        }
                    } else {
                        database.execute('SELECT * FROM users', { prepare: true }).then(dbRes => {
                            
                                if (dbRes.rows.find(x => x.id.toString() === bot.id)?.avatar) {
                                    database.execute('UPDATE users SET avatar = ? WHERE id = ?', ['botDefault', bot.id], { prepare: true }).then(() => {
                                        
                                            const { email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                                            res.send(returnedBot);
                                        
                                    });
                                } else {
                                    res.status(400).send({ error: "Something is missing or it's not appropiate." });
                                }
                            
                        });
                    }
                } else {
                    res.status(403).send({ error: "Missing permission." });
                }
            
        });
    });

    app.delete('/bots/*', (req: express.Request, res: express.Response) => {
        const botId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
            database.execute('SELECT * FROM users WHERE (id = ? AND owner = ?)', [botId, res.locals.user], { prepare: true }).then(dbRes => {
                
                const bot = dbRes.rows[0];
                if (bot) {
                    database.execute('DELETE FROM users WHERE id = ?', [botId], { prepare: true }).then(() => {
                        
                            websockets.get(res.locals.user)?.forEach(websocket => {
                                websocket.send(JSON.stringify({ event: 'botDeleted', bot: botId }));
                            });
                            res.send({});
                        
                    });
                } else {
                    res.status(403).send({ error: "Missing permission." });
                }
            
        });
    });

    app.post('/bots/*/reset', (req: express.Request, res: express.Response) => {
        const botId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
            database.execute('SELECT * FROM users WHERE (id = ? AND owner = ?)', [botId, res.locals.user], { prepare: true }).then(async dbRes => {
                
                const bot = dbRes.rows[0];
                if (bot) {
                    const token = 'Bot ' + await generateToken({ id: botId });
                    database.execute('UPDATE users SET "token" = ? WHERE id = ?', [token, botId], { prepare: true }).then(() => {
                        
                            const { email, password, owner, verified, verificator, otp, ...returnedBot } = bot;
                            returnedBot.token = token;
                            websockets.get(res.locals.user)?.forEach(websocket => {
                                websocket.send(JSON.stringify({ event: 'botReset', bot: returnedBot }));
                            });
                            res.send(returnedBot);
                        });
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
            .setIssuer('harmony')
            .setAudience('harmony')
            .setExpirationTime('365d')
            .sign(privateKey);
    }
};
