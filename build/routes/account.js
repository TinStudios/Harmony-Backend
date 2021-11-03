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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var argon2_1 = __importDefault(require("argon2"));
var sign_1 = require("jose/jwt/sign");
var import_1 = require("jose/key/import");
var intformat = require('biguint-format');
exports.default = (function (websockets, app, database, flake) {
    app.post('/login', function (req, res) {
        database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
            var user_1, token_1, _a, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!err) return [3 /*break*/, 10];
                        user_1 = dbRes.rows.find(function (x) { return x.email == req.body.email; });
                        if (!user_1) return [3 /*break*/, 8];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, argon2_1.default.verify(user_1.password, req.body.password, { type: argon2_1.default.argon2id })];
                    case 2:
                        if (!_b.sent()) return [3 /*break*/, 4];
                        _a = 'Bearer ';
                        return [4 /*yield*/, generateToken({ id: user_1.id })];
                    case 3:
                        token_1 = _a + (_b.sent());
                        database.query("UPDATE users SET token = '" + token_1 + "' WHERE id = '" + user_1.id + "'", function (err) {
                            var _a;
                            if (!err) {
                                (_a = websockets.get(user_1.id)) === null || _a === void 0 ? void 0 : _a.forEach(function (websocket) {
                                    websocket.send(JSON.stringify({ event: 'tokenChange', newToken: token_1 }));
                                });
                                res.send({ token: token_1 });
                            }
                            else {
                                res.status(500).send({});
                            }
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        res.status(401).send({});
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        e_1 = _b.sent();
                        res.status(500).send({});
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        res.status(401).send({});
                        _b.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        res.status(500).send({});
                        _b.label = 11;
                    case 11: return [2 /*return*/];
                }
            });
        }); });
    });
    app.post('/register', function (req, res) {
        if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email) && req.body.username && req.body.username.length < 31 && req.body.password) {
            database.query("SELECT * FROM users", function (err, dbRes) { return __awaiter(void 0, void 0, void 0, function () {
                var id, password, token_2, _a, discriminator;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!!err) return [3 /*break*/, 5];
                            if (!!dbRes.rows.find(function (x) { return x.email == req.body.email; })) return [3 /*break*/, 3];
                            id = intformat(flake.next(), 'dec').toString();
                            return [4 /*yield*/, argon2_1.default.hash(req.body.password, { type: argon2_1.default.argon2id })];
                        case 1:
                            password = _c.sent();
                            _a = 'Bearer ';
                            return [4 /*yield*/, generateToken({ id: id })];
                        case 2:
                            token_2 = _a + (_c.sent());
                            discriminator = generateDiscriminator((_b = dbRes.rows.filter(function (x) { return x.username == req.body.username; }).map(function (x) { return x.discriminator; })) !== null && _b !== void 0 ? _b : []);
                            database.query("INSERT INTO users (id, token, email, password, username, discriminator, creation) VALUES ($1, $2, $3, $4, $5, $6, $7)", [id, token_2, req.body.email, password, req.body.username, discriminator, Date.now()], function (err, dbRes) {
                                if (!err) {
                                    res.status(200).send({ token: token_2 });
                                }
                                else {
                                    res.status(500).send({});
                                }
                            });
                            return [3 /*break*/, 4];
                        case 3:
                            res.status(401).send({});
                            _c.label = 4;
                        case 4: return [3 /*break*/, 6];
                        case 5:
                            res.status(500).send({});
                            _c.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
        }
        else {
            res.status(400).send({});
        }
    });
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
