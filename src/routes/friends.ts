import { Friend } from '../interfaces';
import express from "express";
import { Client } from "pg";

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {

    app.get('/friends', async (req: express.Request, res: express.Response) => {
        database.query(`SELECT * FROM friends`, async (err, dbRes) => {
            if (!err) {
                const friends = JSON.parse(dbRes.rows.find(x => x?.id === res.locals.user) ?? JSON.stringify({ friends: [] })).friends;
                res.send(friends.friends);
            } else {
                res.status(500).send({ error: "Something went wrong with our server." });
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
                    const friends = JSON.parse(dbRes.rows.find(x => x?.id === res.locals.user)).friends;
                    const friend = friends.find((x: Friend) => x?.id === friendId);
                    if (friend) {
                        res.send(friend);
                    } else {
                        res.status(404).send({ error: "Friend not found." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
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
                                    friends.push(friend);
                                    if (dbEntry) {
                                        database.query(`UPDATE friends SET friends = $1`, [JSON.stringify(friends)], (err, dbRes) => {
                                            if (!err) {
                                                res.status(201).send(friend);
                                            } else {
                                                res.status(500).send({ error: "Something went wrong with our server." });
                                            }
                                        });
                                    } else {
                                        database.query(`INSERT INTO friends (id, friends) VALUES ($1, $2)`, [res.locals.user, JSON.stringify(friends)], (err, dbRes) => {
                                            if (!err) {
                                                res.send(friend);
                                            } else {
                                                res.status(500).send({ error: "Something went wrong with our server." });
                                            }
                                        });
                                    }
                                } else {
                                    res.status(403).send({ error: "You can't friend this person." });
                                }
                            } else {
                                res.status(500).send({ error: "Something went wrong with our server." });
                            }
                        });
                    } else {
                        res.status(404).send({})
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing." });
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
        }
    });
};