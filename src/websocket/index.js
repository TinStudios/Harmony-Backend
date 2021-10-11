module.exports = (wss, websockets, server, database) => {
    server.on('upgrade', (request, socket, head) => {
        const pathname = request.url.split('?')[0];
        const token = decodeURIComponent(request.url.split('token=')[request.url.split('token=').length - 1]);
        require('needle').get('http://localhost:3000/users/@me', {
            headers: {
                'Authorization': token
            }
        }, function (err, resp) {
            if (pathname === '/socket' && !err && resp.statusCode == 200) {
                wss.handleUpgrade(request, socket, head, (ws) => {
                    var websocketForThis = websockets.get(resp.body.id) ?? [];
                    websocketForThis.push(ws);
                    websockets.set(resp.body.id, websocketForThis);
                });
            } else {
                socket.destroy();
            }
        });
    });
}