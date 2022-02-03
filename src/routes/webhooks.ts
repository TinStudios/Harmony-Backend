import { Message, Channel, Member, Role, Webhook } from '../interfaces';
import express from "express";
import { Client } from "pg";
import crypto from 'crypto';

export default (websockets: Map<string, WebSocket[]>, app: express.Application, database: Client) => {

    app.post('/webhook/guilds/*/channels/*/messages/*', (req: express.Request, res: express.Response) => {
        const urlParams = Object.values(req.params)
            .map((x) => x.replace(/\//g, ''))
            .filter((x) => {
                return x != '';
            });
        const guildId = urlParams[0];
        const channelId = urlParams[1];
        const token = urlParams[2];
        if (guildId && channelId && token && req.body.content && req.body.content.length < 4001) {
            database.query('SELECT * FROM guilds', async (err, dbRes) => {
                if (!err) {
                    const guild = dbRes.rows.find(x => x?.id === guildId);
                    if (guild) {
                        let channels = JSON.parse(guild.channels);
                        let channel = channels.find((x: Channel) => x?.id === channelId);
                        if (channel && channel.webhooks.find((x: Webhook) => x.token === token)) {
                             let messages = channel.messages;

                                const message: Message = {
                                    id: crypto.randomUUID(),
                                    author: {
                                        id: crypto.randomUUID(),
                                        username: req.body.username ?? channel.webhooks.find((x: Webhook) => x.token === token).username,
                                        discriminator: '0000',
                                        type: 'WEBHOOK'
                                    },
                                    content: req.body.content,
                                    creation: Date.now(),
                                    edited: 0,
                                    type: 'WEBHOOK'
                                };

                                messages.push(message);
                                channel.messages = messages;
                                channels[channels.findIndex((x: Channel) => x?.id === channelId)] = channel;
                                database.query('UPDATE guilds SET channels = $1 WHERE id = $2', [JSON.stringify(channels), guildId], (err, dbRes) => {
                                    if (!err) {
                                        database.query('SELECT * FROM users', async (err, dbRes) => {
                                            if (!err) {
                                                JSON.parse(guild.members).forEach((member: Member) => {
                                                    if (member && member.roles.map(x => channel.roles.find((y: Channel) => y.id === x)).map(x => (x.permissions & 0x0000000080) === 0x0000000080)) {
                                                        websockets.get(member.id)?.forEach(websocket => {
                                                            websocket.send(JSON.stringify({ event: 'messageSent', guild: guildId, channel: channelId, message: message }));
                                                        });
                                                    }
                                                });
                                                res.status(201).send(message);
                                            } else {
                                                res.status(500).send({ error: "Something went wrong with our server." });
                                            }
                                        });
                                    } else {
                                        res.status(500).send({ error: "Something went wrong with our server." });
                                    }
                                });
                        } else {
                            res.status(404).send({ error: "Missing permission." });
                        }
                    } else {
                        res.status(403).send({ error: "Missing permission." });
                    }
                } else {
                    res.status(500).send({ error: "Something went wrong with our server." });
                }
            });
        } else {
            res.status(400).send({ error: "Something is missing or it's not appropiate." });
        }
    });
};