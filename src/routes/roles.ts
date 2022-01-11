import { Role, Member } from "../interfaces";
import express from "express";
import { Client } from "pg";
<<<<<<< HEAD
<<<<<<< HEAD
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {
=======
import FlakeId from 'flake-idgen';
const intformat = require('biguint-format');

<<<<<<< HEAD
module.exports = (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, flake: FlakeId) => {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client, flake: FlakeId) => {
>>>>>>> 2aecc42 (Changed to import)
=======
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {
>>>>>>> d6bd0d1 (some changes)

    app.get('/guilds/*/roles', (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const guildId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const roles = JSON.parse(guild.roles);
                        res.send(roles);
<<<<<<< HEAD
                    } else {
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
=======
                    const guild = dbRes.rows.find(x => x?.id === guildId);
>>>>>>> f8e172d (asi ri ma na)
                    if (guild) {
                        const roles = JSON.parse(guild.roles);
                         res.send(roles);
=======
>>>>>>> 332c1ca (owo)
                    } else {
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(400).send({ error: "Something is missing." });
>>>>>>> 51556ba (Some changes)
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
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const roles = JSON.parse(guild?.roles);
                        if (roles.find((x: Role) => x?.id === roleId)) {
                            res.send(roles.find((x: Role) => x?.id === roleId));
                        } else {
                            res.status(404).send({ error: "Role not found." });
                        }
<<<<<<< HEAD
                    } else {
                        res.status(404).send({ error: "Guild not found" });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(404).send({ error: "Not found." });
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
=======
                    const guild = dbRes.rows.find(x => x?.id === guildId);
>>>>>>> f8e172d (asi ri ma na)
                    if(guild) {
                    const roles = JSON.parse(guild?.roles);
                    if (roles.find((x: Role) => x?.id === roleId)) {
                        res.send(roles.find((x: Role) => x?.id === roleId));
=======
>>>>>>> 332c1ca (owo)
                    } else {
                        res.status(404).send({ error: "Guild not found" });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(404).send({ error: "Not found." });
>>>>>>> 51556ba (Some changes)
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
                database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                    if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
                        const guild = dbRes.rows.find(x => x?.id === guildId);
                        if (guild) {
                            const roles = JSON.parse(guild.roles);
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id === x)?.permissions & 0x0000000800) === 0x0000000800)) {
=======
                        const guild = dbRes.rows.find(x => x?.id == guildId);
                        if (guild) {
                            const roles = JSON.parse(guild.roles);
<<<<<<< HEAD
                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id == x).permissions & 0x0000000800) == 0x0000000800)) {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id == x)?.permissions & 0x0000000800) == 0x0000000800)) {
>>>>>>> efdc2b8 (The Question:tm:)
=======
                        const guild = dbRes.rows.find(x => x?.id === guildId);
                        if (guild) {
                            const roles = JSON.parse(guild.roles);
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id === x)?.permissions & 0x0000000800) === 0x0000000800)) {
>>>>>>> f8e172d (asi ri ma na)
                                let permissions = 0;
                                let permissionsCodes: number[] = [];
                                req.body.permissions?.forEach((permission: string) => {
                                    switch (permission) {
                                        case 'CREATE_INSTANT_INVITE':
<<<<<<< HEAD
<<<<<<< HEAD
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000001) === 0x0000000001)) {
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id == x).permissions & 0x0000000001) == 0x0000000001)) {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000001) === 0x0000000001)) {
>>>>>>> f8e172d (asi ri ma na)
                                                permissionsCodes.push(0x0000000001);
                                            }
                                            break;

                                        case 'KICK_MEMBERS':
<<<<<<< HEAD
<<<<<<< HEAD
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000002) === 0x0000000002)) {
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id == x).permissions & 0x0000000002) == 0x0000000002)) {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000002) === 0x0000000002)) {
>>>>>>> f8e172d (asi ri ma na)
                                                permissionsCodes.push(0x0000000002);
                                            }
                                            break;

                                        case 'BAN_MEMBERS':
