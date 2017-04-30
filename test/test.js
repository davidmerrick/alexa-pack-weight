import googleAuth from "google-auth-library";
import moment from "moment-timezone";
import google from "googleapis";
import should from "should";

const SHEET_ID = process.env.SHEET_ID;
should.exist(SHEET_ID);

const TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
should.exist(ACCESS_TOKEN);
const EXPIRY_DATE = process.env.EXPIRY_DATE;
should.exist(EXPIRY_DATE);
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
should.exist(REFRESH_TOKEN);

var auth = new googleAuth();
var oauth2Client = new auth.OAuth2();

oauth2Client.credentials = {
    access_token: ACCESS_TOKEN,
    expiry_date: EXPIRY_DATE,
    refresh_token: REFRESH_TOKEN,
    token_type: "Bearer"
};

appendSheetItems(oauth2Client);

function appendSheetItems(oauth2Client) {
    console.log("Appending data to sheet...");
    let sheets = google.sheets('v4');
    let now = moment.tz(TIMEZONE);
    let dateString = now.format("MM/DD/YYYY");
    var values = [
        [dateString, "Foo", "Bar"]
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
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log("SUCCESS: Wrote data to spreadsheet.");
    });
}