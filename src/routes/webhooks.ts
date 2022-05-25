import { Message, Channel, Member, Role, Webhook } from '../interfaces';
import express from "express";
import cassandra from 'cassandra-driver';
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: cassandra.Client) => {

    app.post('/webhooks/guilds/*/channels/*/messages/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const token = urlParams[2];
        if (guildId && channelId && token && req.body.content && req.body.content.length < 4001) {
            database.execute('SELECT * FROM guilds WHERE id = ?', [guildId], { prepare: true }).then(async dbRes => {
                
                    const guild = dbRes.rows[0];
                    if (guild) {
                        let channels = guild.channels;
                        let channel = channels.find((x: Channel) => x?.id?.toString() === channelId);
                        const webhooks = channel.webhooks ?? [];
                        if (channel && (webhooks ?? []).find((x: Webhook) => x.token === token)) {
                            let messages = channel.messages ?? [];

                            const message: Message = {
                                id: crypto.randomUUID(),
                                author: {
                                    id: 'default',
                                    username: req.body.username ?? webhooks.find((x: Webhook) => x.token === token).username,
                                    roles: [],
                                    discriminator: '0000',
                                    avatar: 'botDefault',
                                    about: '',
                                    type: 'WEBHOOK'
                                },
                                content: req.body.content,
                                creation: Date.now(),
                                edited: 0,
                                type: 'WEBHOOK'
                            };

                            messages.push(message);
                            channel.messages = messages;
                            channels[channels.findIndex((x: Channel) => x?.id?.toString() === channelId)] = channel;
                            database.execute('UPDATE guilds SET channels = ? WHERE id = ?', [channels, guildId], { prepare: true }).then(() => {
                                
                                    database.execute('SELECT * FROM users', { prepare: true }).then(async dbRes => {
                                        
                                            guild.members.forEach((member: Member) => {
                                                if (member && member.roles.map(x => (channel.roles ?? []).find((y: Channel) => y.id.toString() === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                    websockets.get(member.id)?.forEach(websocket => {
                                                        websocket.send(JSON.stringify({ event: 'messageSent', guild: guildId, channel: channelId, message: message }));
                                                    });
                                                }
                                            });
                                            res.status(201).send(message);
                                    });
                            });
                        } else {
                            res.status(404).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });
};