<<<<<<< HEAD
<<<<<<< HEAD
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000004) === 0x0000000004)) {
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id == x).permissions & 0x0000000004) == 0x0000000004)) {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000004) === 0x0000000004)) {
>>>>>>> f8e172d (asi ri ma na)
                                                permissionsCodes.push(0x0000000004);
                                            }
                                            break;

                                        case 'MANAGE_GUILD':
<<<<<<< HEAD
<<<<<<< HEAD
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000010) === 0x0000000010)) {
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id == x).permissions & 0x0000000010) == 0x0000000010)) {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000010) === 0x0000000010)) {
>>>>>>> f8e172d (asi ri ma na)
                                                permissionsCodes.push(0x0000000010);
                                            }
                                            break;

                                        case 'VIEW_AUDIT_LOG':
<<<<<<< HEAD
<<<<<<< HEAD
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000020) === 0x0000000020)) {
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id == x).permissions & 0x0000000020) == 0x0000000020)) {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000020) === 0x0000000020)) {
>>>>>>> f8e172d (asi ri ma na)
                                                permissionsCodes.push(0x0000000020);
                                            }
                                            break;

                                        case 'CHANGE_NICKNAME':
<<<<<<< HEAD
<<<<<<< HEAD
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000200) === 0x0000000200)) {
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id == x).permissions & 0x0000000200) == 0x0000000200)) {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000200) === 0x0000000200)) {
>>>>>>> f8e172d (asi ri ma na)
                                                permissionsCodes.push(0x0000000200);
                                            }
                                            break;

                                        case 'MANAGE_NICKNAMES':
<<<<<<< HEAD
<<<<<<< HEAD
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000400) === 0x0000000400)) {
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id == x).permissions & 0x0000000400) == 0x0000000400)) {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000400) === 0x0000000400)) {
>>>>>>> f8e172d (asi ri ma na)
                                                permissionsCodes.push(0x0000000400);
                                            }
                                            break;

                                        case 'MANAGE_ROLES':
