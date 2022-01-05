import { Info } from '../interfaces';

import express from "express";
<<<<<<< HEAD
<<<<<<< HEAD
import argon2 from 'argon2';
import { SignJWT } from 'jose/jwt/sign';
import { importPKCS8 } from 'jose/key/import';
import { Client } from 'pg';
import crypto from 'crypto';
import * as twofactor from 'node-2fa';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, logger: any, email: any, checkLogin: any, clientDomain: string) => {
    app.post('/login', (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.email === req.body.email);
                if (user) {
                    try {
                        if (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id })) {
                            if (user.verified) {
                                if(user.otp === '' || twofactor.verifyToken(user.otp, req.body.otp)) {
                                const correct = (await checkLogin(user.token)).id !== '';
                                if (!correct) {
                                    const token = 'Bearer ' + await generateToken({ id: user.id });
                                    database.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id], err => {
                                        if (!err) {
                                            res.send({ token: token });
                                        } else {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                        }
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
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
=======
    import argon2 from 'argon2';
    import { SignJWT } from 'jose/jwt/sign';
    import { importPKCS8 } from 'jose/key/import';
=======
import argon2 from 'argon2';
import { SignJWT } from 'jose/jwt/sign';
import { importPKCS8 } from 'jose/key/import';
>>>>>>> 332c1ca (owo)
import { Client } from 'pg';
import FlakeId from 'flake-idgen';
const intformat = require('biguint-format');
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, logger: any, flake: FlakeId, google: any, checkLogin: any, clientDomain: string) => {
    app.post('/login', (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.email === req.body.email);
                if (user) {
                    try {
                        if (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id })) {
                            if (user.verified) {
                                const correct = (await checkLogin(user.token)).id !== '';
                                if (!correct) {
                                    const token = 'Bearer ' + await generateToken({ id: user.id });
                                    database.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id], err => {
                                        if (!err) {
                                            res.send({ token: token });
                                        } else {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                        }
                                    });
                                } else {
                                    res.send({ token: user.token });
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
            } else {
<<<<<<< HEAD
                res.status(500).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                res.status(500).send({ error: "Something went wrong with our server." });
>>>>>>> 51556ba (Some changes)
            }
        });
    });

    app.post('/register', (req: express.Request, res: express.Response) => {
        if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email) && req.body.username && req.body.username.length < 31 && req.body.password) {
<<<<<<< HEAD
<<<<<<< HEAD
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const badAccount = dbRes.rows.find(x => x.email === req.body.email);
                    if (!badAccount?.verified) {
                        let canContinue = false;

                        if (badAccount) {
                            database.query('DELETE FROM users WHERE id = $1', [badAccount.id], async (err, dbRes) => {
                                if (!err) {
                                    canContinue = true;
                                }
                            });
                        } else {
                            canContinue = true;
                        }

                        const id = crypto.randomUUID();
                        const password = await argon2.hash(req.body.password, { type: argon2.argon2id });
                        const token = 'Bearer ' + await generateToken({ id: id });
                        const discriminator = generateDiscriminator(dbRes.rows.filter(x => x.username === req.body.username).map(x => x.discriminator) ?? []);
                        const verificator = Buffer.from(crypto.randomUUID()).toString('base64url');
                        database.query(`INSERT INTO users (id, token, email, password, username, discriminator, creation, verified, verificator) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [id, token, req.body.email, password, req.body.username, discriminator, Date.now(), false, verificator], (err, dbRes) => {
                            if (!err) {
                                try {
                                    email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                        'Subject: Verify your Seltorn account!\n',
                                        'From: seltornteam@gmail.com\n',
                                        'To: ' + req.body.email + '\n\n',
                                        'Thank you for registering to Seltorn!\n',
                                        'To start chatting, we need to verify your email address.\n',
                                        'Use this link to verify: ' + clientDomain + '/verify/' + verificator + '\n',
                                        'Best regards,\n',
                                        'Seltorn Team\n\n'].join('')).toString('base64url'));
                                } catch {
                                    logger.error("Error emailing " + req.body.email);
                                }
                                res.status(201).send({});
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(401).send({ error: "Email in use." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
=======
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
=======
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
>>>>>>> 332c1ca (owo)
                if (!err) {
                    const badAccount = dbRes.rows.find(x => x.email === req.body.email);
                    if (!badAccount?.verified) {
                        let canContinue = false;

                        if (badAccount) {
                            database.query('DELETE FROM users WHERE id = $1', [badAccount.id], async (err, dbRes) => {
                                if (!err) {
                                    canContinue = true;
                                }
                            });
                        } else {
                            canContinue = true;
                        }

                        const id = intformat(flake.next(), 'dec').toString();
                        const password = await argon2.hash(req.body.password, { type: argon2.argon2id });
                        const token = 'Bearer ' + await generateToken({ id: id });
                        const discriminator = generateDiscriminator(dbRes.rows.filter(x => x.username === req.body.username).map(x => x.discriminator) ?? []);
                        const verificator = Buffer.from(crypto.randomUUID()).toString('base64url');
                        database.query(`INSERT INTO users (id, token, email, password, username, discriminator, creation, verified, verificator) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, [id, token, req.body.email, password, req.body.username, discriminator, Date.now(), false, verificator], (err, dbRes) => {
                            if (!err) {
                                try {
                                    google.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                        'Subject: Verify your Seltorn account!\n',
                                        'From: seltornteam@gmail.com\n',
                                        'To: ' + req.body.email + '\n\n',
                                        'Thank you for registering to Seltorn!\n',
                                        'To start chatting, we need to verify your email address.\n',
                                        'Use this link to verify: ' + clientDomain + '/verify/' + verificator + '\n',
                                        'Best regards,\n',
                                        'Seltorn Team\n\n'].join('')).toString('base64url'));
                                } catch {
                                    logger.error("Error emailing " + req.body.email);
                                }
                                res.status(201).send({});
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(401).send({ error: "Email in use." });
                    }
                } else {
<<<<<<< HEAD
                    res.status(500).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                    res.status(500).send({ error: "Something went wrong with our server." });
>>>>>>> 51556ba (Some changes)
                }
            });

        } else {
<<<<<<< HEAD
<<<<<<< HEAD
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.post('/verify/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const verificator = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.verificator === verificator);
                if (user) {
                    database.query(`UPDATE users SET verified = $1, verificator = $2 WHERE verificator = $3`, [true, '', verificator], err => {
                        if (!err) {
                            res.send({ token: user.token });
                        } else {
                            res.status(500).send({ error: "Something went wrong with our server." });
                        }
                    });
                } else {
                    res.status(401).send({ error: "Invalid verification code." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.post('/reset/send', (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.email === req.body.email);

                const verificator = Buffer.from(crypto.randomUUID()).toString('base64url');
                database.query('UPDATE users SET verificator = $1 WHERE id = $2', [verificator, user.id], (err, dbRes) => {
                    if (!err) {
                        try {
                            email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                'Subject: Reset your password\n',
                                'From: seltornteam@gmail.com\n',
                                'To: ' + user.email + '\n\n',
                                'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                'We received a request to reset your account\'s password.\n',
                                'Use this link to reset it: ' + clientDomain + '/reset/' + verificator + '\n',
                                'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                'Best regards,\n',
                                'Seltorn Team\n\n'].join('')).toString('base64url'));
                        } catch {
                            logger.error("Error emailing " + req.body.email);
                        }
                        res.status(201).send({});
                    } else {
                        res.status(500).send({ error: "Something went wrong with our server." });
                    }
                });
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.get('/reset/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const verificator = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.verificator === verificator);
                if (user) {
                    res.send({});
                } else {
                    res.status(401).send({ error: "Invalid reset code." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server" });
            }
        });
    });

    app.post('/reset/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const verificator = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.verificator === verificator);
                if (user) {
                    const token = req.body.password ? 'Bearer ' + await generateToken({ id: user.id }) : user.token;
                    database.query('UPDATE users SET token = $1, password = $2, verificator = $3 WHERE id = $4', [token, await argon2.hash(req.body.password, { type: argon2.argon2id }), '', user.id], (err, dbRes) => {
                        if (!err) {
                            try {
                                email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                    'Subject: Important changes to your account\n',
                                    'From: seltornteam@gmail.com\n',
                                    'To: ' + user.email + '\n\n',
                                    'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                    'We received and processed a request to change your account\'s password.\n',
                                    'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                    'Best regards,\n',
                                    'Seltorn Team\n\n'].join('')).toString('base64url'));
                            } catch {
                                logger.error("Error emailing " + req.body.email);
                            }
                            res.send({ token: token });
                        } else {
                            res.status(500).send({ error: "Something went wrong with our server." });
                        }
                    });
                } else {
                    res.status(401).send({ error: "Invalid reset code." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

=======
            res.status(400).send({});
=======
            res.status(400).send({ error: "Something is missing." });
>>>>>>> 51556ba (Some changes)
        }
    });

