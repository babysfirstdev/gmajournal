const express = require('express');
const path = require('path');
const { google } = require('googleapis');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const sessionOptions = { secret: 'thisisnotagoodsecret', resave: false, saveUninitialized: false }
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'))
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(session(sessionOptions));
app.use(flash());

app.get('/', (req, res) => {
    res.render('index', { messages: req.flash('success') });
});

app.post('/', async (req, res) => {
    const { date, day, proposed, completed, notes } = req.body;
    const auth = new google.auth.GoogleAuth({
        keyFile: "keys.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = "1JxV7buV1mtm-nyCuDgbeK8p8CmVBevPXEywF4hHXRVo";

    // Get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    });
    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "Sheet1!A2:B2",
    });
    // Write row(s) to spreadsheet
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: "Sheet1!A:F",
        valueInputOption: "USER_ENTERED",
        resource: {
            values:
                [[date, day, proposed, completed, notes]],
        },

    });
    req.flash('success', 'Successfully logged!');
    *res.redirect('/');
});


app.listen(8080, (req, res) => {
    console.log('Running on 8080')
});

