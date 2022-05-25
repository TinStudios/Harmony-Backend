import { Role, Member } from "../interfaces";
import express from "express";
import cassandra from 'cassandra-driver';
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client) => {

    app.get('/guilds/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const roleId = urlParams[1];
        if (guildId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const roles = guild?.roles ?? [];
                        if (roles.find((x: Role) => x?.id?.toString() === roleId)) {
                            res.send(roles.find((x: Role) => x?.id?.toString() === roleId));
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

    app.post('/guilds/*/roles', (req: express.Request, res: express.Response) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            if (req.body.name && req.body.name.length < 31) {
                database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                    const guild = dbRes.rows[0];
                        if (guild) {
                            const roles = guild.roles ?? [];
                            const members = guild.members;
                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000800) === 0x0000000800)) {
                                let permissions = 0;
                                let permissionsCodes: number[] = [];
                                req.body.permissions?.forEach((permission: string) => {
                                    switch (permission) {
                                        case 'CREATE_INSTANT_INVITE':
                                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000001) === 0x0000000001)) {
                                                permissionsCodes.push(0x0000000001);
                                            }
                                            break;

                                        case 'KICK_MEMBERS':
                                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000002) === 0x0000000002)) {
                                                permissionsCodes.push(0x0000000002);
                                            }
                                            break;

                                        case 'BAN_MEMBERS':
                                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000004) === 0x0000000004)) {
                                                permissionsCodes.push(0x0000000004);
                                            }
                                            break;

                                        case 'MANAGE_GUILD':
                                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000010) === 0x0000000010)) {
                                                permissionsCodes.push(0x0000000010);
                                            }
                                            break;

                                        case 'VIEW_AUDIT_LOG':
                                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000020) === 0x0000000020)) {
                                                permissionsCodes.push(0x0000000020);
                                            }
                                            break;

                                        case 'CHANGE_NICKNAME':
                                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000200) === 0x0000000200)) {
                                                permissionsCodes.push(0x0000000200);
                                            }
                                            break;

                                        case 'MANAGE_NICKNAMES':
                                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000400) === 0x0000000400)) {
                                                permissionsCodes.push(0x0000000400);
                                            }
                                            break;

                                        case 'MANAGE_ROLES':
                                            if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000800) === 0x0000000800)) {
                                                permissionsCodes.push(0x0000000800);
                                            }
                                            break;

                                        default:
                                            break;
                                    }
                                });
                                permissions = permissionsCodes.reduce((x, y) => {
                                    return x | y;
                                }, 0);
                                const role = { id: crypto.randomUUID(), name: req.body.name, permissions: permissions, color: require('is-color')(req.body.color) ? req.body.color : null, hoist: req.body.hoist === true };
                                roles.push(role);
                                database.execute('UPDATE guilds SET roles = ? WHERE id = ?', [roles, guildId], { prepare: true }).then(() => {
                                    
                                        members.forEach((member: Member) => {
                                            websockets.get(member?.id?.toString())?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'roleCreated', guild: guildId, role: role }));
                                            });
                                        });
                                        res.status(201).send(role);
                                    
                                });

                            } else {
                                res.status(403).send({ error: "Missing permission." });
                            }
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    
                });
            } else {
                res.status(400).send({ error: "Something is missing or it's not appropiate." });
            }
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.patch('/guilds/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const roleId = urlParams[1];
        if (guildId && roleId && req.body.name) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const roles = guild.roles ?? [];
                        const members = guild.members;
                        const role = roles.find((x: Role) => x?.id?.toString() === roleId);
                        if (role) {
                            if (roles.findIndex((role: Role) => members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes(role.id)) < roles.findIndex((x: Role) => x?.id?.toString() === roleId) && members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000800) === 0x0000000800)) {
                                let permissions = 0;
                                let permissionsCodes: number[] = [];
                                if (req.body.permissions) {
                                    req.body.permissions?.forEach((permission: string) => {
                                        switch (permission) {
                                            case 'CREATE_INSTANT_INVITE':
                                                if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000001) === 0x0000000001)) {
                                                    permissionsCodes.push(0x0000000001);
                                                }
                                                break;

                                            case 'KICK_MEMBERS':
                                                if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000002) === 0x0000000002)) {
                                                    permissionsCodes.push(0x0000000002);
                                                }
                                                break;

                                            case 'BAN_MEMBERS':
                                                if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000004) === 0x0000000004)) {
                                                    permissionsCodes.push(0x0000000004);
                                                }
                                                break;

                                            case 'MANAGE_GUILD':
                                                if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000010) === 0x0000000010)) {
                                                    permissionsCodes.push(0x0000000010);
                                                }
                                                break;

                                            case 'VIEW_AUDIT_LOG':
                                                if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000020) === 0x0000000020)) {
                                                    permissionsCodes.push(0x0000000020);
                                                }
                                                break;

                                            case 'CHANGE_NICKNAME':
                                                if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000200) === 0x0000000200)) {
                                                    permissionsCodes.push(0x0000000200);
                                                }
                                                break;

                                            case 'MANAGE_NICKNAMES':
                                                if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000400) === 0x0000000400)) {
                                                    permissionsCodes.push(0x0000000400);
                                                }
                                                break;

                                            case 'MANAGE_ROLES':
                                                if (members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id.toString() === x).permissions & 0x0000000800) === 0x0000000800)) {
                                                    permissionsCodes.push(0x0000000800);
                                                }
                                                break;

                                            default:
                                                break;
                                        }
                                    });
                                    permissions = permissionsCodes.reduce((x, y) => {
                                        return x | y;
                                    }, 0);
                                } else {
                                    permissions = role.permissions;
                                }
                                role.name = req.body.name && req.body.name.length < 31 ? req.body.name : role.name;
                                role.permissions = permissions;
                                role.color = require('is-color')(req.body.color) ? req.body.color : req.body.color != false ? role.color : null;
                                role.hoist = typeof req.body.hoist === 'boolean' ? req.body.hoist : role.hoist;
                                roles[roles.findIndex((x: Role) => x?.id?.toString() === roleId)] = role;
                                database.execute('UPDATE guilds SET roles = ? WHERE id = ?', [roles, guildId], { prepare: true }).then(() => {
                                    
                                        members.forEach((member: Member) => {
                                            websockets.get(member?.id?.toString())?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'roleEdited', guild: guildId, role: role }));
                                            });
                                        });
                                        res.send(role);
                                    
                                });
                            } else {
                                res.status(403).send({ error: "Missing permission." });
                            }
                        } else {
                            res.status(403).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });

    app.delete('/guilds/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const roleId = urlParams[1];
        if (guildId && roleId) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(dbRes => {
                
                const guild = dbRes.rows[0];
                    if (guild && guild.members.find((x: Member) => x?.id?.toString() === res.locals.user)) {
                        const roles = guild.roles ?? [];
                        const members = guild.members;
                        const role = roles.find((x: Role) => x?.id?.toString() === roleId);
                        if (role) {
                            if (roles.findIndex((role: Role) => members.find((x: Member) => x?.id?.toString() === res.locals.user)?.roles.includes(role.id)) < roles.findIndex((x: Role) => x?.id?.toString() === roleId) && members.find((x: Member) => x?.id?.toString() === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id?.toString() === x)?.permissions & 0x0000000800) === 0x0000000800) && Number(roleId) != 0 && Number(roleId) != 1) {
                                const index = roles.findIndex((x: Role) => x?.id?.toString() === roleId);
                                roles.splice(index, 1);

                                database.execute('UPDATE guilds SET roles = ? WHERE id = ?', [roles, guildId], { prepare: true }).then(() => {
                                    
                                        members.forEach((member: Member) => {
                                            websockets.get(member?.id?.toString())?.forEach(websocket => {
                                                websocket.send(JSON.stringify({ event: 'roleDeleted', guild: guildId, role: roleId }));
                                            });
                                        });
                                        res.send({});
                                    
                                });
                            } else {
                                res.status(403).send({ error: "Missing permission." });
                            }
                        } else {
                            res.status(404).send({ error: "Not found." })
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