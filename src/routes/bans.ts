import { Member, Role } from '../interfaces';
import express from "express";
import { Client } from "pg";

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {

    app.get('/guilds/*/bans', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000004) === 0x0000000004)) {
                        database.query('SELECT * FROM users', async (err, dbRes) => {
                            if (!err) {
                                const bans = JSON.parse(guild.bans);

                                res.send(bans.filter((x: string) => x).map((x: string) => {
                                    let y = {
                                        id: x,
                                        username: dbRes.rows.find(y => x === y.id)?.username ?? 'Deleted User',
                                        discriminator: dbRes.rows.find(y => x === y.id)?.discriminator ?? '0000',
                                        avatar: dbRes.rows.find(y => x === y.id)?.avatar ?? 'userDefault',
                                        about: dbRes.rows.find(y => x === y.id)?.about
                                    };
                                    return y;
                                }).filter((x: Member) => x).sort((a: Member, b: Member) => a.username > b.username ? 1 : a.username < b.username ? -1 : 0));
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
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
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild && JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user)) {
                        const members = JSON.parse(guild.members);
                        const user = members.find((x: Member) => x?.id === userId);
                        if (user) {
                            if (members.find((x: Member) => x?.id === res.locals.user)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000004) === 0x0000000004)) {
                                let bans = JSON.parse(guild.bans);
                                if(bans.includes(userId)) {
                                    bans.splice(bans.indexOf(userId));
                                database.query('UPDATE guilds SET members = $1, bans = $2 WHERE id = $3', [JSON.stringify(members), JSON.stringify(bans), guildId], (err, dbRes) => {
                                    if (!err) {
                                            members.filter((member: Member) => members.find((x: Member) => x?.id === member.id)?.roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y?.id === x)?.permissions & 0x0000000004) === 0x0000000004)).forEach((member: Member) => {
                                                websockets.get(member.id)?.forEach(websocket => {
                                                    websocket.send(JSON.stringify({ event: 'memberUnbanned', guild: guildId, member: user }));
                                                });
                                            });
                                        res.send(user);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
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
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

};