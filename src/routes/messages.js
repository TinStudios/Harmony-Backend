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
var intformat = require('biguint-format');
exports.default = (function (websockets, app, database, flake) {
    app.get('/guilds/*/channels/*/messages', function (req, res) {
        var _a;
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var channelId = urlParams[1];
        var beforeId = (_a = req.query) === null || _a === void 0 ? void 0 : _a.before;
        if (guildId && channelId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a;
                if (!err) {
                    var guild_1 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild_1) {
                        var channel_1 = JSON.parse(guild_1.channels).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; });
                        if ((_a = JSON.parse(guild_1.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.map(function (x) { return channel_1.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000040) == 0x0000000040; }).includes(true)) {
                            var messages_1 = channel_1.messages;
                            var before = messages_1.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == beforeId; });
                            if (beforeId) {
                                messages_1 = messages_1.slice(before - (before > 99 ? 100 : before), before + 1);
                            }
                            else {
                                messages_1 = messages_1.slice(-101);
                            }
                            database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (!err) {
                                        messages_1 = messages_1.map(function (message) {
                                            message.author = {
                                                id: message === null || message === void 0 ? void 0 : message.author,
                                                username: dbRes.rows.find(function (x) { return x.id == (message === null || message === void 0 ? void 0 : message.author); }).username,
                                                nickname: JSON.parse(guild_1.members).find(function (x) { return x.id == message.author; }).nickname,
                                                discriminator: dbRes.rows.find(function (x) { return x.id == (message === null || message === void 0 ? void 0 : message.author); }).discriminator
                                            };
                                            return message;
                                        });
                                        res.send(messages_1);
                                    }
                                    else {
                                        res.status(500).send({});
                                    }
                                    return [2 /*return*/];
                                });
                            }); });
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
    });
    app.get('/guilds/*/channels/*/messages/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var channelId = urlParams[1];
        var messageId = urlParams[2];
        if (guildId && channelId && messageId) {
            database.query("SELECT * FROM guilds", function (err, dbRes) {
                var _a;
                if (!err) {
                    var guild_2 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                    if (guild_2) {
                        var channel_2 = JSON.parse(guild_2.channels).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; });
                        if ((_a = JSON.parse(guild_2.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.map(function (x) { return channel_2.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000040) == 0x0000000040; }).includes(true)) {
                            var messages = channel_2.messages;
                            var message_1 = messages.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == messageId; });
                            if (message_1) {
                                database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        if (!err) {
                                            message_1.author = {
                                                id: message_1 === null || message_1 === void 0 ? void 0 : message_1.author,
                                                username: dbRes.rows.find(function (x) { return x.id == (message_1 === null || message_1 === void 0 ? void 0 : message_1.author); }).username,
                                                nickname: JSON.parse(guild_2.members).find(function (x) { return x.id == message_1.author; }).nickname,
                                                discriminator: dbRes.rows.find(function (x) { return x.id == (message_1 === null || message_1 === void 0 ? void 0 : message_1.author); }).discriminator
                                            };
                                            res.send(message_1);
                                        }
                                        else {
                                            res.status(500).send({});
                                        }
                                        return [2 /*return*/];
                                    });
                                }); });
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
    });
    app.post('/guilds/*/channels/*/messages', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var channelId = urlParams[1];
        if (guildId && channelId && req.body.message && req.body.message.length < 4001) {
            database.query("SELECT * FROM guilds", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                var guild_3, channels, channel_3, messages, message_2;
                var _a;
                return __generator(this, function (_b) {
                    if (!err) {
                        guild_3 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                        if (guild_3) {
                            channels = JSON.parse(guild_3.channels);
                            channel_3 = channels.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; });
                            if ((_a = JSON.parse(guild_3.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.map(function (x) { return channel_3.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000080) == 0x0000000080; }).includes(true)) {
                                messages = channel_3.messages;
                                message_2 = {
                                    id: intformat(flake.next(), 'dec').toString(),
                                    author: res.locals.user,
                                    content: req.body.message,
                                    creation: Date.now()
                                };
                                messages.push(message_2);
                                channel_3.messages = messages;
                                channels[channels.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; })] = channel_3;
                                database.query("UPDATE guilds SET channels = $1 WHERE id = $2", [JSON.stringify(channels), guildId], function (err, dbRes) {
                                    if (!err) {
                                        database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                if (!err) {
                                                    message_2.author = {
                                                        id: message_2 === null || message_2 === void 0 ? void 0 : message_2.author,
                                                        username: dbRes.rows.find(function (x) { return x.id == (message_2 === null || message_2 === void 0 ? void 0 : message_2.author); }).username,
                                                        nickname: JSON.parse(guild_3.members).find(function (x) { return x.id == message_2.author; }).nickname,
                                                        discriminator: dbRes.rows.find(function (x) { return x.id == (message_2 === null || message_2 === void 0 ? void 0 : message_2.author); }).discriminator
                                                    };
                                                    JSON.parse(guild_3.members).forEach(function (member) {
                                                        var _a;
                                                        if (member.roles.map(function (x) { return channel_3.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000080) == 0x0000000080; }).includes(true)) {
                                                            (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                                websocket.send(JSON.stringify({ event: 'messageSent', guild: guildId, channel: channelId, message: message_2 }));
                                                            });
                                                        }
                                                    });
                                                    res.status(200).send(message_2);
                                                }
                                                else {
                                                    res.status(500).send({});
                                                }
                                                return [2 /*return*/];
                                            });
                                        }); });
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
                            res.status(404).send({});
                        }
                    }
                    else {
                        res.status(500).send({});
                    }
                    return [2 /*return*/];
                });
            }); });
        }
        else {
            res.status(400).send({});
        }
    });
    app.patch('/guilds/*/channels/*/messages/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var channelId = urlParams[1];
        var messageId = urlParams[2];
        if (guildId && channelId && messageId && req.body.message && req.body.message.length < 4001) {
            database.query("SELECT * FROM guilds", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                var guild_4, channels, channel_4, messages, message_3;
                var _a;
                return __generator(this, function (_b) {
                    if (!err) {
                        guild_4 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                        if (guild_4) {
                            channels = JSON.parse(guild_4.channels);
                            channel_4 = channels.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; });
                            messages = channel_4.messages;
                            message_3 = messages.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == messageId; });
                            if (message_3.author == res.locals.user && ((_a = JSON.parse(guild_4.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.map(function (x) { return channel_4.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000080) == 0x0000000080; }).includes(true))) {
                                message_3.content = req.body.message;
                                messages[messages.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == messageId; })] = message_3;
                                channel_4.messages = messages;
                                channels[channels.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; })] = channel_4;
                                database.query("UPDATE guilds SET channels = $1 WHERE id = $2", [JSON.stringify(channels), guildId], function (err, dbRes) {
                                    if (!err) {
                                        JSON.parse(guild_4.members).forEach(function (member) {
                                            var _a;
                                            if (member.roles.map(function (x) { return channel_4.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000080) == 0x0000000080; }).includes(true)) {
                                                (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                    websocket.send(JSON.stringify({ event: 'messageEdited', guild: guildId, channel: channelId, message: message_3 }));
                                                });
                                            }
                                        });
                                        res.status(200).send(message_3);
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
                            res.status(404).send({});
                        }
                    }
                    else {
                        res.status(500).send({});
                    }
                    return [2 /*return*/];
                });
            }); });
        }
        else {
            res.status(400).send({});
        }
    });
    app.delete('/guilds/*/channels/*/messages/*', function (req, res) {
        var urlParamsValues = Object.values(req.params);
        var urlParams = urlParamsValues
            .map(function (x) { return x.replace(/\//g, ''); })
            .filter(function (x) {
            return x != '';
        });
        var guildId = urlParams[0];
        var channelId = urlParams[1];
        var messageId = urlParams[2];
        if (guildId && channelId && messageId && req.body.message && req.body.message.length < 4001) {
            database.query("SELECT * FROM guilds", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                var guild_5, channels, channel_5, messages, message_4;
                var _a;
                return __generator(this, function (_b) {
                    if (!err) {
                        guild_5 = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == guildId; });
                        if (guild_5) {
                            channels = JSON.parse(guild_5.channels);
                            channel_5 = channels.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; });
                            messages = channel_5.messages;
                            message_4 = messages.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == messageId; });
                            if ((message_4 === null || message_4 === void 0 ? void 0 : message_4.author) == res.locals.user && ((_a = JSON.parse(guild_5.members).find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.roles.map(function (x) { return channel_5.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000080) == 0x0000000080; }).includes(true))) {
                                delete messages[messages.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == messageId; })];
                                channel_5.messages = messages;
                                channels[channels.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == channelId; })] = channel_5;
                                database.query("UPDATE guilds SET channels = $1 WHERE id = $2", [JSON.stringify(channels), guildId], function (err, dbRes) {
                                    if (!err) {
                                        JSON.parse(guild_5.members).forEach(function (member) {
                                            var _a;
                                            if (member.roles.map(function (x) { return channel_5.roles.find(function (y) { return y.id == x; }); }).map(function (x) { return (x.permissions & 0x0000000080) == 0x0000000080; }).includes(true)) {
                                                (_a = websockets.get(member.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                    websocket.send(JSON.stringify({ event: 'messageEdited', guild: guildId, channel: channelId, message: message_4 }));
                                                });
                                            }
                                        });
                                        res.status(200).send(message_4);
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
                            res.status(404).send({});
                        }
                    }
                    else {
                        res.status(500).send({});
                    }
                    return [2 /*return*/];
                });
            }); });
        }
        else {
            res.status(400).send({});
        }
    });
});
