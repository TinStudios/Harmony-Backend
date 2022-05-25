import express from 'express';
import { ReturnedUser, Info, User, Member } from '../interfaces';

import argon2 from 'argon2';
import { SignJWT } from 'jose/jwt/sign';
import { importPKCS8 } from 'jose/key/import';
import cassandra from 'cassandra-driver';
import mime from 'mime-types';
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage(), limits: {
    fileSize: 1000000000
} });
import * as twofactor from 'node-2fa';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client, logger: any, email: any, uploadFile: any) => {
    app.get('/users/@me/guilds', (req: express.Request, res: express.Response) => {
        database.execute('SELECT * FROM guilds', { prepare: true }).then(dbRes => {
                const guilds = dbRes.rows.filter(x => x?.members?.find((x: Member) => x.id.toString() === res.locals.user));
                res.send(guilds.map(guild => Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').reduce((obj, key, index) => ({ ...obj, [key]: Object.keys(guild).filter(x => x !== 'invites' && x !== 'channels' && x !== 'bans').map(x => x === 'bans' || x === 'roles' ? guild[x] : x === 'members' ? Object.keys(guild[x]).length : guild[x])[index] }), {})));
        });
    });

    app.get('/users/@me', async (req: express.Request, res: express.Response) => {
        database.execute('SELECT * FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(async dbRes => {
                const user = dbRes.rows[0] as unknown as User;
                const { token, password, verificator, otp, owner, ...rest } = user;
                const returnedUser: ReturnedUser = { ...rest, creation: user.creation, tfa: !!user.otp };
                res.send(returnedUser);
        });
    });

    app.get('/users/*', async (req: express.Request, res: express.Response) => {
        const userId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        database.execute('SELECT * FROM users WHERE id = ?', [userId], { prepare: true }).then(async dbRes => {
            
                const user = dbRes.rows[0];
                if (user) {
                    const { token, email, password, otp, verificator, ...rest } = user as unknown as User;
                    const returnedUser: ReturnedUser = { ...rest, creation: user.creation };
                    res.send(returnedUser);
                } else {
                    res.status(404).send({ error: "Not found." });
                }
        });
    });

    app.delete('/users/@me', async (req: express.Request, res: express.Response) => {
        database.execute('SELECT * FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(async dbRes => {
            
            const user = dbRes.rows[0];
                if (user?.type === 'USER') {
                    if (req.headers.password && (await argon2.verify(user.password, req.headers.password?.toString(), { type: argon2.argon2id }))) {
                        database.execute('DELETE FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(async dbRes => {
                            
                                const { token, password, verificator, otp, owner, ...rest } = user as unknown as User;
                                const returnedUser: ReturnedUser = { ...rest, creation: user.creation, tfa: !!user.otp };
                                websockets.get(user.id.toString())?.forEach(websocket => {
                                    websocket.send(JSON.stringify({ event: 'userDeleted', user: returnedUser }));
                                });
                                res.send({});
                        });
                    } else {
                        res.status(401).send({ error: "Invalid information." });
                    }
                } else {
                    res.status(403).send({ error: "Only users can delete their account this way." });
                }
        });
    });

    app.patch('/users/@me', async (req: express.Request, res: express.Response) => {
        if (req.body.currentPassword && (typeof req.body.username === 'undefined' || (req.body.username.length > 0 && req.body.username.length < 31)) && (typeof req.body.discriminator === 'undefined' || (!isNaN(Number(req.body.discriminator)) && req.body.discriminator.length === 4)) && (typeof req.body.about === 'undefined' || (req.body.about.length > 0 && req.body.about.length < 201)) && (typeof req.body.email === 'undefined' || /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email))) {
            database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
            
                const user = dbRes.rows.find(x => x.id === res.locals.user);
                    if (user?.type === 'USER') {
                        if (await argon2.verify(user.password, req.body.currentPassword, { type: argon2.argon2id })) {
                            let discriminator = dbRes.rows.find(x => x.username === req.body.username && x.discriminator === user.discriminator) ? generateDiscriminator(dbRes.rows.filter(x => x.username === req.body.username).map(x => x.discriminator)) : user.discriminator;
                            if (req.body.discriminator) {
                                if (req.body.discriminator === '0000' || dbRes.rows.find(x => x.username === (req.body.username ?? user.username) && x.discriminator === req.body.discriminator)) {
                                    res.status(400).send({ error: "Discriminator not avaliable." });
                                    return;
                                }
                            }
                            const token = req.body.password ? 'Bearer ' + await generateToken({ id: user.id }) : user.token;
                            database.execute('UPDATE users SET username = ?, discriminator = ?, about = ?, email = ?, password = ?, token = ? WHERE id = ?', [req.body.username ?? user.username, discriminator, req.body.about ?? user.about, req.body.email ?? user.email, req.body.password ? await argon2.hash(req.body.password, { type: argon2.argon2id }) : user.password, token, user.id], { prepare: true }).then(() => {
                                
                                    let preReturnedUser = { ...user };
                                    preReturnedUser.username = req.body.username;
                                    preReturnedUser.discriminator = discriminator;
                                    const { token, password, verificator, otp, owner, ...rest } = preReturnedUser as unknown as User;
                                    const returnedUser: ReturnedUser = { ...rest, creation: user.creation, tfa: !!user.otp };

                                    websockets.get(user?.id?.toString())?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'userEdited', user: returnedUser }));
                                    });
                                    if (req.body.email) {
                                        try {
                                            email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                                'Subject: Important changes to your account\n',
                                                'From: harmonyopenchat@gmail.com\n',
                                                'To: ' + user?.email + '\n\n',
                                                'Dear ' + returnedUser.username + '#' + returnedUser.discriminator + ':\n',
                                                (req.body.email && !req.body.password ? 'We received and processed a request to change your account\'s email.' : req.body.password && !req.body.email ? 'We received and processed a request to change your account\'s password.' : 'We received and processed a request to change your account\'s email and password.') + '\n',
                                                'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                                'Best regards,\n',
                                                'Harmony Open Chat\n\n'].join('')).toString('base64url'));
                                        } catch {
                                            logger.error("Error emailing " + user?.email);
                                        }
                                    }
                                    res.send(returnedUser);
                            });
                        } else {
                            res.status(401).send({ error: "Invalid information." });
                        }
                    } else {
                        res.status(403).send({ error: "Only users can edit their account this way." });
                    }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.post('/users/@me/otp', async (req: express.Request, res: express.Response) => {
        database.execute('SELECT * FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(dbRes => {
            
            const user = dbRes.rows[0];
                if (user?.type === 'USER') {
                    if (!user.otp) {
                        const secret = twofactor.generateSecret({ name: 'Harmony', account: user.email });;
                        res.send(secret);
                    } else {
                        res.status(403).send({ error: "2FA already set up." });
                    }
                } else {
                    res.status(403).send({ error: "Only users can use 2FA." });
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
            database.execute('SELECT * FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(async dbRes => {
            
                const user = dbRes.rows[0];
                    if (user?.type === 'USER') {
                        if (!user.otp) {
                            if (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id }) && twofactor.verifyToken(otpCode, req.body.otp)) {
                                const token = 'Bearer ' + await generateToken({ id: user.id });
                                database.execute('UPDATE users SET "token" = ?, otp = ? WHERE id = ?', [token, otpCode, user.id], { prepare: true }).then(() => {
                                    
                                        try {
                                            email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                                'Subject: Important changes to your account\n',
                                                'From: harmonyopenchat@gmail.com\n',
                                                'To: ' + user.email + '\n\n',
                                                'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                                'We received and processed a request to protect your account with 2FA.\n',
                                                'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                                'Best regards,\n',
                                                'Harmony Open Chat\n\n'].join('')).toString('base64url'));
                                        } catch {
                                            logger.error("Error emailing " + user.email);
                                        }
                                        res.send({});
                                    
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
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/users/@me/otp', async (req: express.Request, res: express.Response) => {
        if (req.headers.password && req.headers.otp) {
            database.execute('SELECT * FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(async dbRes => {
            
                const user = dbRes.rows[0];
                    if (user?.otp) {
                        if (req.headers.password && (await argon2.verify(user.password, req.headers.password?.toString(), { type: argon2.argon2id })) && twofactor.verifyToken(user.otp, req.headers.otp?.toString())) {
                            const token = 'Bearer ' + await generateToken({ id: user.id });
                            database.execute('UPDATE users SET "token" = ?, otp = ? WHERE id = ?', [token, '', user.id], { prepare: true }).then(() => {
                                
                                    try {
                                        email.sendMessage(Buffer.from(['MIME-Version: 1.0\n',
                                            'Subject: Important changes to your account\n',
                                            'From: harmonyopenchat@gmail.com\n',
                                            'To: ' + user.email + '\n\n',
                                            'Dear ' + user.username + '#' + user.discriminator + ':\n',
                                            'We received and processed a request to remove your account 2FA protection.\n',
                                            'If you didn\'t request this, please contact our support team as soon as possible.\n',
                                            'Best regards,\n',
                                            'Harmony Open Chat\n\n'].join('')).toString('base64url'));
                                    } catch {
                                        logger.error("Error emailing " + user.email);
                                    }
                                    res.send({});
                                
                            });
                        } else {
                            res.status(401).send({ error: "Invalid information." });
                        }
                    } else {
                        res.status(403).send({ error: "2FA not set up." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/users/@me/avatar', upload.single('avatar'), (req: express.Request, res: express.Response) => {
        database.execute('SELECT * FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(async dbRes => {
            
            const user = dbRes.rows[0];
                if (user?.type === 'USER') {
                    if (req.body.password && (await argon2.verify(user.password, req.body.password, { type: argon2.argon2id }))) {

                        const { token, password, verificator, otp, owner, ...rest } = user as unknown as User;
                        const returnedUser: ReturnedUser = { ...rest, creation: user.creation, tfa: !!user.otp };
                        if (req.file) {
                            if (mime.extension(req.file?.mimetype ?? '') === 'png') {
                                const icon = await uploadFile(req.file);
                                database.execute('UPDATE users SET avatar = ? WHERE id = ?', [icon, user.id], { prepare: true }).then(() => {
                                    
                                        websockets.get(user.id.toString())?.forEach(websocket => {
                                            websocket.send(JSON.stringify({ event: 'userNewAvatar', user: returnedUser }));
                                        });
                                        res.send(returnedUser);
                                    
                                });
                            } else {
                                res.status(400).send({ error: "We only accept PNG." });
                            }
                        } else {
                            database.execute('SELECT * FROM users WHERE id = ?', [res.locals.user], { prepare: true }).then(dbRes => {
                                
                                    if (dbRes.rows[0]?.avatar) {
                                        database.execute('UPDATE users SET avatar = ? WHERE id = ?', ['userDefault', user.id], { prepare: true }).then(() => {
                                            
                                                websockets.get(user.id)?.forEach(websocket => {
                                                    websocket.send(JSON.stringify({ event: 'userNewAvatar', user: returnedUser }));
                                                });
                                                res.send(returnedUser);
                                            
                                        });
                                    } else {
                                        res.status(400).send({ error: "Something is missing or it's not appropiate." });
                                    }
                                
                            });
                        }
                    } else {
                        res.status(401).send({ error: "Invalid information." });
                    }
                } else {
                    res.status(403).send({ error: "Only users can delete their account this way." });
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