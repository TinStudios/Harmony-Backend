module.exports = (websockets, app, database) => {

    app.get('/friends', async (req, res) => {
        database.query(`SELECT * FROM friends`, async (err, dbRes) => {
            if (!err) {
                const friends = JSON.parse(dbRes.rows.find(x => x.id == res.locals.user)).friends;
                if (friends.length > 0) {
                    res.send(friends.friends);
                } else {
                    res.status(404).send({});
                }
            } else {
                res.status(500).send({});
            }
        });
    });

    app.get('/friends/*', async (req, res) => {
        const friendId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (friendId) {
            database.query(`SELECT * FROM friends`, async (err, dbRes) => {
                if (!err) {
                    const friends = JSON.parse(dbRes.rows.find(x => x.id == res.locals.user)).friends;
                    const friend = friends.find(x => x.id == friendId);
                    if (friend) {
                        res.send(friend);
                    } else {
                        res.status(404).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        }
    });

    app.post('/friends/*', async (req, res) => {
        const friendId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (friendId && (req.body.type == 'friend' || req.body.type == 'blocked')) {
            require('needle').get('http://localhost:3000/users/' + friendId, {
                headers: {
                    'Authorization': req.headers.authorization
                }
            }, function (err, resp) {
                if (!err) {
                    if (resp.statusCode == 200) {
                        database.query(`SELECT * FROM friends`, async (err, dbRes) => {
                            if (!err) {
                                const dbEntry = dbRes.rows.find(x => x.id == res.locals.user);
                                const friends = JSON.parse(dbEntry?.friends ?? "[]");
                                if (res.locals.user != friendId && !friends.find(x => x.id == friendId)) {
                                    const friend = { id: friendId, blocked: req.body.type == 'blocked' };
                                    friends.push(friend);
                                    if (dbEntry) {
                                        database.query(`UPDATE friends SET friends = $1`, [JSON.stringify(friends)], (err, dbRes) => {
                                            if (!err) {
                                                res.status(200).send(friend);
                                            } else {
                                                res.status(500).send({});
                                            }
                                        });
                                    } else {
                                        database.query(`INSERT INTO friends (id, friends) VALUES ($1, $2)`, [res.locals.user, JSON.stringify(friends)], (err, dbRes) => {
                                            if (!err) {
                                                res.status(200).send(friend);
                                            } else {
                                                res.status(500).send({});
                                            }
                                        });
                                    }
                                } else {
                                    res.status(401).send({});
                                }
                            } else {
                                res.status(500).send({});
                            }
                        });
                    } else {
                        res.status(resp.statusCode).send({});
                    }
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(400).send({});
        }
    });

    app.patch('/friends/*', async (req, res) => {
        const friendId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (friendId && (req.body.type == 'friend' || req.body.type == 'blocked')) {
            database.query(`SELECT * FROM friends`, async (err, dbRes) => {
                if (!err) {
                    const friends = JSON.parse(dbRes.rows.find(x => x.id == res.locals.user)?.friends ?? "[]");
                    if (res.locals.user != friendId && friends.find(x => x.id == friendId)) {
                        friends[friends.findIndex(x => x.id == friendId)].blocked = req.body.type == 'blocked';
                        database.query(`UPDATE friends SET friends = $1`, [JSON.stringify(friends)], (err, dbRes) => {
                            if (!err) {
                                res.status(200).send(friends[friends.findIndex(x => x.id == friendId)]);
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
        }
    });

    app.delete('/friends/*', async (req, res) => {
        const friendId = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            })[0];
        if (friendId) {
            database.query(`SELECT * FROM friends`, async (err, dbRes) => {
                if (!err) {
                    const friends = JSON.parse(dbRes.rows.find(x => x.id == res.locals.user)?.friends ?? "[]");
                    const exFriend = friends.find(x => x?.id == friendId);
                    if (res.locals.user != friendId && exFriend) {
                        delete friends[friends.findIndex(x => x.id == friendId)];
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
        }
    });
};