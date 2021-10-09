module.exports = (websockets, app, database, flake) => {
app.patch('/user/@me', (req, res) => {
    const userId = await checkLogin(req.headers.authorization);
        if (userId) {
            if (req.body.username && req.body.username.length < 31) {
    database.query(`UPDATE users SET username = '${req.body.username}' WHERE id = '${userId}'`, err => {
        if (!err) {
            database.query(`SELECT * FROM users`, async (err, dbRes) => {
                if (!err) {
                    const user = dbRes.rows.find(x => x.token == req.headers.authorization);
            res.send(user);
                } else {
                    res.status(500).send({});
                }
            });
        } else {
            res.status(500).send({});
        }
    });
}
        }
});
};