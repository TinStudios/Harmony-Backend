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
    app.get('/friends', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            database.query("SELECT * FROM friends", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                var friends;
                var _a;
                return __generator(this, function (_b) {
                    if (!err) {
                        friends = JSON.parse((_a = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) !== null && _a !== void 0 ? _a : JSON.stringify({ friends: [] })).friends;
                        if (friends.length > 0) {
                            res.send(friends.friends);
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
            return [2 /*return*/];
        });
    }); });
    app.get('/friends/*', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var urlParamsValues, friendId;
        return __generator(this, function (_a) {
            urlParamsValues = Object.values(req.params);
            friendId = urlParamsValues
                .map(function (x) { return x.replace(/\//g, ''); })
                .filter(function (x) {
                return x != '';
            })[0];
            if (friendId) {
                database.query("SELECT * FROM friends", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                    var friends, friend;
                    return __generator(this, function (_a) {
                        if (!err) {
                            friends = JSON.parse(dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })).friends;
                            friend = friends.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == friendId; });
                            if (friend) {
                                res.send(friend);
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
            return [2 /*return*/];
        });
    }); });
    app.post('/friends/*', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var urlParamsValues, friendId;
        return __generator(this, function (_a) {
            urlParamsValues = Object.values(req.params);
            friendId = urlParamsValues
                .map(function (x) { return x.replace(/\//g, ''); })
                .filter(function (x) {
                return x != '';
            })[0];
            if (friendId && (req.body.type == 'friend' || req.body.type == 'blocked')) {
                database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (!err) {
                            if (dbRes.rows.find(function (x) { return x.id == friendId; })) {
                                database.query("SELECT * FROM friends", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                                    var dbEntry, friends, friend_1;
                                    var _a;
                                    return __generator(this, function (_b) {
                                        if (!err) {
                                            dbEntry = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; });
                                            friends = JSON.parse((_a = dbEntry === null || dbEntry === void 0 ? void 0 : dbEntry.friends) !== null && _a !== void 0 ? _a : "[]");
                                            if (res.locals.user != friendId && !friends.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == friendId; })) {
                                                friend_1 = { id: friendId, blocked: req.body.type == 'blocked' };
                                                friends.push(friend_1);
                                                if (dbEntry) {
                                                    database.query("UPDATE friends SET friends = $1", [JSON.stringify(friends)], function (err, dbRes) {
                                                        if (!err) {
                                                            res.status(200).send(friend_1);
                                                        }
                                                        else {
                                                            res.status(500).send({});
                                                        }
                                                    });
                                                }
                                                else {
                                                    database.query("INSERT INTO friends (id, friends) VALUES ($1, $2)", [res.locals.user, JSON.stringify(friends)], function (err, dbRes) {
                                                        if (!err) {
                                                            res.status(200).send(friend_1);
                                                        }
                                                        else {
                                                            res.status(500).send({});
                                                        }
                                                    });
                                                }
                                            }
                                            else {
                                                res.status(401).send({});
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
            return [2 /*return*/];
        });
    }); });
    app.patch('/friends/*', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var urlParamsValues, friendId;
        return __generator(this, function (_a) {
            urlParamsValues = Object.values(req.params);
            friendId = urlParamsValues
                .map(function (x) { return x.replace(/\//g, ''); })
                .filter(function (x) {
                return x != '';
            })[0];
            if (friendId && (req.body.type == 'friend' || req.body.type == 'blocked')) {
                database.query("SELECT * FROM friends", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                    var friends_1;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        if (!err) {
                            friends_1 = JSON.parse((_b = (_a = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.friends) !== null && _b !== void 0 ? _b : "[]");
                            if (res.locals.user != friendId && friends_1.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == friendId; })) {
                                friends_1[friends_1.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == friendId; })].blocked = req.body.type == 'blocked';
                                database.query("UPDATE friends SET friends = $1", [JSON.stringify(friends_1)], function (err, dbRes) {
                                    if (!err) {
                                        res.status(200).send(friends_1[friends_1.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == friendId; })]);
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
                            res.status(500).send({});
                        }
                        return [2 /*return*/];
                    });
                }); });
            }
            else {
                res.status(400).send({});
            }
            return [2 /*return*/];
        });
    }); });
    app.delete('/friends/*', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var urlParamsValues, friendId;
        return __generator(this, function (_a) {
            urlParamsValues = Object.values(req.params);
            friendId = urlParamsValues
                .map(function (x) { return x.replace(/\//g, ''); })
                .filter(function (x) {
                return x != '';
            })[0];
            if (friendId) {
                database.query("SELECT * FROM friends", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                    var friends, exFriend_1;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        if (!err) {
                            friends = JSON.parse((_b = (_a = dbRes.rows.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == res.locals.user; })) === null || _a === void 0 ? void 0 : _a.friends) !== null && _b !== void 0 ? _b : "[]");
                            exFriend_1 = friends.find(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == friendId; });
                            if (res.locals.user != friendId && exFriend_1) {
                                delete friends[friends.findIndex(function (x) { return (x === null || x === void 0 ? void 0 : x.id) == friendId; })];
                                database.query("UPDATE friends SET friends = $1", [JSON.stringify(friends)], function (err, dbRes) {
                                    if (!err) {
                                        res.status(200).send(exFriend_1);
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
                            res.status(500).send({});
                        }
                        return [2 /*return*/];
                    });
                }); });
            }
            else {
                res.status(400).send({});
            }
            return [2 /*return*/];
        });
    }); });
});
