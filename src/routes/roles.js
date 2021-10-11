module.exports = (websockets, app, database) => {

    app.get('/guilds/*/roles', (req, res) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x.id == guildId);
                    if (guild) {
                        const roles = JSON.parse(guild.roles);
                        if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000800) == 0x0000000800)) {
                            res.send(roles);
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

    app.get('/guilds/*/roles/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const roleId = urlParams[1];
        if (guildId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x.id == guildId);
                    const roles = JSON.parse(guild?.roles ?? "[]");
                    if (roles.find(x => x.id == roleId)) {
                        if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000800) == 0x0000000800)) {
                            res.send(roles.find(x => x.id == roleId));
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

    app.post('/guilds/*/roles', (req, res) => {
        const guildId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (guildId) {
            if (req.body.name && req.body.name.length < 31) {
                database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                    if (!err) {
                        const guild = dbRes.rows.find(x => x.id == guildId);
                        if (guild) {
                            const roles = JSON.parse(guild.roles);
                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000800) == 0x0000000800)) {
                                let permissions = 0;
                                let permissionsCodes = [];
                                req.body.permissions?.forEach(permission => {
                                    switch (permission) {
                                        case 'CREATE_INSTANT_INVITE':
                                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000001) == 0x0000000001)) {
                                                permissionsCodes.push(0x0000000001);
                                            }
                                            break;

                                        case 'KICK_MEMBERS':
                                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000002) == 0x0000000002)) {
                                                permissionsCodes.push(0x0000000002);
                                            }
                                            break;

                                        case 'BAN_MEMBERS':
                                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000004) == 0x0000000004)) {
                                                permissionsCodes.push(0x0000000004);
                                            }
                                            break;

                                        case 'MANAGE_GUILD':
                                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000010) == 0x0000000010)) {
                                                permissionsCodes.push(0x0000000010);
                                            }
                                            break;

                                        case 'VIEW_AUDIT_LOG':
                                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000020) == 0x0000000020)) {
                                                permissionsCodes.push(0x0000000020);
                                            }
                                            break;

                                        case 'CHANGE_NICKNAME':
                                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000200) == 0x0000000200)) {
                                                permissionsCodes.push(0x0000000200);
                                            }
                                            break;

                                        case 'MANAGE_NICKNAMES':
                                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000400) == 0x0000000400)) {
                                                permissionsCodes.push(0x0000000400);
                                            }
                                            break;

                                        case 'MANAGE_ROLES':
                                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000800) == 0x0000000800)) {
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
                                const role = { id: flake.gen().toString(), name: req.body.name, permissions: permissions, color: require('is-color')(req.body.color) ? req.body.color : null, hoist: req.body.hoist == true };
                                roles.push(role);
                                database.query(`UPDATE guilds SET roles = $1 WHERE id = $2`, [JSON.stringify(roles), guildId], (err, dbRes) => {
                                    if (!err) {
                                        res.status(200).send(role);
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
                res.status(400).send({});
            }
        } else {
            res.status(404).send({});
        }
    });

    app.patch('/guilds/*/roles/*', (req, res) => {
        const urlParams = Object.values(req.params)
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
                        const guild = dbRes.rows.find(x => x.id == guildId);
                        if (guild) {
                            const roles = JSON.parse(guild.roles);
                            const role = roles.find(x => x.id == roleId);
                            if (role) {
                                if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000800) == 0x0000000800)) {
                                    let permissions = 0;
                                    let permissionsCodes = [];
                                    if (req.body.permissions) {
                                        req.body.permissions?.forEach(permission => {
                                            switch (permission) {
                                                case 'CREATE_INSTANT_INVITE':
                                                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000001) == 0x0000000001)) {
                                                        permissionsCodes.push(0x0000000001);
                                                    }
                                                    break;

                                                case 'KICK_MEMBERS':
                                                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000002) == 0x0000000002)) {
                                                        permissionsCodes.push(0x0000000002);
                                                    }
                                                    break;

                                                case 'BAN_MEMBERS':
                                                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000004) == 0x0000000004)) {
                                                        permissionsCodes.push(0x0000000004);
                                                    }
                                                    break;

                                                case 'MANAGE_GUILD':
                                                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000010) == 0x0000000010)) {
                                                        permissionsCodes.push(0x0000000010);
                                                    }
                                                    break;

                                                case 'VIEW_AUDIT_LOG':
                                                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000020) == 0x0000000020)) {
                                                        permissionsCodes.push(0x0000000020);
                                                    }
                                                    break;

                                                case 'CHANGE_NICKNAME':
                                                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000200) == 0x0000000200)) {
                                                        permissionsCodes.push(0x0000000200);
                                                    }
                                                    break;

                                                case 'MANAGE_NICKNAMES':
                                                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000400) == 0x0000000400)) {
                                                        permissionsCodes.push(0x0000000400);
                                                    }
                                                    break;

                                                case 'MANAGE_ROLES':
                                                    if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000800) == 0x0000000800)) {
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
                                    role.hoist = typeof req.body.hoist == 'boolean' ? req.body.hoist : role.hoist;
                                    roles[roles.findIndex(x => x.id == roleId)] = role;
                                    database.query(`UPDATE guilds SET roles = $1 WHERE id = $2`, [JSON.stringify(roles), guildId], (err, dbRes) => {
                                        if (!err) {
                                            res.status(200).send(role);
                                        } else {
                                            res.status(500).send({});
                                        }
                                    });
                                } else {
                                    res.status(401).send({});
                                }
                            } else {
                                res.status(404).send({})
                            }
                        } else {
                            res.status(404).send({});
                        }
                    } else {
                        res.status(500).send({});
                    }
                });
            } else {
                res.status(400).send({});
            }
        } else {
            res.status(404).send({});
        }
    });

    app.delete('/guilds/*/roles/*', (req, res) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const roleId = urlParams[1];
        if (guildId && roleId) {
            database.query(`SELECT * FROM guilds`, (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x.id == guildId);
                    if (guild) {
                        const roles = JSON.parse(guild.roles);
                        const role = roles.find(x => x?.id == roleId);
                        if (role) {
                            if (JSON.parse(guild.members).find(x => x.id == res.locals.user).roles.find(x => (roles.find(y => y.id == x).permissions & 0x0000000800) == 0x0000000800) && roleId != 0 && roleId != 1) {
                                const index = roles.findIndex(x => x?.id == roleId);
                                delete roles[index];

                                database.query(`UPDATE guilds SET roles = $1 WHERE id = $2`, [JSON.stringify(roles), guildId], (err, dbRes) => {
                                    if (!err) {
                                        res.status(200).send(role);
                                    } else {
                                        res.status(500).send({});
                                    }
                                });
                            } else {
                                res.status(401).send({});
                            }
                        } else {
                            res.status(404).send({})
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