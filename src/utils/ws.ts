import { WebSocketServer, Server } from 'ws';
import { User } from '../interfaces';
import { Client } from 'pg';

export default (wss: WebSocketServer, websockets: Map<string, WebSocket[]>, server: Server, database: Client) => {
    server.on('upgrade', async (request, socket, head) => {
        const pathname = request.url?.split('?')[0];
        const token = decodeURIComponent(request.url?.split('token=')[request.url?.split('token=').length - 1] ?? "");
        const user: User = await checkLogin(token);
            if (pathname === '/socket' && user.creation != 0) {
                wss.handleUpgrade(request, socket, head, (ws) => {
                    var websocketForThis = websockets.get(user.id) ?? [];
                    websocketForThis.push(ws as unknown as WebSocket);
                    websockets.set(user.id, websocketForThis);
                });
            } else {
                socket.destroy();
            }
    });

    async function checkLogin(token: string): Promise<User> {
        return await new Promise(resolve => {
            const emptyUser: User = {
                id: "",
                token: "",
                email: "",
                password: "",
                username: "",
                discriminator: "",
                creation: 0
            };
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
                            resolve(emptyUser);
                        }
                    } else {
                        resolve(emptyUser);
                    }
                } else {
                    resolve(emptyUser);
                }
            });
        });
    }
}