import express from 'express';
import { Client } from 'pg';
import { NFTStorage } from 'nft.storage';
import fetch from 'node-fetch';
import UserAgent from 'user-agents';
import * as cheerio from 'cheerio';
import { fromBuffer } from 'file-type';
import { User, FileI } from '../interfaces';

import * as email from '../utils/email';

import account from './account';

import users from './users';

import invites from './invites';

import messages from './messages';

import pins from './pins';

import channels from './channels';

import roles from './roles';

import members from './members';

import guilds from './guilds';

import friends from './friends';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, logger: any, storage: NFTStorage, clientDomain: string) => {
    email.authorize();

    account(websockets, app, database, logger, email, checkLogin, clientDomain);

    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!req.url.startsWith('/files/') && !req.url.startsWith('/proxy/')) {
            const user: User = await checkLogin(req.headers.authorization ?? "");
            if (user.creation != 0) {
                res.locals.user = user.id;
                next();
            } else {
                res.status(401).send({ error: "Incorrect information." });
            }
        } else {
            next();
        }
    });

    users(websockets, app, database, logger, email, storage);

    invites(websockets, app, database);

    messages(websockets, app, database, storage);

    pins(websockets, app, database);

    channels(websockets, app, database);

    roles(websockets, app, database);

    members(websockets, app, database);

    guilds(websockets, app, database, storage);

    friends(websockets, app, database);

    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const urlSplitted = req.url.split('/');
            if(req.url.startsWith('/files/') && urlSplitted.length > 3) {
            database.query('SELECT * FROM files', async (err, dbRes) => {
                if(!err) {
                    const extensionLess = urlSplitted[3].includes('.') ? urlSplitted[3].split('').slice(0, urlSplitted[3].split('').lastIndexOf('.')).join('') : urlSplitted[3];
                    const file = dbRes.rows.find((x: FileI) => x.id === extensionLess && x.type === urlSplitted[2]);
                    if(urlSplitted[2] === 'users' && !file) {
                        res.redirect(dbRes.rows.find((x: FileI) => x.id === 'default' && x.type === 'users').url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/'));
                    } else if(file) {
                        res.redirect(file.url.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/'));
                        } else {
                        res.status(404).send({ error: "Not found." });
                        }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else if(req.url.startsWith('/meta/')) {
            const url = req.url.replace('/meta/', '');
            database.query('SELECT * FROM meta', async (err, dbRes) => {
                if (!err) {
                const metasDb = dbRes.rows.find(x => x.url === url) 
                if(!metasDb || (metasDb && Date.now() > (metasDb.creation + 86400000))) {
            try {
                    const fetchy = await fetch(url, {
                        headers: {
                            'User-Agent': (new UserAgent()).toString()
                        }
                    });
                    const response = await fetchy.text();
                    const html = cheerio.load(response);
                    let metas = {
                        title: '',
                        description: '',
                        image: ''
                    };
                    metas.title = html('meta[property="og:title"]').attr('content') ?? html('meta[property="title"]').attr('content') ?? '';
                    metas.description = html('meta[property="og:description"]').attr('content') ?? html('meta[property="description"]').attr('content') ?? '';
                    metas.image = html('meta[property="og:image"]').attr('content') ?? '';
                    database.query('INSERT INTO meta (url, creation, title, description, image) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (url) DO UPDATE SET creation = $2, title = $3, description = $4, image = $5', [url, Date.now(), metas.title, metas.description, metas.image], (err, dbRes) => {
                        if(!err) {
                    res.send(metas);
                    } else {
                        res.status(500).send({ error: "Something went wrong with our server." });
                    }
                });
                    } catch {
                        res.status(500).send({ error: "Something went wrong with our server." });
                    }
                } else {
                    delete metasDb.url;
                    delete metasDb.creation;
                    res.send(metasDb);
                }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else if(req.url.startsWith('/proxy/')) {
            try {
            const fetchy = await fetch(req.url.replace('/proxy/', ''), {
                headers: {
                    'User-Agent': (new UserAgent()).toString()
                }
            });
            const response = await fetchy.buffer();
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

    async function checkLogin(token: string): Promise<User> {
        return await new Promise(resolve => {
            const emptyUser: User = {
                id: "",
                token: "",
                email: "",
                password: "",
                username: "",
                discriminator: "",
                creation: 0,
                verified: false,
                verificator: '',
                otp: ''
            };
            database.query('SELECT * FROM users', async (err, res) => {
                if (!err) {
                    if (res.rows.find(x => x.token === token) && res.rows.find(x => x.token === token).verified) {
                        try {
                            const { importSPKI } = require('jose/key/import');
                            const { jwtVerify } = require('jose/jwt/verify');

                            const ecPublicKey = await importSPKI(require('fs').readFileSync(__dirname + '/../../public.key').toString(), 'ES256');

                            const info = await jwtVerify(token.split('Bearer ')[1], ecPublicKey, {
                                issuer: 'seltorn',
                                audience: 'seltorn'
                            });
                            resolve(res.rows.find(x => x.token === token));

                        } catch {
                            resolve(emptyUser);
                        }
                    } else {
                        resolve(emptyUser);
                    }
                } else {
                    resolve(emptyUser);
                }
            });
        });
    }
};