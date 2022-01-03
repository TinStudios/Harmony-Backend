import express from 'express';
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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
        database.query(`SELECT * FROM guilds`, (err, dbRes) => {
            if (!err) {
                const guilds = dbRes.rows.filter(x => x?.members?.includes(res.locals.user));
                res.send(guilds.map(guild => Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? JSON.parse(guild[x]) : x === 'members' ? Object.keys(JSON.parse(guild[x])).length : guild[x])[index] }), {})));
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.get('/users/@me', async (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.token === req.headers.authorization);
                let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User;
                const { token, password, verificator, otp, ...rest } = preReturnedUser;
                const returnedUser: ReturnedUser = {...rest, tfa: !!user.otp };
                res.send(returnedUser);
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
=======
import { User, ReturnedUser, Info } from '../interfaces';
=======
import { User, Member, ReturnedUser, Info } from '../interfaces';
>>>>>>> 38384fc (Some changes I forgot to commit)
=======
import { User, Member, ReturnedUser, Info, Role } from '../interfaces';
>>>>>>> f899d83 (Some changes (like adding email verification))

import argon2 from 'argon2';
    import { SignJWT } from 'jose/jwt/sign';
    import { importPKCS8 } from 'jose/key/import';
import { Client } from 'pg';
import fs from 'fs';
import mime from 'mime-types';
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() })

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, logger: any, email: any) => {

    app.post('/verify/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const verificator = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (verificator) {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.verificator === verificator);
                    if(user) {
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

        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });
    app.get('/users/@me/guilds', (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM guilds`, (err, dbRes) => {
            if (!err) {
                const guilds = dbRes.rows.filter(x => x?.members?.includes(res.locals.user));
                        res.send(guilds.map(guild => Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? JSON.parse(guild[x]) : x === 'members' ? Object.keys(JSON.parse(guild[x])).length : guild[x])[index] }), {})));
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
});

    app.get('/users/@me', async (req: express.Request, res: express.Response) => {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.token === req.headers.authorization);
                    let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User; 
                                const { token, password, verificator, ...rest } = preReturnedUser;
                                const returnedUser: ReturnedUser = rest;
                    res.send(returnedUser);
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
>>>>>>> 0718f96 (Changed to TypeScript)
    });

    app.get('/users/*', async (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const userId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
<<<<<<< HEAD
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.id === userId);
                if (user) {
                    let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User;
                    const { token, email, password, otp, verificator, ...rest } = preReturnedUser;
                    const returnedUser: ReturnedUser = {...rest, tfa: !!user.otp };
                    res.send(returnedUser);
                } else {
                    res.status(404).send({ error: "User not found." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
=======
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.id === userId);
                    if (user) {
                        let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User; 
                                const { token, email, password, verificator, ...rest } = preReturnedUser;
                                const returnedUser: ReturnedUser = rest;
                        res.send(returnedUser);
                    } else {
                        res.status(404).send({ error: "User not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
>>>>>>> 0718f96 (Changed to TypeScript)
    });

    app.delete('/users/@me', async (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
                const user = dbRes.rows.find(x => x.id === res.locals.user);
                if (req.body.password && (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id }))) {
                    database.query('DELETE FROM users WHERE token = $1', [req.headers.authorization], async (err, dbRes) => {
                        if (!err) {
                            let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User;
                            const { token, password, verificator, otp, ...rest } = preReturnedUser;
                            const returnedUser: ReturnedUser = {...rest, tfa: !!user.otp };
                            websockets.get(user.id)?.forEach(websocket => {
                                websocket.send(JSON.stringify({ event: 'userDeleted', user: returnedUser }));
                            });
                            res.send({});
                        } else {
                            res.status(500).send({ error: "Something went wrong with our server." });
                        }
                    });
                } else {
                    res.status(401).send({ error: "Incorrect information." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        });
    });

    app.patch('/users/@me', async (req: express.Request, res: express.Response) => {
        if (req.body.currentPassword && ((req.body.username ? req.body.username.length < 31 : true) && (req.body.email ? /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email) : true))) {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.id === res.locals.user);
                    if (await argon2.verify(user.password, req.body.currentPassword, { type: argon2.argon2id })) {
                        let discriminator = dbRes.rows.find(x => x.username === req.body.username && x.discriminator === user.discriminator) ? generateDiscriminator(dbRes.rows.filter(x => x.username === req.body.username).map(x => x.discriminator)) : user.discriminator;
                        if(req.body.discriminator) {
                            if(req.body.discriminator === '0000' || dbRes.rows.find(x => x.username === (req.body.username ?? user.username) && x.discriminator === req.body.discriminator)) {
                                res.status(400).send({ error: "Discriminator not avaliable." });
                                return;
                            }
                        }
                        const token = req.body.password ? 'Bearer ' + await generateToken({ id: user.id }) : user.token;
                        database.query(`UPDATE users SET username = $1, discriminator = $2, email = $3, password = $4, token = $5 WHERE id = $6`, [req.body.username ?? user.username, discriminator, req.body.email ?? user.email, await argon2.hash(req.body.password ?? user.password, { type: argon2.argon2id }), token, user.id], err => {
                            if (!err) {
                                let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User;
                                preReturnedUser.username = req.body.username;
                                preReturnedUser.discriminator = discriminator;
                                const { token, password, verificator, otp, ...rest } = preReturnedUser;
                                const returnedUser: ReturnedUser = {...rest, tfa: !!user.otp };

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
                        res.status(401).send({ error: "Incorrect information." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.post('/users/@me/otp', async (req: express.Request, res: express.Response) => {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.id === res.locals.user);
                        if(!user.otp) {
                        const secret = twofactor.generateSecret({ name: 'Seltorn', account: user.email });;
                            res.send(secret);
                    } else {
                        res.status(403).send({ error: "2FA already set up." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
    });


    app.post('/users/@me/otp/*', async (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const otpCode = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (req.body.password && otpCode) {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.id === res.locals.user);
                    if(!user.otp) {
                    if (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id }) && twofactor.verifyToken(otpCode, req.body.otp)) {
                            const token = 'Bearer ' + await generateToken({ id: user.id });
                            database.query(`UPDATE users SET token = $1, otp = $2 WHERE id = $3`, [token, otpCode, user.id], err => {
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
                        res.status(401).send({ error: "Incorrect information." });
                    }
                    } else {
                        res.status(403).send({ error: "2FA already set up." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.delete('/users/@me/otp', async (req: express.Request, res: express.Response) => {
        if (req.body.password) {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.id === res.locals.user);
                    if(user.otp) {
                    if (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id }) && twofactor.verifyToken(user.otp, req.body.otp)) {
                        const token = 'Bearer ' + await generateToken({ id: user.id }) ;
                        database.query(`UPDATE users SET token = $1, otp = $2 WHERE id = $3`, [token, '', user.id], err => {
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
                        res.status(401).send({ error: "Incorrect information." });
                    }
                    } else {
                        res.status(403).send({ error: "2FA not set up." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.patch('/users/@me/icon', upload.single('icon'), (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.id === res.locals.user);
                if (req.body.password && (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id }))) {

                    let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User;
                    const { token, password, verificator, otp, ...rest } = preReturnedUser;
                    const returnedUser: ReturnedUser = {...rest, tfa: !!user.otp };
                    if (req.file) {
                        if (mime.extension(req.file?.mimetype ?? '') === 'png') {
                            const icon = await storage.store({
                                name: user.id + '\'s avatar',
                                description: 'Seltorn\'s ' + user.id + ' avatar',
                                image: new File([req.file.buffer], user.id + '.png', { type: 'image/png' })
                              });
                            database.query(`INSERT INTO files (id, type, url) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET url = $3`, [user.id, 'users', icon.url], (err, dbRes) => {
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
                            database.query(`DELETE FROM files WHERE id = $1`, [user.id], async (err, dbRes) => {
                                if (!err) {
                            res.send({});
                                } else {
                                    res.status(500).send({ error: "Something went wrong with our server." });
                                }
                            });
                        } else {
                            res.status(400).send({ error: "Something is missing." });
                        }
                    } else {
                        res.status(500).send({ error: "Something went wrong with our server." });
                    }
                });
                    }
                } else {
                    res.status(401).send({ error: "Incorrect information." });
                }
            } else {
                res.status(500).send({ error: "Something went wrong with our server." })
            }
        });
=======
                const user = dbRes.rows.find(x => x.id == res.locals.user);
=======
                const user = dbRes.rows.find(x => x.id === res.locals.user);
<<<<<<< HEAD
>>>>>>> f8e172d (asi ri ma na)
=======
                if(req.body.currentPassword && (await argon2.verify(user.password, req.body.currentPassword, { type: argon2.argon2id }))) {
>>>>>>> 721a9ce (uploading to put a licence)
            database.query('DELETE FROM users WHERE token = $1', [req.headers.authorization], async (err, dbRes) => {
                if (!err) {
                    let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User; 
                                const { token, password, verificator, ...rest } = preReturnedUser;
                                const returnedUser: ReturnedUser = rest;
                         websockets.get(user.id)?.forEach(websocket => {
                        websocket.send(JSON.stringify({ event: 'userDeleted', user: returnedUser }));
                    });
                    res.send(returnedUser);
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(401).send({ error: "Incorrect password." });
        }
        } else {
            res.status(500).send({ error: "Something went wrong with our server." });
        }
    });
    });

    app.patch('/users/@me', async (req: express.Request, res: express.Response) => {
            if (req.body.currentPassword && ((req.body.username ? req.body.username.length < 31 : true) && (req.body.email ? /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email) : true))) {
                database.query(`SELECT * FROM users`, async (err, dbRes) => {
                    if (!err) {
                        const user = dbRes.rows.find(x => x.id === res.locals.user);
                        if(req.body.currentPassword && (await argon2.verify(user.password, req.body.currentPassword, { type: argon2.argon2id }))) {
                        const discriminator = dbRes.rows.find(x => x.username === req.body.username && x.discriminator === user.discriminator) ? generateDiscriminator(dbRes.rows.filter(x => x.username === req.body.username)) : user.discriminator;
                        console.log(req.body.password);
                        const token = req.body.password ? 'Bearer ' + await generateToken({ id: user.id }) : user.token;
                        database.query(`UPDATE users SET username = $1, discriminator = $2, email = $3, password = $4, token = $5 WHERE id = $6`, [req.body.username ?? user.username, discriminator, req.body.email ?? user.email, await argon2.hash(req.body.password ?? user.password, { type: argon2.argon2id }), token, user.id], err => {
                            if (!err) {
                                let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User; 
                                preReturnedUser.username = req.body.username;
                                preReturnedUser.discriminator = discriminator;
                                const { token, password, verificator, ...rest } = preReturnedUser;
                                const returnedUser: ReturnedUser = rest;
        
                                     websockets.get(user.id)?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'userEdited', user: returnedUser }));
                                    websocket.send(JSON.stringify({ event: 'tokenSwitch', token: token }));
                                });
                                if(req.body.email) {
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
                        res.status(401).send({ error: "Incorrect password." });
                    }
                    } else {
                        res.status(500).send({ error: "Something went wrong with our server." });
                    }
                });
            } else {
                res.status(400).send({ error: "Something is missing." });
            }
>>>>>>> 0718f96 (Changed to TypeScript)
    });

    app.patch('/users/@me/icon', upload.single('upload'), (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM users`, async (err, dbRes) => {
            if (!err) {
                const user = dbRes.rows.find(x => x.id === res.locals.user);
                if(req.body.currentPassword && (await argon2.verify(user.password, req.body.currentPassword, { type: argon2.argon2id }))) {
                    
                let preReturnedUser: User = Object.keys(user).reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(user).map(x => user[x])[index] }), {}) as User; 
                        const { token, password, verificator, ...rest } = preReturnedUser;
                        const returnedUser: ReturnedUser = rest;
        const fileName = res.locals.user + '.png';
        if(req.file) {
            if(mime.extension(req.file?.mimetype ?? '') === 'png') {
            if(fs.existsSync(__dirname + '/../../icons/users/' + fileName)) {
                fs.unlinkSync(__dirname + '/../../icons/users/' + fileName);
            }
        fs.writeFile(__dirname + '/../../icons/users/' + fileName, req.file.buffer, "binary", (err => {
            if (!err) {
        
                                     websockets.get(user.id)?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'userNewAvatar', user: returnedUser }));
                                });
                res.send(returnedUser);
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        }));
    } else {
        res.status(403).send({ error: "We only accept PNG." });
    }
    } else {
        if(fs.existsSync(__dirname + '/../../icons/users/' + fileName)) {
            fs.unlinkSync(__dirname + '/../../icons/users/' + fileName);
            websockets.get(user.id)?.forEach(websocket => {
                websocket.send(JSON.stringify({ event: 'userNewAvatar', user: returnedUser }));
            });
            res.send(returnedUser);
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    }
} else {
    res.status(401).send({ error: "Incorrect password." });
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