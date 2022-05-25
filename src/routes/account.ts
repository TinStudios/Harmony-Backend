import { Info, User } from '../interfaces';

import express from "express";
import argon2 from 'argon2';
import { SignJWT } from 'jose/jwt/sign';
import { importPKCS8 } from 'jose/key/import';
import cassandra from 'cassandra-driver';
import crypto from 'crypto';
import * as twofactor from 'node-2fa';
import verify from '../utils/captcha';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client, logger: any, email: any, checkLogin: (token: string) => Promise<boolean | User>, recaptchaSecret: string, clientDomain: string) => {
    app.post('/login', (req: express.Request, res: express.Response) => {
        verify(recaptchaSecret, req.body.captcha).then(validated => {
            if (validated) {
                database.execute('SELECT * FROM users WHERE email = ? ALLOW FILTERING', [req.body.email], { prepare: true }).then(async dbRes => {
                        const user = dbRes.rows[0];
                        if (user) {
                            try {
                                if (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id })) {
                                    if (user.verified) {
                                        if (user.otp === '' || twofactor.verifyToken(user.otp, req.body.otp)) {
                                            const correct = Boolean(await checkLogin(user.token));
                                            if (!correct) {
                                                const token = 'Bearer ' + await generateToken({ id: user.id });
                                                database.execute('UPDATE users SET "token" = ? WHERE id = ?', [token, user.id], { prepare: true }).then(() => {
                                                        res.send({ token: token });
                                                });
                                            } else {
                                                res.send({ token: user.token });
                                            }
                                        } else {
                                            res.status(401).send({ error: "Invalid information." });
                                        }
                                    } else {
                                        res.status(403).send({ error: "Account not verified." });
                                    }
                                } else {
                                    res.status(401).send({ error: "Invalid information." });
                                }
                            } catch (e) {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        } else {
                            res.status(401).send({ error: "Invalid information." });
                        }
                });
            } else {
                res.status(401).send({ error: "Invalid captcha." });
            }
        });
    });

    app.post('/register', (req: express.Request, res: express.Response) => {
        verify(recaptchaSecret, req.body.captcha).then(validated => {
            if (validated) {
                if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email) && req.body.username && req.body.username.length < 31 && req.body.password) {
                    database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                        const badAccount = dbRes.rows.find(x => x.email === req.body.email);
                            if (!badAccount?.verified) {
                                let canContinue = false;

                                if (badAccount) {
                                    await database.execute('DELETE FROM users WHERE id = ?', [badAccount.id]);
                                } else {
                                    canContinue = true;
                                }

                                if (canContinue) {
                                    const id = crypto.randomUUID();
                                    const password = await argon2.hash(req.body.password, { type: argon2.argon2id });
                                    const token = 'Bearer ' + await generateToken({ id: id });
                                    const discriminator = generateDiscriminator(dbRes.rows.filter(x => x.username === req.body.username).map(x => x.discriminator) ?? []);
                                    const verificator = Buffer.from(crypto.randomUUID()).toString('base64url');
                                    database.execute('INSERT INTO users (id, "token", email, password, username, discriminator, avatar, creation, type, verified, verificator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, token, req.body.email, password, req.body.username, discriminator, 'userDefault', Date.now(), 'USER', false, verificator], { prepare: true }).then(() => {
                                            try {
                                                email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                                    'Subject: Verify your Harmony account!\n',
                                                    'From: harmonyopenchat@gmail.com\n',
                                                    'To: ' + req.body.email + '\n\n',
                                                    'Thank you for registering to Harmony!\n',
                                                    'To start chatting, we need to verify your email address.\n',
                                                    'Use this link to verify: ' + clientDomain + '/verify/' + verificator + '\n',
                                                    'Best regards,\n',
                                                    'Harmony Open Chat\n\n'].join('')).toString('base64url'));
                                            } catch {
                                                logger.error("Error emailing " + req.body.email);
                                            }
                                            res.status(201).send({});
                                    });
                                }
                            } else {
                                res.status(401).send({ error: "Email in use." });
                            }
                    });

                } else {
                    res.status(400).send({ error: "Something is missing or it's not appropiate." });
                }
            } else {
                res.status(401).send({ error: "Invalid captcha." });
            }
        });
    });

    app.post('/verify/*', (req: express.Request, res: express.Response) => {
        const verificator = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.execute('SELECT * FROM users WHERE verificator = ? ALLOW FILTERING', [verificator], { prepare: true }).then(async dbRes => {
                const user = dbRes.rows[0];
                if (user) {
                    database.execute('UPDATE users SET verified = ?, verificator = ? WHERE id = ?', [true, '', user.id], { prepare: true }).then(() => {
                        res.send({ token: user.token });
                });
                } else {
                    res.status(401).send({ error: "Invalid verification code." });
                }
        });
    });

    app.post('/reset/send', (req: express.Request, res: express.Response) => {
        verify(recaptchaSecret, req.body.captcha).then(validated => {
            if (validated) {
                database.execute('SELECT * FROM users WHERE email = ? ALLOW FILTERING', [req.body.email], { prepare: true }).then(async dbRes => {
                        const user = dbRes.rows[0];
                        if(user) {
                        const verificator = Buffer.from(crypto.randomUUID()).toString('base64url');
                        database.execute('UPDATE users SET verificator = ? WHERE id = ?', [verificator, user.id], { prepare: true }).then(() => {
                                try {
                                    email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                        'Subject: Reset your password\n',
                                        'From: harmonyopenchat@gmail.com\n',
                                        'To: ' + user.email + '\n\n',
                                        'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                        'We received a request to reset your account\'s password.\n',
                                        'Use this link to reset it: ' + clientDomain + '/reset/' + verificator + '\n',
                                        'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                        'Best regards,\n',
                                        'Harmony Open Chat\n\n'].join('')).toString('base64url'));
                                } catch {
                                    logger.error("Error emailing " + req.body.email);
                                }
                                res.status(201).send({});
                        });
                        } else {
                            res.status(500).send({ error: "Something went wrong with our server." });
                        }
                    });
            } else {
                res.status(401).send({ error: "Invalid captcha." });
            }
        });
    });

    app.get('/reset/*', (req: express.Request, res: express.Response) => {
        const verificator = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.execute('SELECT * FROM users WHERE verificator = ? ALLOW FILTERING', [verificator], { prepare: true }).then(async dbRes => {
            
                const user = dbRes.rows[0];
                if (user) {
                    res.send({});
                } else {
                    res.status(401).send({ error: "Invalid reset code." });
                }
        });
    });

    app.post('/reset/*', (req: express.Request, res: express.Response) => {
        verify(recaptchaSecret, req.body.captcha).then(validated => {
            if (validated) {
                const verificator = Object.values(req.params)
                    .map((x) => x.replace(/\//g, ''))
                    .filter((x) => {
                        return x != '';
                    })[0];
                    database.execute('SELECT * FROM users WHERE verificator = ? ALLOW FILTERING', [verificator], { prepare: true }).then(async dbRes => {
            
                        const user = dbRes.rows[0];
                        if (user) {
                            const token = req.body.password ? 'Bearer ' + await generateToken({ id: user.id }) : user.token;
                            database.execute('UPDATE users SET "token" = ?, password = ?, verificator = ? WHERE id = ?', [token, await argon2.hash(req.body.password, { type: argon2.argon2id }), '', user.id], { prepare: true }).then(() => {
                                
                                    try {
                                        email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                            'Subject: Important changes to your account\n',
                                            'From: harmonyopenchat@gmail.com\n',
                                            'To: ' + user.email + '\n\n',
                                            'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                            'We received and processed a request to change your account\'s password.\n',
                                            'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                            'Best regards,\n',
                                            'Harmony Open Chat\n\n'].join('')).toString('base64url'));
                                    } catch {
                                        logger.error("Error emailing " + req.body.email);
                                    }
                                    res.send({ token: token });
                                
                            });
                        } else {
                            res.status(401).send({ error: "Invalid reset code." });
                        }
                });
            } else {
                res.status(401).send({ error: "Invalid captcha." });
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
            .setExpirationTime('7d')
            .sign(privateKey);
    }
};