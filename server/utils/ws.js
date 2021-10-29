const config = require('./config');

module.exports = (wss, websockets, server, database) => {
    server.on('upgrade', async (request, socket, head) => {
        const pathname = request.url.split('?')[0];
        const token = decodeURIComponent(request.url.split('token=')[request.url.split('token=').length - 1]);
            if (pathname === '/socket' && await checkLogin(token)) {
                wss.handleUpgrade(request, socket, head, (ws) => {
                    var websocketForThis = websockets.get(resp.body.id) ?? [];
                    websocketForThis.push(ws);
                    websockets.set(resp.body.id, websocketForThis);
                });
            } else {
                socket.destroy();
            }
    });

    async function checkLogin(token) {
        return await new Promise(resolve => {
            database.query(`SELECT * FROM users`, async (err, res) => {
                if (!err) {
                    if (res.rows.map(x => x.token == token).includes(true)) {
                        try {
                            const { importSPKI } = require('jose/key/import');
                            const { jwtVerify } = require('jose/jwt/verify');

                            const ecPublicKey = await importSPKI(require('fs').readFileSync(__dirname + '/../../public.key').toString(), 'ES256');

                            const info = await jwtVerify(token.split('Bearer ')[1], ecPublicKey, {
                                issuer: 'seltorn',
                                audience: 'seltorn'
                            });
                            resolve(res.rows.find(x => x.token == token));

                        } catch {
                            resolve(false);
                        }
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            });
        });
    }
}