<<<<<<< HEAD
<<<<<<< HEAD
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000800) === 0x0000000800)) {
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id == x).permissions & 0x0000000800) == 0x0000000800)) {
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y.id === x).permissions & 0x0000000800) === 0x0000000800)) {
>>>>>>> f8e172d (asi ri ma na)
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
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                                const role = { id: crypto.randomUUID(), name: req.body.name, permissions: permissions, color: require('is-color')(req.body.color) ? req.body.color : null, hoist: req.body.hoist === true };
                                roles.push(role);
                                database.query(`UPDATE guilds SET roles = $1 WHERE id = $2`, [JSON.stringify(roles), guildId], (err, dbRes) => {
                                    if (!err) {
                                        res.status(201).send(role);
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
=======
                                const role = { id: intformat(flake.next(), 'dec').toString(), name: req.body.name, permissions: permissions, color: require('is-color')(req.body.color) ? req.body.color : null, hoist: req.body.hoist == true };
=======
                                const role = { id: intformat(flake.next(), 'dec').toString(), name: req.body.name, permissions: permissions, color: require('is-color')(req.body.color) ? req.body.color : null, hoist: req.body.hoist === true };
>>>>>>> f8e172d (asi ri ma na)
=======
                                const role = { id: crypto.randomUUID(), name: req.body.name, permissions: permissions, color: require('is-color')(req.body.color) ? req.body.color : null, hoist: req.body.hoist === true };
>>>>>>> d6bd0d1 (some changes)
                                roles.push(role);
                                database.query(`UPDATE guilds SET roles = $1 WHERE id = $2`, [JSON.stringify(roles), guildId], (err, dbRes) => {
                                    if (!err) {
                                        res.status(201).send(role);
                                    } else {
<<<<<<< HEAD
                                        res.status(500).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                        res.status(500).send({ error: "Something went wrong with our server." });
>>>>>>> 51556ba (Some changes)
                                    }
                                });

                            } else {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
                                res.status(401).send({});
=======
                                res.status(403).send({});
>>>>>>> f899d83 (Some changes (like adding email verification))
=======
                                res.status(403).send({ error: "Missing permission." });
>>>>>>> 51556ba (Some changes)
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
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(400).send({ error: "Something is missing." });
>>>>>>> 51556ba (Some changes)
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
                database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                    if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
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

=======
                        const guild = dbRes.rows.find(x => x?.id == guildId);
=======
                        const guild = dbRes.rows.find(x => x?.id === guildId);
>>>>>>> f8e172d (asi ri ma na)
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
<<<<<<< HEAD
        
>>>>>>> 0718f96 (Changed to TypeScript)
=======

>>>>>>> 332c1ca (owo)
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
<<<<<<< HEAD
<<<<<<< HEAD
                                    role.hoist = typeof req.body.hoist === 'boolean' ? req.body.hoist : role.hoist;
                                    roles[roles.findIndex((x: Role) => x?.id === roleId)] = role;
                                    database.query(`UPDATE guilds SET roles = $1 WHERE id = $2`, [JSON.stringify(roles), guildId], (err, dbRes) => {
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
=======
                                    role.hoist = typeof req.body.hoist == 'boolean' ? req.body.hoist : role.hoist;
                                    roles[roles.findIndex((x: Role) => x?.id == roleId)] = role;
=======
                                    role.hoist = typeof req.body.hoist === 'boolean' ? req.body.hoist : role.hoist;
                                    roles[roles.findIndex((x: Role) => x?.id === roleId)] = role;
>>>>>>> f8e172d (asi ri ma na)
                                    database.query(`UPDATE guilds SET roles = $1 WHERE id = $2`, [JSON.stringify(roles), guildId], (err, dbRes) => {
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
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(400).send({ error: "Something is missing." });
>>>>>>> 51556ba (Some changes)
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
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        const roles = JSON.parse(guild.roles);
                        const role = roles.find((x: Role) => x?.id === roleId);
                        if (role) {
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id === x)?.permissions & 0x0000000800) === 0x0000000800) && Number(roleId) != 0 && Number(roleId) != 1) {
                                const index = roles.findIndex((x: Role) => x?.id === roleId);
=======
                    const guild = dbRes.rows.find(x => x?.id == guildId);
=======
                    const guild = dbRes.rows.find(x => x?.id === guildId);
>>>>>>> f8e172d (asi ri ma na)
                    if (guild) {
                        const roles = JSON.parse(guild.roles);
                        const role = roles.find((x: Role) => x?.id === roleId);
                        if (role) {
<<<<<<< HEAD
                            if (JSON.parse(guild.members).find((x: Member) => x?.id == res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id == x)?.permissions & 0x0000000800) == 0x0000000800) && Number(roleId) != 0 && Number(roleId) != 1) {
                                const index = roles.findIndex((x: Role) => x?.id == roleId);
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                            if (JSON.parse(guild.members).find((x: Member) => x?.id === res.locals.user).roles.find((x: string) => (roles.find((y: Role) => y?.id === x)?.permissions & 0x0000000800) === 0x0000000800) && Number(roleId) != 0 && Number(roleId) != 1) {
                                const index = roles.findIndex((x: Role) => x?.id === roleId);
>>>>>>> f8e172d (asi ri ma na)
                                delete roles[index];

                                database.query(`UPDATE guilds SET roles = $1 WHERE id = $2`, [JSON.stringify(roles), guildId], (err, dbRes) => {
                                    if (!err) {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                                        res.send({});
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
                                res.status(403).send({ error: "Missing permission." });
=======
                                        res.status(200).send(role);
=======
                                        res.send(role);
>>>>>>> 51556ba (Some changes)
=======
                                        res.send({});
>>>>>>> 332c1ca (owo)
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                            } else {
<<<<<<< HEAD
<<<<<<< HEAD
                                res.status(401).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
                                res.status(403).send({});
>>>>>>> f899d83 (Some changes (like adding email verification))
=======
                                res.status(403).send({ error: "Missing permission." });
>>>>>>> 51556ba (Some changes)
                            }
                        } else {
                            res.status(404).send({})
                        }
                    } else {
<<<<<<< HEAD
<<<<<<< HEAD
                        res.status(404).send({ error: "Guild not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                        res.status(404).send({});
=======
                        res.status(404).send({ error: "Guild not found." });
>>>>>>> 51556ba (Some changes)
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
<<<<<<< HEAD
            res.status(404).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
=======
            res.status(400).send({ error: "Something is missing." });
>>>>>>> 51556ba (Some changes)
        }
    });

};