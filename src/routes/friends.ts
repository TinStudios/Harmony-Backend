import { Friend } from '../interfaces';
import express from "express";
import { Client } from "pg";

<<<<<<< HEAD
export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {
=======
module.exports = (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {
>>>>>>> 0718f96 (Changed to TypeScript)

    app.get('/friends', async (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM friends`, async (err, dbRes) => {
            if (!err) {
<<<<<<< HEAD
                const friends = JSON.parse(dbRes.rows.find(x => x?.id === res.locals.user) ?? JSON.stringify({ friends: [] })).friends;
                res.send(friends.friends);
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
=======
                const friends = JSON.parse(dbRes.rows.find(x => x?.id == res.locals.user) ?? JSON.stringify({ friends: [] })).friends;
                if (friends.length > 0) {
                    res.send(friends.friends);
                } else {
                    res.status(404).send({});
                }
            } else {
                res.status(500).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
            }
        });
    });

    app.get('/friends/*', async (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const friendId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (friendId) {
            database.query(`SELECT * FROM friends`, async (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
                    const friends = JSON.parse(dbRes.rows.find(x => x?.id === res.locals.user)).friends;
                    const friend = friends.find((x: Friend) => x?.id === friendId);
                    if (friend) {
                        res.send(friend);
                    } else {
                        res.status(404).send({ error: "Friend not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
=======
                    const friends = JSON.parse(dbRes.rows.find(x => x?.id == res.locals.user)).friends;
                    const friend = friends.find((x: Friend) => x?.id == friendId);
                    if (friend) {
                        res.send(friend);
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
                }
            });
        }
    });

    app.post('/friends/*', async (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const friendId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
<<<<<<< HEAD
        if (friendId && (req.body.type === 'friend' || req.body.type === 'blocked')) {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    if (dbRes.rows.find(x => x.id === friendId)) {
                        database.query(`SELECT * FROM friends`, async (err, dbRes) => {
                            if (!err) {
                                const dbEntry = dbRes.rows.find(x => x?.id === res.locals.user);
                                const friends = JSON.parse(dbEntry?.friends ?? "[]");
                                if (res.locals.user != friendId && !friends.find((x: Friend) => x?.id === friendId)) {
                                    const friend = { id: friendId, blocked: req.body.type === 'blocked' };
=======
        if (friendId && (req.body.type == 'friend' || req.body.type == 'blocked')) {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    if(dbRes.rows.find(x => x.id == friendId)) {
                        database.query(`SELECT * FROM friends`, async (err, dbRes) => {
                            if (!err) {
                                const dbEntry = dbRes.rows.find(x => x?.id == res.locals.user);
                                const friends = JSON.parse(dbEntry?.friends ?? "[]");
                                if (res.locals.user != friendId && !friends.find((x: Friend) => x?.id == friendId)) {
                                    const friend = { id: friendId, blocked: req.body.type == 'blocked' };
>>>>>>> 0718f96 (Changed to TypeScript)
                                    friends.push(friend);
                                    if (dbEntry) {
                                        database.query(`UPDATE friends SET friends = $1`, [JSON.stringify(friends)], (err, dbRes) => {
                                            if (!err) {
<<<<<<< HEAD
                                                res.status(201).send(friend);
                                            } else {
                                                res.status(500).send({ error: "Something went wrong with our server." });
=======
                                                res.status(200).send(friend);
                                            } else {
                                                res.status(500).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
                                            }
                                        });
                                    } else {
                                        database.query(`INSERT INTO friends (id, friends) VALUES ($1, $2)`, [res.locals.user, JSON.stringify(friends)], (err, dbRes) => {
                                            if (!err) {
<<<<<<< HEAD
                                                res.send(friend);
                                            } else {
                                                res.status(500).send({ error: "Something went wrong with our server." });
=======
                                                res.status(200).send(friend);
                                            } else {
                                                res.status(500).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
                                            }
                                        });
                                    }
                                } else {
<<<<<<< HEAD
                                    res.status(403).send({ error: "You can't friend this person." });
                                }
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
=======
                                    res.status(401).send({});
                                }
                            } else {
                                res.status(500).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
                            }
                        });
                    } else {
                        res.status(404).send({})
                    }
                } else {
<<<<<<< HEAD
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
        }
    });

    app.patch('/friends/*', async (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const friendId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (friendId && (req.body.type == 'friend' || req.body.type == 'blocked')) {
            database.query(`SELECT * FROM friends`, async (err, dbRes) => {
                if (!err) {
                    const friends = JSON.parse(dbRes.rows.find(x => x?.id == res.locals.user)?.friends ?? "[]");
                    if (res.locals.user != friendId && friends.find((x: Friend) => x?.id == friendId)) {
                        friends[friends.findIndex((x: Friend) => x?.id == friendId)].blocked = req.body.type == 'blocked';
                        database.query(`UPDATE friends SET friends = $1`, [JSON.stringify(friends)], (err, dbRes) => {
                            if (!err) {
                                res.status(200).send(friends[friends.findIndex((x: Friend) => x?.id == friendId)]);
                            } else {
                                res.status(500).send({});
                            }
                        });
                    } else {
                        res.status(401).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
        }
    });

    app.delete('/friends/*', async (req: express.Request, res: express.Response) => {
        const urlParamsValues: string[] = Object.values(req.params);
        const friendId = urlParamsValues
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (friendId) {
            database.query(`SELECT * FROM friends`, async (err, dbRes) => {
                if (!err) {
<<<<<<< HEAD
                    const friends = JSON.parse(dbRes.rows.find(x => x?.id === res.locals.user)?.friends ?? "[]");
                    const exFriend = friends.find((x: Friend) => x?.id === friendId);
                    if (res.locals.user != friendId && exFriend) {
                        delete friends[friends.findIndex((x: Friend) => x?.id === friendId)];
                        database.query(`UPDATE friends SET friends = $1`, [JSON.stringify(friends)], (err, dbRes) => {
                            if (!err) {
                                res.send({});
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(403).send({ error: "You can't unfriend this person." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
=======
                    const friends = JSON.parse(dbRes.rows.find(x => x?.id == res.locals.user)?.friends ?? "[]");
                    const exFriend = friends.find((x: Friend) => x?.id == friendId);
                    if (res.locals.user != friendId && exFriend) {
                        delete friends[friends.findIndex((x: Friend) => x?.id == friendId)];
                        database.query(`UPDATE friends SET friends = $1`, [JSON.stringify(friends)], (err, dbRes) => {
                            if (!err) {
                                res.status(200).send(exFriend);
                            } else {
                                res.status(500).send({});
                            }
                        });
                    } else {
                        res.status(401).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
>>>>>>> 0718f96 (Changed to TypeScript)
        }
    });
};