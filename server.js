require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, style.css, script.js)
app.use(express.static(path.join(__dirname)));

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Setup Google Sheets Auth JWT
let serviceAccountAuth;
if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    // Handle newlines in ENV variables gracefully
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'); 
    serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

app.post('/api/contact', async (req, res) => {
    const { name, email, interest } = req.body;

    if (!name || !email || !interest) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // 1. Send Email Notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'kunalsoni7651@gmail.com', // Target email
            subject: `New Lead: ${interest} from ${name}`,
            text: `You have received a new form submission!\n\nName: ${name}\nEmail: ${email}\nInterest: ${interest}\n\nPlease contact them back.`
        };

        // Try sending email (Failure here blocks the process for safety, unless configured otherwise)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await transporter.sendMail(mailOptions);
                console.log("Email sent successfully!");
            } catch (emailErr) {
                console.error("Email error:", emailErr);
                // Depending on priority, we can throw Error here or let it continue to Sheets.
            }
        } else {
            console.log("Skipped email. Nodemailer not fully configured in ENV.");
        }

        // 2. Store in Google Sheet (Optional, executes if configured)
        if (process.env.GOOGLE_SHEET_ID && serviceAccountAuth) {
            try {
                const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
                await doc.loadInfo(); 
                const sheet = doc.sheetsByIndex[0]; 
                
                await sheet.addRow({ 
                    Date: new Date().toISOString(), 
                    Name: name, 
                    Email: email, 
                    Interest: interest 
                });
                console.log("Added to Google Sheets successfully!");
            } catch (sheetErr) {
                console.error("Sheet error:", sheetErr);
            }
        }

        res.status(200).json({ message: 'Success! Form processed.' });
    } catch (error) {
        console.error('Error handling form submission:', error);
        res.status(500).json({ error: error.message || 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
