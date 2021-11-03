"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var intformat = require('biguint-format');
exports.default = (function (websockets, app, database, flake) {
    app.get('/guilds/*/roles', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var guildId = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        })[0];
        if (guildId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                if (!err) {
                    var guild = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild) {
                        var roles_1 = JSON.parse(guild.roles);
                        if (JSON.parse(guild.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_1.find(function (y) { return y.id == x; }).permissions & 0x0000000800) == 0x0000000800; })) {
                            res.send(roles_1);
                        }
                        else {
                            res.status(401).send({});
                        }
                    }
                    else {
                        res.status(404).send({});
                    }
                }
                else {
                    res.status(500).send({});
                }
            });
        }
        else {
            res.status(404).send({});
        }
    });
    app.get('/guilds/*/roles/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var roleId = urlParams[1];
        if (guildId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a;
                if (!err) {
                    var guild = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    var roles_2 = JSON.parse((_a = guild === null || guild === void 0 ? void 0 : guild.roles) !== null && _a !== void 0 ? _a : "[]");
                    if (roles_2.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == roleId; })) {
                        if (JSON.parse(guild.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_2.find(function (y) { return y.id == x; }).permissions & 0x0000000800) == 0x0000000800; })) {
                            res.send(roles_2.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == roleId; }));
                        }
                        else {
                            res.status(401).send({});
                        }
                    }
                    else {
                        res.status(404).send({});
                    }
                }
                else {
                    res.status(500).send({});
                }
            });
        }
        else {
            res.status(404).send({});
        }
    });
    app.post('/guilds/*/roles', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var guildId = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        })[0];
        if (guildId) {
            if (req.body.name && req.body.name.length < 31) {
                database.query("SELECT * FROM guilds", function (err, dbRes) {
                    var _a;
                    if (!err) {
                        var guild_1 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                        if (guild_1) {
                            var roles_3 = JSON.parse(guild_1.roles);
                            if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_3.find(function (y) { return y.id == x; }).permissions & 0x0000000800) == 0x0000000800; })) {
                                var permissions = 0;
                                var permissionsCodes_1 = [];
                                (_a = req.body.permissions) === null || _a === void 0 ? void 0 : _a.forEach(function (permission) {
                                    switch (permission) {
                                        case 'CREATE_INSTANT_INVITE':
                                            if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_3.find(function (y) { return y.id == x; }).permissions & 0x0000000001) == 0x0000000001; })) {
                                                permissionsCodes_1.push(0x0000000001);
                                            }
                                            break;
                                        case 'KICK_MEMBERS':
                                            if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_3.find(function (y) { return y.id == x; }).permissions & 0x0000000002) == 0x0000000002; })) {
                                                permissionsCodes_1.push(0x0000000002);
                                            }
                                            break;
                                        case 'BAN_MEMBERS':
                                            if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_3.find(function (y) { return y.id == x; }).permissions & 0x0000000004) == 0x0000000004; })) {
                                                permissionsCodes_1.push(0x0000000004);
                                            }
                                            break;
                                        case 'MANAGE_GUILD':
                                            if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_3.find(function (y) { return y.id == x; }).permissions & 0x0000000010) == 0x0000000010; })) {
                                                permissionsCodes_1.push(0x0000000010);
                                            }
                                            break;
                                        case 'VIEW_AUDIT_LOG':
                                            if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_3.find(function (y) { return y.id == x; }).permissions & 0x0000000020) == 0x0000000020; })) {
                                                permissionsCodes_1.push(0x0000000020);
                                            }
                                            break;
                                        case 'CHANGE_NICKNAME':
                                            if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_3.find(function (y) { return y.id == x; }).permissions & 0x0000000200) == 0x0000000200; })) {
                                                permissionsCodes_1.push(0x0000000200);
                                            }
                                            break;
                                        case 'MANAGE_NICKNAMES':
                                            if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_3.find(function (y) { return y.id == x; }).permissions & 0x0000000400) == 0x0000000400; })) {
                                                permissionsCodes_1.push(0x0000000400);
                                            }
                                            break;
                                        case 'MANAGE_ROLES':
                                            if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_3.find(function (y) { return y.id == x; }).permissions & 0x0000000800) == 0x0000000800; })) {
                                                permissionsCodes_1.push(0x0000000800);
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                });
                                permissions = permissionsCodes_1.reduce(function (x, y) {
                                    return x | y;
                                }, 0);
                                var role_1 = { id: intformat(flake.next(), 'dec').toString(), name: req.body.name, permissions: permissions, color: require('is-color')(req.body.color) ? req.body.color : null, hoist: req.body.hoist == true };
                                roles_3.push(role_1);
                                database.query("UPDATE guilds SET roles = $1 WHERE id = $2", [JSON.stringify(roles_3), guildId], function (err, dbRes) {
                                    if (!err) {
                                        res.status(200).send(role_1);
                                    }
                                    else {
                                        res.status(500).send({});
                                    }
                                });
                            }
                            else {
                                res.status(401).send({});
                            }
                        }
                        else {
                            res.status(404).send({});
                        }
                    }
                    else {
                        res.status(500).send({});
                    }
                });
            }
            else {
                res.status(400).send({});
            }
        }
        else {
            res.status(404).send({});
        }
    });
    app.patch('/guilds/*/roles/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var roleId = urlParams[1];
        if (guildId && roleId) {
            if (req.body.name) {
                database.query("SELECT * FROM guilds", function (err, dbRes) {
                    var _a;
                    if (!err) {
                        var guild_2 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                        if (guild_2) {
                            var roles_4 = JSON.parse(guild_2.roles);
                            var role_2 = roles_4.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == roleId; });
                            if (role_2) {
                                if (JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_4.find(function (y) { return y.id == x; }).permissions & 0x0000000800) == 0x0000000800; })) {
                                    var permissions = 0;
                                    var permissionsCodes_2 = [];
                                    if (req.body.permissions) {
                                        (_a = req.body.permissions) === null || _a === void 0 ? void 0 : _a.forEach(function (permission) {
                                            switch (permission) {
                                                case 'CREATE_INSTANT_INVITE':
                                                    if (JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_4.find(function (y) { return y.id == x; }).permissions & 0x0000000001) == 0x0000000001; })) {
                                                        permissionsCodes_2.push(0x0000000001);
                                                    }
                                                    break;
                                                case 'KICK_MEMBERS':
                                                    if (JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_4.find(function (y) { return y.id == x; }).permissions & 0x0000000002) == 0x0000000002; })) {
                                                        permissionsCodes_2.push(0x0000000002);
                                                    }
                                                    break;
                                                case 'BAN_MEMBERS':
                                                    if (JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_4.find(function (y) { return y.id == x; }).permissions & 0x0000000004) == 0x0000000004; })) {
                                                        permissionsCodes_2.push(0x0000000004);
                                                    }
                                                    break;
                                                case 'MANAGE_GUILD':
                                                    if (JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_4.find(function (y) { return y.id == x; }).permissions & 0x0000000010) == 0x0000000010; })) {
                                                        permissionsCodes_2.push(0x0000000010);
                                                    }
                                                    break;
                                                case 'VIEW_AUDIT_LOG':
                                                    if (JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_4.find(function (y) { return y.id == x; }).permissions & 0x0000000020) == 0x0000000020; })) {
                                                        permissionsCodes_2.push(0x0000000020);
                                                    }
                                                    break;
                                                case 'CHANGE_NICKNAME':
                                                    if (JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_4.find(function (y) { return y.id == x; }).permissions & 0x0000000200) == 0x0000000200; })) {
                                                        permissionsCodes_2.push(0x0000000200);
                                                    }
                                                    break;
                                                case 'MANAGE_NICKNAMES':
                                                    if (JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_4.find(function (y) { return y.id == x; }).permissions & 0x0000000400) == 0x0000000400; })) {
                                                        permissionsCodes_2.push(0x0000000400);
                                                    }
                                                    break;
                                                case 'MANAGE_ROLES':
                                                    if (JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_4.find(function (y) { return y.id == x; }).permissions & 0x0000000800) == 0x0000000800; })) {
                                                        permissionsCodes_2.push(0x0000000800);
                                                    }
                                                    break;
                                                default:
                                                    break;
                                            }
                                        });
                                        permissions = permissionsCodes_2.reduce(function (x, y) {
                                            return x | y;
                                        }, 0);
                                    }
                                    else {
                                        permissions = role_2.permissions;
                                    }
                                    role_2.name = req.body.name && req.body.length < 31 ? req.body.name : role_2.name;
                                    role_2.permissions = permissions;
                                    role_2.color = require('is-color')(req.body.color) ? req.body.color : req.body.color != false ? role_2.color : null;
                                    role_2.hoist = typeof req.body.hoist == 'boolean' ? req.body.hoist : role_2.hoist;
                                    roles_4[roles_4.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == roleId; })] = role_2;
                                    database.query("UPDATE guilds SET roles = $1 WHERE id = $2", [JSON.stringify(roles_4), guildId], function (err, dbRes) {
                                        if (!err) {
                                            res.status(200).send(role_2);
                                        }
                                        else {
                                            res.status(500).send({});
                                        }
                                    });
                                }
                                else {
                                    res.status(401).send({});
                                }
                            }
                            else {
                                res.status(404).send({});
                            }
                        }
                        else {
                            res.status(404).send({});
                        }
                    }
                    else {
                        res.status(500).send({});
                    }
                });
            }
            else {
                res.status(400).send({});
            }
        }
        else {
            res.status(404).send({});
        }
    });
    app.delete('/guilds/*/roles/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var roleId = urlParams[1];
        if (guildId && roleId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                if (!err) {
                    var guild = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild) {
                        var roles_5 = JSON.parse(guild.roles);
                        var role_3 = roles_5.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == roleId; });
                        if (role_3) {
                            if (JSON.parse(guild.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (roles_5.find(function (y) { return y.id == x; }).permissions & 0x0000000800) == 0x0000000800; }) && Number(roleId) != 0 && Number(roleId) != 1) {
                                var index = roles_5.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == roleId; });
                                delete roles_5[index];
                                database.query("UPDATE guilds SET roles = $1 WHERE id = $2", [JSON.stringify(roles_5), guildId], function (err, dbRes) {
                                    if (!err) {
                                        res.status(200).send(role_3);
                                    }
                                    else {
                                        res.status(500).send({});
                                    }
                                });
                            }
                            else {
                                res.status(401).send({});
                            }
                        }
                        else {
                            res.status(404).send({});
                        }
                    }
                    else {
                        res.status(404).send({});
                    }
                }
                else {
                    res.status(500).send({});
                }
            });
        }
        else {
            res.status(404).send({});
        }
    });
});
