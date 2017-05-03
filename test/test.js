import googleAuth from "google-auth-library";
import moment from "moment-timezone";
import google from "googleapis";
import should from "should";

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

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

oauth2Client.credentials = {
    access_token: ACCESS_TOKEN,
    expiry_date: EXPIRY_DATE,
    token_type: "Bearer"
};

let packWeight = "";
let userName = "Becca";

try {
    should.exist(packWeight);
    should.not.be.empty(packWeight);
} catch(e) {
    console.error("Please specify a valid pack weight");
    process.exit(1);
};

recordPackWeight(packWeight, userName)
    .then(result => {
        console.log("Success!");
    })
    .catch(err => {
        console.error("Fail.");
    });


function recordPackWeight(packWeight, userName){
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2();

    oauth2Client.credentials = {
        access_token: ACCESS_TOKEN,
        expiry_date: EXPIRY_DATE,
        token_type: "Bearer"
    };

    return appendSheetItems(oauth2Client, packWeight, userName);
}

function appendSheetItems(oauth2Client, packWeight, userName) {
    return new Promise((resolve, reject) => {
        console.log("Appending data to sheet...");
        let sheets = google.sheets('v4');
        let now = moment.tz(TIMEZONE);
        let dateString = now.format("MM/DD/YYYY");
        var values = [
            [dateString, packWeight, userName]
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