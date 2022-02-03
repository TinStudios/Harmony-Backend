import express from 'express';
import { User, Member, ReturnedUser, Info, Role } from '../interfaces';

import argon2 from 'argon2';
import { SignJWT } from 'jose/jwt/sign';
import { importPKCS8 } from 'jose/key/import';
import { Client } from 'pg';
import mime from 'mime-types';
import multer from "multer";
import { NFTStorage, File } from 'nft.storage';
const upload = multer({ storage: multer.memoryStorage() });
import * as twofactor from 'node-2fa';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, logger: any, email: any, storage: NFTStorage) => {
    app.get('/users/@me/guilds', (req: express.Request, res: express.Response) => {
        database.query('SELECT * FROM guilds', (err, dbRes) => {
            if (!err) {
                const guilds = dbRes.rows.filter(x => x?.members?.includes(res.locals.user));
                res.send(guilds.map(guild => Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? JSON.parse(guild[x]) : x === 'members' ? Object.keys(JSON.parse(guild[x])).length : guild[x])[index] }), {})));
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.get('/users/@me', async (req: express.Request, res: express.Response) => {
        database.query('SELECT * FROM users', async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.id === res.locals.user);
                const { token, password, verificator, otp, owner, ...rest } = user;
                const returnedUser: ReturnedUser = { ...rest, creation: Number(user.creation), tfa: !!user.otp };
                res.send(returnedUser);
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.get('/users/*', async (req: express.Request, res: express.Response) => {
        const userId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query('SELECT * FROM users', async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.id === userId);
                if (user) {
                    const { token, email, password, otp, verificator, ...rest } = user;
                    const returnedUser: ReturnedUser = { ...rest, creation: Number(user.creation) };
                    res.send(returnedUser);
                } else {
                    res.status(404).send({ error: "Not found." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.delete('/users/@me', async (req: express.Request, res: express.Response) => {
        database.query('SELECT * FROM users', async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.id === res.locals.user);
                if (user.type === 'USER') {
                    if (req.headers.password && (await argon2.verify(user.password, req.headers.password?.toString(), { type: argon2.argon2id }))) {
                        database.query('DELETE FROM users WHERE token = $1', [req.headers.authorization], async (err, dbRes) => {
                            if (!err) {
                                const { token, password, verificator, otp, owner, ...rest } = user;
                                const returnedUser: ReturnedUser = { ...rest, creation: Number(user.creation), tfa: !!user.otp };
                                websockets.get(user.id)?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'userDeleted', user: returnedUser }));
                                });
                                res.send({});
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(401).send({ error: "Invalid information." });
                    }
                } else {
                    res.status(403).send({ error: "Only users can delete their account this way." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.patch('/users/@me', async (req: express.Request, res: express.Response) => {
        if (req.body.currentPassword && (typeof req.body.username === 'undefined' || (req.body.username.length > 0 && req.body.username.length < 31)) && (typeof req.body.discriminator === 'undefined' || (!isNaN(Number(req.body.discriminator)) && req.body.discriminator.length === 4)) && (typeof req.body.email === 'undefined' || /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email))) {
            database.query('SELECT * FROM users', async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.id === res.locals.user);
                    if (user.type === 'USER') {
                        if (await argon2.verify(user.password, req.body.currentPassword, { type: argon2.argon2id })) {
                            let discriminator = dbRes.rows.find(x => x.username === req.body.username && x.discriminator === user.discriminator) ? generateDiscriminator(dbRes.rows.filter(x => x.username === req.body.username).map(x => x.discriminator)) : user.discriminator;
                            if (req.body.discriminator) {
                                if (req.body.discriminator === '0000' || dbRes.rows.find(x => x.username === (req.body.username ?? user.username) && x.discriminator === req.body.discriminator)) {
                                    res.status(400).send({ error: "Discriminator not avaliable." });
                                    return;
                                }
                            }
                            const token = req.body.password ? 'Bearer ' + await generateToken({ id: user.id }) : user.token;
                            database.query('UPDATE users SET username = $1, discriminator = $2, email = $3, password = $4, token = $5 WHERE id = $6', [req.body.username ?? user.username, discriminator, req.body.email ?? user.email, req.body.password ? await argon2.hash(req.body.password, { type: argon2.argon2id }) : user.password, token, user.id], err => {
                                if (!err) {
                                    let preReturnedUser = { ...user };
                                    preReturnedUser.username = req.body.username;
                                    preReturnedUser.discriminator = discriminator;
                                    const { token, password, verificator, otp, owner, ...rest } = preReturnedUser;
                                    const returnedUser: ReturnedUser = { ...rest, creation: Number(user.creation), tfa: !!user.otp };

                                    websockets.get(user.id)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'userEdited', user: returnedUser }));
                                    });
                                    if (req.body.email) {
                                        try {
                                            email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                                'Subject: Important changes to your account\n',
                                                'From: seltornteam@gmail.com\n',
                                                'To: ' + user.email + '\n\n',
                                                'Dear ' + returnedUser.username + '#' + returnedUser.discriminator + ':\n',
                                                (req.body.email && !req.body.password ? 'We received and processed a request to change your account\'s email.' : req.body.password && !req.body.email ? 'We received and processed a request to change your account\'s password.' : 'We received and processed a request to change your account\'s email and password.') + '\n',
                                                'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                                'Best regards,\n',
                                                'Seltorn Team\n\n'].join('')).toString('base64url'));
                                        } catch {
                                            logger.error("Error emailing " + user.email);
                                        }
                                    }
                                    res.send(returnedUser);
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
                        } else {
                            res.status(401).send({ error: "Invalid information." });
                        }
                    } else {
                        res.status(403).send({ error: "Only users can delete their account this way." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.post('/users/@me/otp', async (req: express.Request, res: express.Response) => {
        database.query('SELECT * FROM users', async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.id === res.locals.user);
                if (user.type === 'USER') {
                    if (!user.otp) {
                        const secret = twofactor.generateSecret({ name: 'Seltorn', account: user.email });;
                        res.send(secret);
                    } else {
                        res.status(403).send({ error: "2FA already set up." });
                    }
                } else {
                    res.status(403).send({ error: "Only users can use 2FA." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });


    app.post('/users/@me/otp/*', async (req: express.Request, res: express.Response) => {
        const otpCode = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (req.body.password && otpCode) {
            database.query('SELECT * FROM users', async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.id === res.locals.user);
                    if (user.type === 'USER') {
                        if (!user.otp) {
                            if (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id }) && twofactor.verifyToken(otpCode, req.body.otp)) {
                                const token = 'Bearer ' + await generateToken({ id: user.id });
                                database.query('UPDATE users SET token = $1, otp = $2 WHERE id = $3', [token, otpCode, user.id], err => {
                                    if (!err) {
                                        try {
                                            email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                                'Subject: Important changes to your account\n',
                                                'From: seltornteam@gmail.com\n',
                                                'To: ' + user.email + '\n\n',
                                                'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                                'We received and processed a request to protect your account with 2FA.\n',
                                                'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                                'Best regards,\n',
                                                'Seltorn Team\n\n'].join('')).toString('base64url'));
                                        } catch {
                                            logger.error("Error emailing " + user.email);
                                        }
                                        res.send({});
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(401).send({ error: "Invalid information." });
                            }
                        } else {
                            res.status(403).send({ error: "2FA already set up." });
                        }
                    } else {
                        res.status(403).send({ error: "Only users can use 2FA." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/users/@me/otp', async (req: express.Request, res: express.Response) => {
        if (req.headers.password && req.headers.otp) {
            database.query('SELECT * FROM users', async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.id === res.locals.user);
                    if (user.otp) {
                        if (req.headers.password && (await argon2.verify(user.password, req.headers.password?.toString(), { type: argon2.argon2id })) && twofactor.verifyToken(user.otp, req.headers.otp?.toString())) {
                            const token = 'Bearer ' + await generateToken({ id: user.id });
                            database.query('UPDATE users SET token = $1, otp = $2 WHERE id = $3', [token, '', user.id], err => {
                                if (!err) {
                                    try {
                                        email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                            'Subject: Important changes to your account\n',
                                            'From: seltornteam@gmail.com\n',
                                            'To: ' + user.email + '\n\n',
                                            'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                            'We received and processed a request to remove your account 2FA protection.\n',
                                            'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                            'Best regards,\n',
                                            'Seltorn Team\n\n'].join('')).toString('base64url'));
                                    } catch {
                                        logger.error("Error emailing " + user.email);
                                    }
                                    res.send({});
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
                        } else {
                            res.status(401).send({ error: "Invalid information." });
                        }
                    } else {
                        res.status(403).send({ error: "2FA not set up." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/users/@me/icon', upload.single('icon'), (req: express.Request, res: express.Response) => {
        database.query('SELECT * FROM users', async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.id === res.locals.user);
                if (user.type === 'USER') {
                    if (req.body.password && (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id }))) {

                        const { token, password, verificator, otp, owner, ...rest } = user;
                        const returnedUser: ReturnedUser = { ...rest, creation: Number(user.creation), tfa: !!user.otp };
                        if (req.file) {
                            if (mime.extension(req.file?.mimetype ?? '') === 'png') {
                                const icon = await storage.store({
                                    name: user.id + '\'s avatar',
                                    description: 'Seltorn\'s ' + user.id + ' avatar',
                                    image: new File([req.file.buffer], user.id + '.png', { type: 'image/png' })
                                });
                                database.query('INSERT INTO files (id, type, url) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET url = $3', [user.id, 'users', icon.url], (err, dbRes) => {
                                    if (!err) {
                                        websockets.get(user.id)?.forEach(websocket => {
                                            websocket.send(JSON.stringify({ event: 'userNewAvatar', user: returnedUser }));
                                        });
                                        res.send(returnedUser);
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
                                    if (dbRes.rows.find(x => x.id === user.id && x.type === 'users')) {
                                        database.query('DELETE FROM files WHERE id = $1', [user.id], async (err, dbRes) => {
                                            if (!err) {
                                                websockets.get(user.id)?.forEach(websocket => {
                                                    websocket.send(JSON.stringify({ event: 'userNewAvatar', user: returnedUser }));
                                                });
                                                res.send(returnedUser);
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
                        res.status(401).send({ error: "Invalid information." });
                    }
                } else {
                    res.status(403).send({ error: "Only users can delete their account this way." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." })
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
            .setExpirationTime('7d')
            .sign(privateKey);
    }
};