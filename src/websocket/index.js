module.exports = (wss, websockets, server, database, checkLogin) => {
    server.on('upgrade', (request, socket, head) => {
        const pathname = request.url.split("?")[0];
        const token = request.url.split("token=")[request.url.split("token=").length - 1];
        database.query(`SELECT token FROM users`, async (err, res) => {
            if (!err) {
                if (pathname === '/socket' && await checkLogin(decodeURIComponent(token))) {
                    wss.handleUpgrade(request, socket, head, (ws) => {
                        var websocketForThis = websockets.get(token) ?? [];
                        websocketForThis.push(ws);
                        websockets.set(token, websocketForThis);
                    });
                } else {
                    socket.destroy();
                }
            } else {
                socket.destroy();
            }
        });
    });
}