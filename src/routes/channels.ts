import { Member, Channel, Role } from '../interfaces';
import express from "express";
import { Client } from "pg";
import FlakeId from 'flake-idgen';
const intformat = require('biguint-format');

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, flake: FlakeId) => {

    app.get('/guilds/*/channels/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        const channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id == channelId);
                        if (channel) {
                            delete channel.messages;
                            delete channel.pins;
                            res.send(channel);
                        } else {
                            res.status(404).send({});
                        }
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });

    app.post('/guilds/*/channels', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId && req.body.name && req.body.name.length < 31) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (JSON.parse(guild.roles).find((y: Role) => y.id == x).permissions & 0x0000000010) == 0x0000000010)) {
                        if (guild) {
                            let channels = JSON.parse(guild.channels);
                            const channel = {
                                id: intformat(flake.next(), 'dec').toString(),
                                name: req.body.name,
                                topic: null,
                                creation: Date.now(),
                                roles: [{ id: 0, permissions: 456 }, { id: 1, permissions: 192 }],
                                messages: [],
                                pins: []
                            };
                            channels.push(channel);
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    websockets.get(res.locals.user)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'channelCreated', channel: channel }));
                                    });
                                    res.status(200).send(channel);
                                } else {
                                    res.status(500).send({});
                                }
                            });
                        } else {
                            res.status(404).send({});
                        }
                    } else {
                        res.status(401).send({})
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
        }
    });

    app.patch('/guilds/*/channels/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const roleId = urlParams[2];
        if (guildId && channelId && roleId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find((x: Channel) => x?.id == channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000008) == 0x0000000008).includes(true)) {
                            
                            if(JSON.parse(guild.roles).find((x: Role) => x.id == roleId) && req.body.permissions) {
                                const roles = JSON.parse(guild.roles);

                                let role = channel.roles.find((x: Role) => x?.id == roleId) ?? {};

                                let permissions = 0;
                                let permissionsCodes: number[] = [];
                                req.body.permissions?.forEach((permission: string) => {
                                    switch (permission) {
                                        case 'VIEW_CHANNEL':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000040) == 0x0000000040).includes(true)) {
                                                permissionsCodes.push(0x0000000040);
                                            }
                                            break;

                                        case 'SEND_MESSAGES':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000080) == 0x0000000080).includes(true)) {
                                                permissionsCodes.push(0x0000000080);
                                            }
                                            break;

                                        case 'MANAGE_MESSAGES':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000100) == 0x0000000100).includes(true)) {
                                                permissionsCodes.push(0x0000000100);
                                            }
                                            break;

                                        default:
                                            break;
                                    }
                                });
                                permissions = permissionsCodes.reduce((x, y) => {
                                    return x | y;
                                }, 0);
                                
                                console.log(permissionsCodes);

                                role.id = roleId;
                                role.permissions = permissions;
                                
                                channel.roles[channel.roles.findIndex((x: Channel) => x.id == roleId)] = role;

                            channels[channels.findIndex((x: Channel) => x?.id == channelId)] = channel;

                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                        JSON.parse(guild.members).forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'channelEdited', channel: channel }));
                                            });
                                        });
                                        res.status(200).send(channel);
                                } else {
                                    res.status(500).send({});
                                }
                            });
                        } else {
                            res.status(400).send({});
                        }
                        } else {
                            res.status(401).send({});
                        }
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });

    app.patch('/guilds/*/channels/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    let channels = JSON.parse(guild.channels);
                    let channel = channels.find((x: Channel) => x?.id == channelId);
                    if (channel) {
                        if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000008) == 0x0000000008).includes(true)) {
                            let changesWereMade = false;

                            if (req.body.name && req.body.name.length < 31) {
                                channel.name = req.body.name;
                                changesWereMade = true;
                            }

                            if (req.body.topic && req.body.topic.length < 1025) {
                                channel.topic = req.body.topic;
                                changesWereMade = true;
                            }

                            channels[channels.findIndex((x: Channel) => x?.id == channelId)] = channel;

                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    if (changesWereMade) {
                                        JSON.parse(guild.members).forEach((member: Member) => {
                                            websockets.get(member.id)?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'channelEdited', channel: channel }));
                                            });
                                        });
                                        res.status(200).send(channel);
                                    } else {
                                        res.status(400).send({});
                                    }
                                } else {
                                    res.status(500).send({});
                                }
                            });
                        } else {
                            res.status(401).send({});
                        }
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });

    app.delete('/guilds/*/channels/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x: string) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        if (guildId && channelId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id == guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        const channel = channels.find((x: Channel) => x?.id == channelId);
                        if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user)?.roles.map((x: string) => channel.roles.find((y: Role) => y.id == x)).map((x: Role) => (x.permissions & 0x0000000008) == 0x0000000008).includes(true)) {
                            channels.splice(channels.findIndex((x: Channel) => x?.id == channelId), 1)
                            database.query(`UPDATE guilds SET channels = $1 WHERE id = $2`, [JSON.stringify(channels), guildId], (err, dbRes) => {
                                if (!err) {
                                    websockets.get(res.locals.user)?.forEach(websocket => {
                                        websocket.send(JSON.stringify({ event: 'channelDeleted', channel: channel }));
                                    });
                                    res.status(200).send(channel);
                                } else {
                                    res.status(500).send({});
                                }
                            });
                        } else {
                            res.status(401).send({});
                        }
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(404).send({});
        }
    });
};