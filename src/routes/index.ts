import express from 'express';
import cassandra from 'cassandra-driver';
import got from 'got-cjs';
import { Blob } from 'node:buffer';
import { FormData } from 'formdata-node';
import UserAgent from 'user-agents';
import * as cheerio from 'cheerio';
import { fromBuffer } from 'file-type';
import { User } from '../interfaces';

import * as email from '../utils/email';

import account from './account';

import users from './users';

import invites from './invites';

import messages from './messages';

import pins from './pins';

import channels from './channels';

import roles from './roles';

import members from './members';

import bans from './bans';

import guilds from './guilds';

import bots from './bots';

import webhooks from './webhooks';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client, logger: any, storageApiKey: string, recaptchaSecret: string, storageDomain: string, clientDomain: string) => {
    email.authorize();

    account(websockets, app, database, logger, email, checkLogin, recaptchaSecret, clientDomain);

    webhooks(websockets, app, database);

    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!req.url.startsWith('/proxy/')) {
            const user = await checkLogin(req.headers.authorization ?? "");
            if (typeof user !== 'boolean') {
                if (user.type !== 'SUSPENDED') {
                    if (user.type === 'BOT' && (req.url.startsWith('/friends') || req.url.startsWith('/bots'))) {
                        if (req.url.startsWith('/friends')) {
                            res.status(403).send({ error: "Bots can't have friends." });
                        } else {
                            res.status(403).send({ error: "Bots can't have bots." });
                        }
                    } else {
                        res.locals.user = user.id.toString();
                        next();
                    }
                } else {
                    res.status(403).send({ error: "Account suspended." });
                }
            } else {
                res.status(401).send({ error: "Invalid information." });
            }
        } else {
            next();
        }
    });

    users(websockets, app, database, logger, email, uploadFile);

    invites(websockets, app, database);

    messages(websockets, app, database, uploadFile);

    pins(websockets, app, database);

    channels(websockets, app, database);

    members(websockets, app, database);

    bans(websockets, app, database);

    roles(websockets, app, database);

    guilds(websockets, app, database, uploadFile);

    bots(websockets, app, database, uploadFile);

    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (req.url.startsWith('/meta/')) {
            const url = req.url.replace('/meta/', '');
            database.execute('SELECT * FROM meta WHERE url id = ?', [url], { prepare: true }).then(async dbRes => {     
                    const metasDb = dbRes.rows[0];
                    if (!metasDb || (metasDb && Date.now() > (metasDb.creation + 86400000))) {
                        try {
                            const response = await got.get(url, {
                                headers: {
                                    'User-Agent': (new UserAgent()).toString()
                                }
                            }).text();
                            const html = cheerio.load(response);
                            let metas = {
                                title: '',
                                description: '',
                                image: ''
                            };
                            metas.title = html('meta[property="og:title"]').attr('content') ?? html('meta[property="title"]').attr('content') ?? '';
                            metas.description = html('meta[property="og:description"]').attr('content') ?? html('meta[property="description"]').attr('content') ?? '';
                            metas.image = html('meta[property="og:image"]').attr('content') ?? '';
                            database.execute('INSERT INTO meta (url, creation, title, description, image) VALUES (?, ?, ?, ?, ?)', [url, Date.now(), metas.title, metas.description, metas.image], { prepare: true }).then(() => {
                                    res.send(metas);
                            });
                        } catch {
                            res.status(500).send({ error: "Something went wrong with our server." });
                        }
                    } else {
                        delete metasDb.url;
                        delete metasDb.creation;
                        res.send(metasDb);
                    }
            });
        } else if (req.url.startsWith('/proxy/')) {
            try {
                const response = await got.get(req.url.replace('/proxy/', ''), {
                    headers: {
                        'User-Agent': (new UserAgent()).toString()
                    }
                }).buffer();
                res.set('Content-Type', (await fromBuffer(response))?.mime).send(response);
            } catch {
                res.status(500).send({ error: "Something went wrong with our server." });
            }
        } else {
            res.status(404).send({ error: "Not found." });
        }
    });

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(500).send({ error: "Something went wrong with our server." });
    });

    async function uploadFile(file: Express.Multer.File) {
        const form = new FormData();

        form.set('file', new Blob([file.buffer], { type: file.mimetype }));

        const response = await got.post(storageDomain, {
            body: form,
            headers: {
                'Authorization': storageApiKey
            }
        }).text();
        return response;
    }

    async function checkLogin(token: string): Promise<User | boolean> {
        return await new Promise(resolve => {
            database.execute('SELECT * FROM users WHERE "token" = ? ALLOW FILTERING', [token], { prepare: true }).then(async res => {
                    if (res.rows[0]?.verified) {
                        try {
                            const { importSPKI } = require('jose/key/import');
                            const { jwtVerify } = require('jose/jwt/verify');

                            const ecPublicKey = await importSPKI(require('fs').readFileSync(__dirname + '/../../public.key').toString(), 'ES256');

                            const info = await jwtVerify((token.startsWith('Bearer ') ? token.split('Bearer ') : token.split('Bot '))[1], ecPublicKey, {
                                issuer: 'harmony',
                                audience: 'harmony'
                            });
                            resolve(res.rows.find(x => x.token === token) as unknown as User);

                        } catch {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
            });
        });
    }
};