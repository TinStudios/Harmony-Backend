"use strict";
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
exports.default = (function (websockets, app, database) {
    app.get('/guilds/*/members', function (req, res) {
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
                    if (JSON.parse(guild_1.members).find(function (x) { return x.id == res.locals.user; })) {
                        database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (!err) {
                                    res.send(JSON.parse(guild_1.members).map(function (x) {
                                        if (x) {
                                            x.username = dbRes.rows.find(function (y) { return (x === null || x === void 0 ? void 0 : x.id) == y.id; }).username;
                                            x.discriminator = dbRes.rows.find(function (y) { return (x === null || x === void 0 ? void 0 : x.id) == y.id; }).discriminator;
                                        }
                                        return x;
                                    }).sort(function (a, b) { var _a, _b, _c, _d; return ((_a = a.nickname) !== null && _a !== void 0 ? _a : a.username) > ((_b = b.nickname) !== null && _b !== void 0 ? _b : b.username) ? 1 : ((_c = a.nickname) !== null && _c !== void 0 ? _c : a.username) < ((_d = b.nickname) !== null && _d !== void 0 ? _d : b.username) ? -1 : 0; }));
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
                    res.status(500).send({});
                }
            });
        }
        else {
            res.status(404).send({});
        }
    });
    app.get('/guilds/*/members/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var userId = urlParams[1];
        if (guildId && userId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                if (!err) {
                    var guild_2 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (JSON.parse(guild_2.members).includes(res.locals.user)) {
                        database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                if (!err) {
                                    res.send(JSON.parse(guild_2.members).filter(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == userId; }).map(function (x) {
                                        x.username = dbRes.rows.find(function (x) { return x.id == userId; }).username;
                                        x.discriminator = dbRes.rows.find(function (x) { return x.id == userId; }).discriminator;
                                        return x;
                                    })[0]);
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
                    res.status(500).send({});
                }
            });
        }
        else {
            res.status(404).send({});
        }
    });
    app.patch('/guilds/*/members/@me', function (req, res) {
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
                    var guild_3 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild_3) {
                        if ((_a = JSON.parse(guild_3.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.find(function (x) { return (JSON.parse(guild_3.roles).find(function (y) { return y.id == x; }).permissions & 0x0000000200) == 0x0000000200; })) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname == null) {
                                var members_1 = JSON.parse(guild_3.members);
                                var user_1 = members_1.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; });
                                user_1.nickname = req.body.nickname ? req.body.nickname : null;
                                members_1[members_1.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })] = user_1;
                                database.query("UPDATE guilds SET members = $1 WHERE id = $2", [JSON.stringify(members_1), guildId], function (err, dbRes) {
                                    if (!err) {
                                        members_1.forEach(function (member) {
                                            var _a;
                                            (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                websocket.send(JSON.stringify({ event: 'memberEdited', member: user_1 }));
                                            });
                                        });
                                        res.status(200).send(user_1);
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
    app.patch('/guilds/*/members/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var userId = urlParams[1];
        if (guildId && userId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                if (!err) {
                    var guild_4 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild_4) {
                        if (JSON.parse(guild_4.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; }).roles.find(function (x) { return (JSON.parse(guild_4.roles).find(function (y) { return y.id == x; }).permissions & 0x0000000400) == 0x0000000400; })) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname == null) {
                                var members_2 = JSON.parse(guild_4.members);
                                var user_2 = members_2.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == userId; });
                                user_2.nickname = req.body.nickname ? req.body.nickname : null;
                                members_2[members_2.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == userId; })] = user_2;
                                database.query("UPDATE guilds SET members = $1 WHERE id = $2", [JSON.stringify(members_2), guildId], function (err, dbRes) {
                                    if (!err) {
                                        members_2.forEach(function (member) {
                                            var _a;
                                            (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                websocket.send(JSON.stringify({ event: 'memberEdited', member: user_2 }));
                                            });
                                        });
                                        res.status(200).send(user_2);
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
    app.delete('/guilds/*/members/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var userId = urlParams[1];
        if (guildId && userId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a;
                if (!err) {
                    var guild_5 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild_5) {
                        if ((_a = JSON.parse(guild_5.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.find(function (x) { return (JSON.parse(guild_5.roles).find(function (y) { return (y === null || y === void 0 ? void 0 : y.id) == x; }).permissions & 0x0000000002) == 0x0000000002; })) {
                            if ((req.body.nickname && req.body.nickname.length < 31) || req.body.nickname == null) {
                                var members_3 = JSON.parse(guild_5.members);
                                var user_3 = members_3.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == userId; });
                                delete members_3[members_3.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == userId; })];
                                var bans = JSON.parse(guild_5.bans);
                                if (req.body.ban) {
                                    bans.push(userId);
                                }
                                database.query("UPDATE guilds SET members = $1, bans = $2 WHERE id = $3", [JSON.stringify(members_3), JSON.stringify(bans), guildId], function (err, dbRes) {
                                    if (!err) {
                                        members_3.forEach(function (member) {
                                            var _a;
                                            (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                websocket.send(JSON.stringify({ event: 'memberKicked', member: user_3 }));
                                            });
                                        });
                                        res.status(200).send(user_3);
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
});
