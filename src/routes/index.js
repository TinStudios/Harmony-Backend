module.exports = (websockets, app, database, checkLogin) => {
    const FlakeId = require('flakeid');
    const flake = new FlakeId();

    require('./account')(websockets, app, database, flake);
    require('./guilds')(websockets, app, database, checkLogin, flake);

    app.use((req, res, next) => {
        res.status(404).send({});
    });

    app.use((err, req, res, next) => {
        res.status(500).send({});
    });
};