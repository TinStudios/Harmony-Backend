import { Role, Member } from "../interfaces";
import express from "express";
import { Client } from "pg";
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {

    app.get('/guilds/*/roles', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const roles = JSON.parse(guild.roles);
                        res.send(roles);
                    } else {
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.get('/guilds/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const roleId = urlParams[1];
        if (guildId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const roles = JSON.parse(guild?.roles);
                        if (roles.find((x: Role) => x?.id === roleId)) {
                            res.send(roles.find((x: Role) => x?.id === roleId));
                        } else {
                            res.status(404).send({ error: "Role not found." });
                        }
                    } else {
                        res.status(404).send({ error: "Guild not found" });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(404).send({ error: "Not found." });
        }
    });

    app.post('/guilds/*/roles', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            if (req.body.name && req.body.name.length < 31) {
                database.query('SELECT * FROM guilds', (err, dbRes) => {
                    if (!err) {
                        const guild = dbRes.rows.find(x => x?.id === guildId);
                        if (guild) {
                            const roles = JSON.parse(guild.roles);
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id === x)?.permissions & 0x0000000800) === 0x0000000800)) {
                                let permissions = 0;
                                let permissionsCodes: number[] = [];
                                req.body.permissions?.forEach((permission: string) => {
                                    switch (permission) {
                                        case 'CREATE_INSTANT_INVITE':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000001) === 0x0000000001)) {
                                                permissionsCodes.push(0x0000000001);
                                            }
                                            break;

                                        case 'KICK_MEMBERS':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000002) === 0x0000000002)) {
                                                permissionsCodes.push(0x0000000002);
                                            }
                                            break;

                                        case 'BAN_MEMBERS':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000004) === 0x0000000004)) {
                                                permissionsCodes.push(0x0000000004);
                                            }
                                            break;

                                        case 'MANAGE_GUILD':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000010) === 0x0000000010)) {
                                                permissionsCodes.push(0x0000000010);
                                            }
                                            break;

                                        case 'VIEW_AUDIT_LOG':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000020) === 0x0000000020)) {
                                                permissionsCodes.push(0x0000000020);
                                            }
                                            break;

                                        case 'CHANGE_NICKNAME':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000200) === 0x0000000200)) {
                                                permissionsCodes.push(0x0000000200);
                                            }
                                            break;

                                        case 'MANAGE_NICKNAMES':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000400) === 0x0000000400)) {
                                                permissionsCodes.push(0x0000000400);
                                            }
                                            break;

                                        case 'MANAGE_ROLES':
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000800) === 0x0000000800)) {
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
                                database.query('UPDATE guilds SET roles = $1 WHERE id = $2', [JSON.stringify(roles), guildId], (err, dbRes) => {
                                    if (!err) {
                                        res.status(201).send(role);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });

                            } else {
                                res.status(403).send({ error: "Missing permission." });
                            }
                        } else {
                            res.status(404).send({ error: "Guild not found." });
                        }
                    } else {
                        res.status(500).send({ error: "Something went wrong with our server." });
                    }
                });
            } else {
                res.status(400).send({ error: "Something is missing." });
            }
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.patch('/guilds/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const roleId = urlParams[1];
        if (guildId && roleId) {
            if (req.body.name) {
                database.query('SELECT * FROM guilds', (err, dbRes) => {
                    if (!err) {
                        const guild = dbRes.rows.find(x => x?.id === guildId);
                        if (guild) {
                            const roles = JSON.parse(guild.roles);
                            const role = roles.find((x: Role) => x?.id === roleId);
                            if (role) {
                                if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id === x)?.permissions & 0x0000000800) === 0x0000000800)) {
                                    let permissions = 0;
                                    let permissionsCodes: number[] = [];
                                    if (req.body.permissions) {
                                        req.body.permissions?.forEach((permission: string) => {
                                            switch (permission) {
                                                case 'CREATE_INSTANT_INVITE':
                                                    if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000001) === 0x0000000001)) {
                                                        permissionsCodes.push(0x0000000001);
                                                    }
                                                    break;

                                                case 'KICK_MEMBERS':
                                                    if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000002) === 0x0000000002)) {
                                                        permissionsCodes.push(0x0000000002);
                                                    }
                                                    break;

                                                case 'BAN_MEMBERS':
                                                    if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000004) === 0x0000000004)) {
                                                        permissionsCodes.push(0x0000000004);
                                                    }
                                                    break;

                                                case 'MANAGE_GUILD':
                                                    if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000010) === 0x0000000010)) {
                                                        permissionsCodes.push(0x0000000010);
                                                    }
                                                    break;

                                                case 'VIEW_AUDIT_LOG':
                                                    if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000020) === 0x0000000020)) {
                                                        permissionsCodes.push(0x0000000020);
                                                    }
                                                    break;

                                                case 'CHANGE_NICKNAME':
                                                    if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000200) === 0x0000000200)) {
                                                        permissionsCodes.push(0x0000000200);
                                                    }
                                                    break;

                                                case 'MANAGE_NICKNAMES':
                                                    if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000400) === 0x0000000400)) {
                                                        permissionsCodes.push(0x0000000400);
                                                    }
                                                    break;

                                                case 'MANAGE_ROLES':
                                                    if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000800) === 0x0000000800)) {
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
                                    role.name = req.body.name && req.body.length < 31 ? req.body.name : role.name;
                                    role.permissions = permissions;
                                    role.color = require('is-color')(req.body.color) ? req.body.color : req.body.color != false ? role.color : null;
                                    role.hoist = typeof req.body.hoist === 'boolean' ? req.body.hoist : role.hoist;
                                    roles[roles.findIndex((x: Role) => x?.id === roleId)] = role;
                                    database.query('UPDATE guilds SET roles = $1 WHERE id = $2', [JSON.stringify(roles), guildId], (err, dbRes) => {
                                        if (!err) {
                                            res.send(role);
                                        } else {
                                            res.status(500).send({ error: "Something went wrong with our server." });
                                        }
                                    });
                                } else {
                                    res.status(403).send({ error: "Missing permission." });
                                }
                            } else {
                                res.status(404).send({ error: "Role not found." });
                            }
                        } else {
                            res.status(404).send({ error: "Guild not found." });
                        }
                    } else {
                        res.status(500).send({ error: "Something went wrong with our server." });
                    }
                });
            } else {
                res.status(400).send({ error: "Something is missing." });
            }
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

    app.delete('/guilds/*/roles/*', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const urlParams = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const roleId = urlParams[1];
        if (guildId && roleId) {
            database.query('SELECT * FROM guilds', (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const roles = JSON.parse(guild.roles);
                        const role = roles.find((x: Role) => x?.id === roleId);
                        if (role) {
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id === x)?.permissions & 0x0000000800) === 0x0000000800) && Number(roleId) != 0 && Number(roleId) != 1) {
                                const index = roles.findIndex((x: Role) => x?.id === roleId);
                                delete roles[index];

                                database.query('UPDATE guilds SET roles = $1 WHERE id = $2', [JSON.stringify(roles), guildId], (err, dbRes) => {
                                    if (!err) {
                                        res.send({});
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(403).send({ error: "Missing permission." });
                            }
                        } else {
                            res.status(404).send({})
                        }
                    } else {
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
        }
    });

};