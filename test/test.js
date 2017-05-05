import googleAuth from "google-auth-library";
import moment from "moment-timezone";
import google from "googleapis";
import should from "should";
import _ from 'lodash';

const SHEET_ID = process.env.SHEET_ID;
should.exist(SHEET_ID);

const TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';

const CLIENT_SECRET = process.env.CLIENT_SECRET;
should.exist(CLIENT_SECRET);
const CLIENT_ID = process.env.CLIENT_ID;
should.exist(CLIENT_ID);
const REDIRECT_URI = process.env.REDIRECT_URI;
should.exist(REDIRECT_URI);

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
should.exist(ACCESS_TOKEN);
const EXPIRY_DATE = process.env.EXPIRY_DATE;
should.exist(EXPIRY_DATE);
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
should.exist(REFRESH_TOKEN);

let packWeight = "10";
let userName = "foo";

recordPackWeight(packWeight, userName)
    .then(result => {
        console.log("Success!");
    })
    .catch(err => {
        console.error(err);
    });


function recordPackWeight(packWeight, userName){
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    oauth2Client.credentials = {
        access_token: ACCESS_TOKEN,
        refresh_token: REFRESH_TOKEN,
        expiry_date: EXPIRY_DATE,
        token_type: "Bearer"
    };

    return appendSheetItems(oauth2Client, packWeight, userName);
}

function appendSheetItems(oauth2Client, packWeight, userName) {
    return new Promise((resolve, reject) => {
        console.log("Appending data to sheet...");
        let sheets = google.sheets('v4');
        let formattedUserName = _.capitalize(userName);
        let now = moment.tz(TIMEZONE);
        let dateString = now.format("MM/DD/YYYY");
        var values = [
            [dateString, packWeight, formattedUserName]
        ];
        var range = 'Sheet1!A2:C';
        var body = {
            range: range,
            majorDimension: "ROWS",
            values: values
        }

        sheets.spreadsheets.values.append({
            auth: oauth2Client,
            spreadsheetId: SHEET_ID,
            range: range,
            resource: body,
            valueInputOption: "USER_ENTERED"
        }, (err, result) => {
            if(err) {
                console.error(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}
