module.exports = (websockets, app, database) => {
    require('./account')(websockets, app, database);
    require('./users')(websockets, app, database);

    app.use((req, res, next) => {
        res.status(404).send({});
    });

    app.use((err, req, res, next) => {
        res.status(500).send({});
    });
};