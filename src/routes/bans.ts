import { Member, Role } from '../interfaces';
import express from "express";
import cassandra from 'cassandra-driver';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client) => {

    app.get('/guilds/*/bans', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                    const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: string) => (((guild.roles ?? []) ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000004) === 0x0000000004)) {
                        database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                            
                                const bans = guild.bans ?? [];

                                res.send(bans.filter((x: string) => x).map((x: string) => {
                                    let y = {
                                        id: x,
                                        username: dbRes.rows.find(y => x === y.id.toString())?.username ?? 'Deleted User',
                                        discriminator: dbRes.rows.find(y => x === y.id.toString())?.discriminator ?? '0000',
                                        avatar: dbRes.rows.find(y => x === y.id.toString())?.avatar ?? 'userDefault',
                                        about: dbRes.rows.find(y => x === y.id.toString())?.about
                                    };
                                    return y;
                                }).filter((x: Member) => x).sort((a: Member, b: Member) => a.username > b.username ? 1 : a.username < b.username ? -1 : 0));
                            
                        });
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/guilds/*/bans/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const userId = urlParams[1];
        if (guildId && userId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const members = guild.members;
                        const user = members.find((x: Member) => x?.id?.toString() === userId);
                        if (user) {
                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.find((x: string) => (((guild.roles ?? []) ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000004) === 0x0000000004)) {
                                let bans = guild.bans ?? [];
                                if(bans.includes(userId)) {
                                    bans.splice(bans.indexOf(userId));
                                database.execute('UPDATE guilds SET members = ?, bans = ? WHERE id = ?', [members, bans, guildId], { prepare: true }).then(() => {
                                    
                                            members.filter((member: Member) => members.find((x: Member) => x?.id?.toString() === member.id)?.roles.find((x: string) => (((guild.roles ?? []) ?? []).find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000004) === 0x0000000004)).forEach((member: Member) => {
                                                websockets.get(member.id.toString())?.forEach(websocket => {
                                                    websocket.send(JSON.stringify({ event: 'memberUnbanned', guild: guildId, member: user }));
                                                });
                                            });
                                        res.send(user);
                                    
                                });
                            } else {
                                res.status(404).send({ error: "Not found." });
                            }
                            } else {
                                res.status(403).send({ error: "Missing permission." });
                            }
                        } else {
                            res.status(404).send({ error: "Not found." });
                        }
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

};