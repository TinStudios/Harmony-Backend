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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var argon2_1 = __importDefault(require("argon2"));
var sign_1 = require("jose/jwt/sign");
var import_1 = require("jose/key/import");
exports.default = (function (websockets, app, database) {
    app.get('/users/@me', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                var user_1, preReturnedUser, token, email, password, rest, returnedUser;
                return __generator(this, function (_a) {
                    if (!err) {
                        user_1 = dbRes.rows.find(function (x) { return x.token == req.headers.authorization; });
                        preReturnedUser = Object.keys(user_1).reduce(function (obj, key, index) {
                            var _a;
                            return (__assign(__assign({}, obj), (_a = {}, _a[key] = Object.keys(user_1).map(function (x) { return user_1[x]; })[index], _a)));
                        }, {});
                        token = preReturnedUser.token, email = preReturnedUser.email, password = preReturnedUser.password, rest = __rest(preReturnedUser, ["token", "email", "password"]);
                        returnedUser = rest;
                        res.send(returnedUser);
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
    app.get('/users/*', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var urlParamsValues, userId;
        return __generator(this, function (_a) {
            urlParamsValues = Object.values(req.params);
            userId = urlParamsValues
                .map(function (x) { return x.replace(/\//g, ''); })
                .filter(function (x) {
                return x != '';
            })[0];
            database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                var user_2, preReturnedUser, token, email, password, rest, returnedUser;
                return __generator(this, function (_a) {
                    if (!err) {
                        user_2 = dbRes.rows.find(function (x) { return x.id == userId; });
                        if (user_2) {
                            preReturnedUser = Object.keys(user_2).reduce(function (obj, key, index) {
                                var _a;
                                return (__assign(__assign({}, obj), (_a = {}, _a[key] = Object.keys(user_2).map(function (x) { return user_2[x]; })[index], _a)));
                            }, {});
                            token = preReturnedUser.token, email = preReturnedUser.email, password = preReturnedUser.password, rest = __rest(preReturnedUser, ["token", "email", "password"]);
                            returnedUser = rest;
                            res.send(returnedUser);
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
    app.delete('/users/@me', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                var user_3;
                return __generator(this, function (_a) {
                    if (!err) {
                        user_3 = dbRes.rows.find(function (x) { return x.id == res.locals.user; });
                        database.query("DELETE FROM users WHERE token = '" + req.headers.authorization + "'", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                            var preReturnedUser, token, email, password, rest, returnedUser_1;
                            var _a;
                            return __generator(this, function (_b) {
                                if (!err) {
                                    preReturnedUser = Object.keys(user_3).reduce(function (obj, key, index) {
                                        var _a;
                                        return (__assign(__assign({}, obj), (_a = {}, _a[key] = Object.keys(user_3).map(function (x) { return user_3[x]; })[index], _a)));
                                    }, {});
                                    token = preReturnedUser.token, email = preReturnedUser.email, password = preReturnedUser.password, rest = __rest(preReturnedUser, ["token", "email", "password"]);
                                    returnedUser_1 = rest;
                                    (_a = websockets.get(user_3.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                        websocket.send(JSON.stringify({ event: 'userDeleted', user: returnedUser_1 }));
                                    });
                                    res.send(returnedUser_1);
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
                    return [2 /*return*/];
                });
            }); });
            return [2 /*return*/];
        });
    }); });
    app.patch('/users/@me', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if ((req.body.username && req.body.username.length < 31) || req.body.password) {
                database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                    var user_4, discriminator_1, token, _a, _b, _c, _d, _e, _f;
                    var _g, _h;
                    return __generator(this, function (_j) {
                        switch (_j.label) {
                            case 0:
                                if (!!err) return [3 /*break*/, 5];
                                user_4 = dbRes.rows.find(function (x) { return x.id == res.locals.user; });
                                discriminator_1 = dbRes.rows.find(function (x) { return x.username == req.body.username && x.discriminator == user_4.discriminator; }) ? generateDiscriminator(dbRes.rows.filter(function (x) { return x.username == req.body.username; })) : user_4.discriminator;
                                if (!req.body.password) return [3 /*break*/, 2];
                                _b = 'Bearer ';
                                return [4 /*yield*/, generateToken({ id: user_4.id })];
                            case 1:
                                _a = _b + (_j.sent());
                                return [3 /*break*/, 3];
                            case 2:
                                _a = user_4.token;
                                _j.label = 3;
                            case 3:
                                token = _a;
                                _d = (_c = database).query;
                                _e = ["UPDATE users SET username = $1, discriminator = $2, password = $3, token = $4 WHERE id = $5"];
                                _f = [(_g = req.body.username) !== null && _g !== void 0 ? _g : user_4.username, discriminator_1];
                                return [4 /*yield*/, argon2_1.default.hash((_h = req.body.password) !== null && _h !== void 0 ? _h : user_4.password, { type: argon2_1.default.argon2id })];
                            case 4:
                                _d.apply(_c, _e.concat([_f.concat([_j.sent(), token, user_4.id]), function (err) {
                                        var _a;
                                        if (!err) {
                                            var preReturnedUser = Object.keys(user_4).reduce(function (obj, key, index) {
                                                var _a;
                                                return (__assign(__assign({}, obj), (_a = {}, _a[key] = Object.keys(user_4).map(function (x) { return user_4[x]; })[index], _a)));
                                            }, {});
                                            preReturnedUser.username = req.body.username;
                                            preReturnedUser.discriminator = discriminator_1;
                                            var token_1 = preReturnedUser.token, email = preReturnedUser.email, password = preReturnedUser.password, rest = __rest(preReturnedUser, ["token", "email", "password"]);
                                            var returnedUser_2 = rest;
                                            (_a = websockets.get(user_4.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                                websocket.send(JSON.stringify({ event: 'userEdited', user: returnedUser_2 }));
                                            });
                                            res.send(returnedUser_2);
                                        }
                                        else {
                                            res.status(500).send({});
                                        }
                                    }]));
                                return [3 /*break*/, 6];
                            case 5:
                                res.status(500).send({});
                                _j.label = 6;
                            case 6: return [2 /*return*/];
                        }
                    });
                }); });
            }
            else {
                res.status(400).send({});
            }
            return [2 /*return*/];
        });
    }); });
    function generateDiscriminator(excluded) {
        var pre = Math.floor(Math.random() * (9999 - 1 + 1) + 1);
        var final = pre.toString().padStart(4, '0');
        if (excluded.includes(final)) {
            return generateDiscriminator(excluded);
        }
        else {
            return final;
        }
    }
    function generateToken(info) {
        return __awaiter(this, void 0, void 0, function () {
            var privateKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, import_1.importPKCS8)(require('fs').readFileSync(__dirname + '/../../private.key').toString(), 'ES256')];
                    case 1:
                        privateKey = _a.sent();
                        return [4 /*yield*/, new sign_1.SignJWT({ info: info })
                                .setProtectedHeader({ alg: 'ES256' })
                                .setIssuedAt()
                                .setIssuer('seltorn')
                                .setAudience('seltorn')
                                .setExpirationTime('7d')
                                .sign(privateKey)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
});
