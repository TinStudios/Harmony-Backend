"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var intformat = require('biguint-format');
exports.default = (function (websockets, app, database, flake) {
    app.get('/guilds/*/channels/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var channelId = urlParams[1];
        if (guildId && channelId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                if (!err) {
                    var guild = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild) {
                        var channels = JSON.parse(guild.channels);
                        var channel = channels.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; });
                        if (channel) {
                            delete channel.messages;
                            delete channel.pins;
                            res.send(channel);
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
    app.post('/guilds/*/channels', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var guildId = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        })[0];
        if (guildId && req.body.name && req.body.name.length < 31) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                if (!err) {
                    var guild_1 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (JSON.parse(guild_1.roles).find(function (y) { return y.id == x; }).permissions & 0x0000000010) == 0x0000000010; })) {
                        if (guild_1) {
                            var channels = JSON.parse(guild_1.channels);
                            var channel_1 = {
                                id: intformat(flake.next(), 'dec').toString(),
                                name: req.body.name,
                                topic: null,
                                creation: Date.now(),
                                roles: [{ id: 0, permissions: 456 }, { id: 1, permissions: 192 }],
                                messages: [],
                                pins: []
                            };
                            channels.push(channel_1);
                            database.query("UPDATE guilds SET channels = $1 WHERE id = $2", [JSON.stringify(channels), guildId], function (err, dbRes) {
                                var _a;
                                if (!err) {
                                    (_a = websockets.get(res.locals.user)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                        websocket.send(JSON.stringify({ event: 'channelCreated', channel: channel_1 }));
                                    });
                                    res.status(200).send(channel_1);
                                }
                                else {
                                    res.status(500).send({});
                                }
                            });
                        }
                        else {
                            res.status(404).send({});
                        }
                    }
                    else {
                        res.status(401).send({});
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
    });
    app.patch('/guilds/*/channels/*/roles/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var channelId = urlParams[1];
        var roleId = urlParams[2];
        if (guildId && channelId && roleId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a, _b, _c;
                if (!err) {
                    var guild_2 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    var channels = JSON.parse(guild_2.channels);
                    var channel_2 = channels.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; });
                    if (channel_2) {
                        if ((_a = JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.map(function (x) { return channel_2.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000008) == 0x0000000008; }).includes(true)) {
                            if (JSON.parse(guild_2.roles).find(function (x) { return x.id == roleId; }) && req.body.permissions) {
                                var roles = JSON.parse(guild_2.roles);
                                var role = (_b = channel_2.roles.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == roleId; })) !== null && _b !== void 0 ? _b : {};
                                var permissions = 0;
                                var permissionsCodes_1 = [];
                                (_c = req.body.permissions) === null || _c === void 0 ? void 0 : _c.forEach(function (permission) {
                                    var _a, _b, _c;
                                    switch (permission) {
                                        case 'VIEW_CHANNEL':
                                            if ((_a = JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.map(function (x) { return channel_2.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000040) == 0x0000000040; }).includes(true)) {
                                                permissionsCodes_1.push(0x0000000040);
                                            }
                                            break;
                                        case 'SEND_MESSAGES':
                                            if ((_b = JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _b === void 0 ? void 0 : _b.roles.map(function (x) { return channel_2.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000080) == 0x0000000080; }).includes(true)) {
                                                permissionsCodes_1.push(0x0000000080);
                                            }
                                            break;
                                        case 'MANAGE_MESSAGES':
                                            if ((_c = JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _c === void 0 ? void 0 : _c.roles.map(function (x) { return channel_2.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000100) == 0x0000000100; }).includes(true)) {
                                                permissionsCodes_1.push(0x0000000100);
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                });
                                permissions = permissionsCodes_1.reduce(function (x, y) {
                                    return x | y;
                                }, 0);
                                console.log(permissionsCodes_1);
                                role.id = roleId;
                                role.permissions = permissions;
                                channel_2.roles[channel_2.roles.findIndex(function (x) { return x.id == roleId; })] = role;
                                channels[channels.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; })] = channel_2;
                                database.query("UPDATE guilds SET channels = $1 WHERE id = $2", [JSON.stringify(channels), guildId], function (err, dbRes) {
                                    if (!err) {
                                        JSON.parse(guild_2.members).forEach(function (member) {
                                            var _a;
                                            (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                websocket.send(JSON.stringify({ event: 'channelEdited', channel: channel_2 }));
                                            });
                                        });
                                        res.status(200).send(channel_2);
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
    app.patch('/guilds/*/channels/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var channelId = urlParams[1];
        if (guildId && channelId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a;
                if (!err) {
                    var guild_3 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    var channels = JSON.parse(guild_3.channels);
                    var channel_3 = channels.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; });
                    if (channel_3) {
                        if ((_a = JSON.parse(guild_3.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.map(function (x) { return channel_3.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000008) == 0x0000000008; }).includes(true)) {
                            var changesWereMade_1 = false;
                            if (req.body.name && req.body.name.length < 31) {
                                channel_3.name = req.body.name;
                                changesWereMade_1 = true;
                            }
                            if (req.body.topic && req.body.topic.length < 1025) {
                                channel_3.topic = req.body.topic;
                                changesWereMade_1 = true;
                            }
                            channels[channels.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; })] = channel_3;
                            database.query("UPDATE guilds SET channels = $1 WHERE id = $2", [JSON.stringify(channels), guildId], function (err, dbRes) {
                                if (!err) {
                                    if (changesWereMade_1) {
                                        JSON.parse(guild_3.members).forEach(function (member) {
                                            var _a;
                                            (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                websocket.send(JSON.stringify({ event: 'channelEdited', channel: channel_3 }));
                                            });
                                        });
                                        res.status(200).send(channel_3);
                                    }
                                    else {
                                        res.status(400).send({});
                                    }
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
            res.status(404).send({});
        }
    });
    app.delete('/guilds/*/channels/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var channelId = urlParams[1];
        if (guildId && channelId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a;
                if (!err) {
                    var guild = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild) {
                        var channels = JSON.parse(guild.channels);
                        var channel_4 = channels.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; });
                        if ((_a = JSON.parse(guild.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.map(function (x) { return channel_4.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000008) == 0x0000000008; }).includes(true)) {
                            channels.splice(channels.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; }), 1);
                            database.query("UPDATE guilds SET channels = $1 WHERE id = $2", [JSON.stringify(channels), guildId], function (err, dbRes) {
                                var _a;
                                if (!err) {
                                    (_a = websockets.get(res.locals.user)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                        websocket.send(JSON.stringify({ event: 'channelDeleted', channel: channel_4 }));
                                    });
                                    res.status(200).send(channel_4);
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
            res.status(404).send({});
        }
    });
});
