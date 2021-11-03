import express from 'express';
import { Client } from 'pg';
import { User } from '../interfaces';

import FlakeId from 'flake-idgen';
const flake = new FlakeId();

import account from './account';

import users from './users';

    import messages from './messages';

    import channels from './channels';

    import roles from './roles';

    import members from './members';

    import guilds from './guilds';

    import friends from './friends';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {
    app.use('/icons', require('express').static(__dirname + '/../../icons'));

    account(websockets, app, database, flake);

    app.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const user: User = await checkLogin(req.headers.authorization ?? "");
       if(user.creation != 0) {
                    res.locals.user = user.id;
                    next();
       } else {
           res.status(401).send({});
       }
    });
    users(websockets, app, database);

    messages(websockets, app, database, flake);

   channels(websockets, app, database, flake);

    roles(websockets, app, database, flake);

    members(websockets, app, database);

    guilds(websockets, app, database, flake);

    friends(websockets, app, database);

    app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(404).send({});
    });

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(500).send({});
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
                creation: 0
            };
            database.query(`SELECT * FROM users`, async (err, res) => {
                if (!err) {
                    if (res.rows.map(x => x.token == token).includes(true)) {
                        try {
                            const { importSPKI } = require('jose/key/import');
                            const { jwtVerify } = require('jose/jwt/verify');

                            const ecPublicKey = await importSPKI(require('fs').readFileSync(__dirname + '/../../public.key').toString(), 'ES256');

                            const info = await jwtVerify(token.split('Bearer ')[1], ecPublicKey, {
                                issuer: 'seltorn',
                                audience: 'seltorn'
                            });
                            resolve(res.rows.find(x => x.token == token));

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