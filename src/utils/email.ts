import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

let authorization: OAuth2Client;

function authorize() {

    fs.readFile(__dirname + '/../../credentials.json', (err, content) => {
        if (err) return;
        authorizeF(JSON.parse(content.toString()));
    });

}

function authorizeF(credentials: any) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(__dirname + '/../../token.json', (err, token) => {
        if (err) return getNewToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        authorization = oAuth2Client;
    });
}

function getNewToken(oAuth2Client: any) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/gmail.send'],
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err: any, token: any) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(__dirname + '/../../token.json', JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', __dirname + '/../../token.json');
            });
            authorization = oAuth2Client;
        });
    });
}

function sendMessage(message: string) {
    const gmail = google.gmail({ version: 'v1', auth: authorization });
    gmail.users.messages.send({
        userId: 'me',
        requestBody: {
            raw: message
        }
    });
}

export { authorize, sendMessage };