<<<<<<< HEAD
>>>>>>> 0718f96 (Changed to TypeScript)
=======
    app.post('/verify/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const verificator = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.verificator === verificator);
                if (user) {
                    database.query(`UPDATE users SET verified = $1, verificator = $2 WHERE verificator = $3`, [true, '', verificator], err => {
                        if (!err) {
                            res.send({ token: user.token });
                        } else {
                            res.status(500).send({ error: "Something went wrong with our server." });
                        }
                    });
                } else {
                    res.status(401).send({ error: "Invalid verification code." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.post('/reset/send', (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.email === req.body.email);

                const verificator = Buffer.from(crypto.randomUUID()).toString('base64url');
                database.query('UPDATE users SET verificator = $1 WHERE id = $2', [verificator, user.id], (err, dbRes) => {
                    if (!err) {
                        try {
                            google.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                'Subject: Reset your password\n',
                                'From: seltornteam@gmail.com\n',
                                'To: ' + user.email + '\n\n',
                                'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                'We received a request to reset your account\'s password.\n',
                                'Use this link to reset it: ' + clientDomain + '/reset/' + verificator + '\n',
                                'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                'Best regards,\n',
                                'Seltorn Team\n\n'].join('')).toString('base64url'));
                        } catch {
                            logger.error("Error emailing " + req.body.email);
                        }
                        res.status(201).send({});
                    } else {
                        res.status(500).send({ error: "Something went wrong with our server." });
                    }
                });
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.get('/reset/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const verificator = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.verificator === verificator);
                if (user) {
                    res.send({});
                } else {
                    res.status(401).send({ error: "Invalid reset code." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server" });
            }
        });
    });

    app.post('/reset/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const verificator = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.verificator === verificator);
                if (user) {
                    const token = req.body.password ? 'Bearer ' + await generateToken({ id: user.id }) : user.token;
                    database.query('UPDATE users SET token = $1, password = $2, verificator = $3 WHERE id = $4', [token, await argon2.hash(req.body.password, { type: argon2.argon2id }), '', user.id], (err, dbRes) => {
                        if (!err) {
                            try {
                                google.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                    'Subject: Important changes to your account\n',
                                    'From: seltornteam@gmail.com\n',
                                    'To: ' + user.email + '\n\n',
                                    'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                    'We received and processed a request to change your account\'s password.\n',
                                    'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                    'Best regards,\n',
                                    'Seltorn Team\n\n'].join('')).toString('base64url'));
                            } catch {
                                logger.error("Error emailing " + req.body.email);
                            }
                            res.send({ token: token });
                        } else {
                            res.status(500).send({ error: "Something went wrong with our server." });
                        }
                    });
                } else {
                    res.status(401).send({ error: "Invalid reset code." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

>>>>>>> 332c1ca (owo)
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