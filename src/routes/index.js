module.exports = (websockets, app, database) => {
    const FlakeId = require('flakeid');
    const flake = new FlakeId();

<<<<<<< HEAD
<<<<<<< HEAD
    require('./account')(websockets, app, database, flake);
<<<<<<< HEAD
=======
    require('./users')(websockets, app, database, checkLogin);
>>>>>>> 1e07bff (Revert "Initial Dot Account")
    require('./guilds')(websockets, app, database, checkLogin, flake);
=======
=======
    app.use('/icons', require('express').static(__dirname + '/../../icons'));

>>>>>>> 487ffb6 (idk)
    app.use((req, res, next) => {
        require('needle').get(`${JSON.parse(require('fs').readFileSync(__dirname + '/../../config.json').toString()).account}/users/@me`, {
            headers: {
                'Authorization': req.headers.authorization ?? ""
            }
        }, function (err, resp) {
            if (!err) {
                if (resp.statusCode == 200) {
                    res.locals.user = resp.body.id;
                    next();
                } else {
                    res.status(resp.statusCode).send({});
                }
            } else {
                res.status(500).send({});
            }
        });
    });

    require('./messages')(websockets, app, database, flake);

    require('./channels')(websockets, app, database, flake);

    require('./roles')(websockets, app, database, flake);

    require('./members')(websockets, app, database);

    require('./guilds')(websockets, app, database, flake);
>>>>>>> 546e288 (Initial guild support)

    require('./friends')(websockets, app, database);

    app.use((req, res, next) => {
        res.status(404).send({});
    });

    app.use((err, req, res, next) => {
        res.status(500).send({});
    });
};