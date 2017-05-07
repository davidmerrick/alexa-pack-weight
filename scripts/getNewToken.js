import googleAuth from "google-auth-library";
import google from "googleapis";
import should from "should";
import readline from "readline";

const SHEET_ID = process.env.SHEET_ID;
should.exist(SHEET_ID);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const CLIENT_SECRET = process.env.CLIENT_SECRET;
should.exist(CLIENT_SECRET);
const CLIENT_ID = process.env.CLIENT_ID;
should.exist(CLIENT_ID);
const REDIRECT_URI = process.env.REDIRECT_URI;
should.exist(REDIRECT_URI);

console.log("Authorizing...");
getNewToken(oauth2Client => {
    let sheets = google.sheets('v4');
    sheets.spreadsheets.values.get({
        auth: oauth2Client,
        spreadsheetId: SHEET_ID,
        range: 'A1'
    }, (err, result) => {
        if(err) {
            console.error(err);
            process.exit(1);
        } else {
            console.log(`SUCCESS. Tested token.`);
            process.exit(0);
        }
    });
});

function getNewToken(callback) {
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    let authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent' // Needed to generate "refresh_token" every time.
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', code => {
        rl.close();
        oauth2Client.getToken(code, (err, token) => {
            if (err) {
                console.error(err);
                process.exit(1);
                return;
            }
            oauth2Client.credentials = token;
            console.log(token);
            callback(oauth2Client);
        });
    });
}

