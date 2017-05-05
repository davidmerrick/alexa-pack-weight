import alexa from "alexa-app";
import googleAuth from "google-auth-library";
import moment from "moment-timezone";
import google from "googleapis";
import should from "should";
import _ from 'lodash';

const APP_NAME = "Base-Node-Alexa";
var app = new alexa.app(APP_NAME);

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

app.launch((request, response) => {
    let speechOutput = "I'll record pack weight for you. What's your name?";
    response
        .say(speechOutput)
        .reprompt("Sorry, I didn't get that")
        .shouldEndSession(false);
});

app.intent("RecordPackWeightIntent",
        {
            "slots": {
                "userName": "AMAZON.US_FIRST_NAME",
                "packWeight": "AMAZON.NUMBER"
            }
        },
        (request, response) => {
            let userName = request.slot("userName");
            let packWeight = request.slot("packWeight");

            return recordPackWeight(packWeight, userName)
                .then(result => {
                    let speechOutput = "I recorded that data to the spreadsheet for you.";
                    response.say(speechOutput);
                })
                .catch(err => {
                    let speechOutput = "Sorry, an error occurred while appending data to the spreadsheet.";
                    response.say(speechOutput);
                });
        }
);

app.intent("AMAZON.HelpIntent",{}, (request, response) => {
    let speechOutput = "I can record pack weight to a Google Spreadsheet. Just tell me your name and pack weight.";
    response.say(speechOutput);
});

app.intent("AMAZON.StopIntent",{}, (request, response) => {
    let speechOutput = "Goodbye";
    response.say(speechOutput);
});

app.intent("AMAZON.CancelIntent",{}, (request, response) => {
    let speechOutput = "Okay";
    response.say(speechOutput);
});

function recordPackWeight(packWeight, userName){
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    oauth2Client.credentials = {
        access_token: ACCESS_TOKEN,
        expiry_date: EXPIRY_DATE,
        refresh_token: REFRESH_TOKEN,
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

exports.handler = app.lambda();