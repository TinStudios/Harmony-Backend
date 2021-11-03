"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var intformat = require('biguint-format');
exports.default = (function (websockets, app, database, flake) {
    app.get('/guilds', function (req, res) {
        database.query("SELECT * FROM guilds", function (err, dbRes) {
            if (!err) {
                var guilds = dbRes.rows.filter(function (x) { var _a; return (_a = x === null || x === void 0 ? void 0 : x.members) === null || _a === void 0 ? void 0 : _a.includes(res.locals.user); });
                res.send(guilds.map(function (guild) { return Object.keys(guild).reduce(function (obj, key, index) {
                    var _a;
                    return (__assign(__assign({}, obj), (_a = {}, _a[key] = Object.keys(guild).map(function (x) { return x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(guild[x]) : guild[x]; })[index], _a)));
                }, {}); }));
            }
            else {
                res.status(500).send({});
            }
        });
    });
    app.get('/guilds/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var guildId = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        })[0];
        if (guildId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                if (!err) {
                    var guild_1 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild_1) {
                        if (guild_1.members.includes(res.locals.user)) {
                            res.send(Object.keys(guild_1).reduce(function (obj, key, index) {
                                var _a;
                                return (__assign(__assign({}, obj), (_a = {}, _a[key] = Object.keys(guild_1).map(function (x) { return x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(guild_1[x]) : guild_1[x]; })[index], _a)));
                            }, {}));
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
    app.post('/guilds', function (req, res) {
        var _a;
        if (req.body.name && req.body.name.length < 31) {
            var guild_2 = {
                id: intformat(flake.next(), 'dec').toString(),
                name: req.body.name,
                description: (_a = req.body.description) !== null && _a !== void 0 ? _a : null,
                public: false,
                channels: [{ id: intformat(flake.next(), 'dec').toString(), name: 'general', topic: null, creation: Date.now(), roles: [{ id: 0, permissions: 456 }, { id: 1, permissions: 192 }], messages: [], pins: [] }],
                roles: [{ id: '0', name: 'Owner', permissions: 3647, color: null, hoist: false }, { id: 1, name: 'Members', permissions: 513, color: null, hoist: false }],
                members: [{ id: res.locals.user, nickname: null, roles: ['0', '1'] }],
                creation: Date.now(),
                bans: []
            };
            database.query("INSERT INTO guilds (id, name, description, public, channels, roles, members, bans) VALUES($1, $2, $3, $4, $5, $6, $7, $8)", [guild_2.id, guild_2.name, guild_2.description, guild_2.public, JSON.stringify(guild_2.channels), JSON.stringify(guild_2.roles), JSON.stringify(guild_2.members), JSON.stringify(guild_2.bans)], function (err, dbRes) {
                var _a;
                if (!err) {
                    (_a = websockets.get(res.locals.user)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                        websocket.send(JSON.stringify({ event: 'guildCreated', guild: guild_2 }));
                    });
                    res.status(200).send(guild_2);
                }
                else {
                    console.log(err);
                    res.status(500).send({});
                }
            });
        }
        else {
            res.status(400).send({});
        }
    });
    app.patch('/guilds/*/icons', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var guildId = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        })[0];
        if (guildId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a, _b;
                if (!err) {
                    var preGuild_1 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (preGuild_1) {
                        var guild_3 = Object.keys(preGuild_1).reduce(function (obj, key, index) {
                            var _a;
                            return (__assign(__assign({}, obj), (_a = {}, _a[key] = Object.keys(preGuild_1).map(function (x) { return x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(preGuild_1[x]) : preGuild_1[x]; })[index], _a)));
                        }, {});
                        if ((_a = guild_3.members.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.find(function (x) { var _a, _b; return (((_b = (_a = guild_3.roles.find(function (y) { return (y === null || y === void 0 ? void 0 : y.id) == x; })) === null || _a === void 0 ? void 0 : _a.permissions) !== null && _b !== void 0 ? _b : 0) & 0x0000000010) == 0x0000000010; })) {
                            if ((_b = req.body.image) === null || _b === void 0 ? void 0 : _b.startsWith('data:image/png')) {
                                require('fs').writeFileSync(__dirname + '/../../icons/' + guildId + '.png', req.body.image.replace(/^data:image\/png;base64,/, ""), 'base64');
                                guild_3.members.forEach(function (member) {
                                    var _a;
                                    (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                        websocket.send(JSON.stringify({ event: 'guildIconEdited', id: guildId }));
                                    });
                                });
                                res.status(200).send({});
                            }
                            else if (req.body.image == null) {
                                require('fs').unlinkSync(__dirname + '/../../icons/' + guildId + '.png');
                                res.status(200).send({});
                            }
                            else {
                                res.status(401).send({});
                            }
                        }
                        else {
                            res.status(400).send({});
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
    app.patch('/guilds/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var guildId = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        })[0];
        if (guildId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a, _b;
                if (!err) {
                    var preGuild_2 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (preGuild_2) {
                        var guild_4 = Object.keys(preGuild_2).reduce(function (obj, key, index) {
                            var _a;
                            return (__assign(__assign({}, obj), (_a = {}, _a[key] = Object.keys(preGuild_2).map(function (x) { return x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(preGuild_2[x]) : preGuild_2[x]; })[index], _a)));
                        }, {});
                        if ((_a = guild_4.members.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.find(function (x) { var _a, _b; return (((_b = (_a = guild_4.roles.find(function (y) { return (y === null || y === void 0 ? void 0 : y.id) == x; })) === null || _a === void 0 ? void 0 : _a.permissions) !== null && _b !== void 0 ? _b : 0) & 0x0000000010) == 0x0000000010; })) {
                            var changesWereMade_1 = false;
                            if (req.body.name && req.body.name.length < 31) {
                                guild_4.name = req.body.name;
                                changesWereMade_1 = true;
                            }
                            if (req.body.description && req.body.description.length < 1025) {
                                guild_4.description = req.body.description;
                                changesWereMade_1 = true;
                            }
                            if (typeof req.body.public == 'boolean') {
                                guild_4.public = req.body.public;
                                changesWereMade_1 = true;
                            }
                            if (req.body.owner && ((_b = guild_4.members.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _b === void 0 ? void 0 : _b.roles.includes('0')) && guild_4.members.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == req.body.owner; })) {
                                guild_4.members[guild_4.members.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })].roles.splice(guild_4.members[guild_4.members.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })].roles.indexOf('0'), 1);
                                guild_4.members[guild_4.members.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == req.body.owner; })].roles.push('0');
                                changesWereMade_1 = true;
                            }
                            database.query("UPDATE guilds SET name = $1, members = $2 WHERE id = $3", [guild_4.name, JSON.stringify(guild_4.members), guildId], function (err, dbRes) {
                                if (!err) {
                                    if (changesWereMade_1) {
                                        guild_4.members.forEach(function (member) {
                                            var _a;
                                            (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                websocket.send(JSON.stringify({ event: 'guildEdited', guild: guild_4 }));
                                            });
                                        });
                                        res.status(200).send(guild_4);
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
    app.delete('/guilds/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var guildId = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        })[0];
        if (guildId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a;
                if (!err) {
                    var preGuild_3 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    var guild_5 = Object.keys(preGuild_3).reduce(function (obj, key, index) {
                        var _a;
                        return (__assign(__assign({}, obj), (_a = {}, _a[key] = Object.keys(preGuild_3).map(function (x) { return x == 'channels' || x == 'members' || x == 'roles' ? JSON.parse(preGuild_3[x]) : preGuild_3[x]; })[index], _a)));
                    }, {});
                    if (guild_5) {
                        if ((_a = guild_5.members.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.includes('0')) {
                            database.query("DELETE FROM guilds WHERE id = $1", [guildId], function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (!err) {
                                        guild_5.members.forEach(function (member) {
                                            var _a;
                                            (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                websocket.send(JSON.stringify({ event: 'guildDelete', guild: guild_5 }));
                                            });
                                        });
                                        res.status(200).send(guild_5);
                                    }
                                    else {
                                        res.status(500).send({});
                                    }
                                    return [2 /*return*/];
                                });
                            }); });
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
