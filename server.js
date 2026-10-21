import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

// Set up a test account for Nodemailer since we don't have real credentials
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }
    
    console.log('Credentials obtained, listening on 3001');

    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
});

app.post('/api/send-otp', async (req, res) => {
    const { email, name, otp, subject } = req.body;
    
    if (!transporter) {
        return res.status(500).json({ success: false, error: 'Email system initializing' });
    }

    try {
        const info = await transporter.sendMail({
            from: '"AuraFit" <noreply@aurafit.com>',
            to: email,
            subject: subject || 'AuraFit: Verify your Email',
            text: `Hello ${name || 'Athlete'},\n\nYour AuraFit verification code is: ${otp}\n\nThis code will expire shortly.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to AuraFit</h2>
                    <p>Hello ${name || 'Athlete'},</p>
                    <p>Your verification code is:</p>
                    <h1 style="color: #4CAF50; letter-spacing: 5px;">${otp}</h1>
                    <p>Please enter this 6-digit code in the app to complete your verification.</p>
                </div>
            `
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        
        res.json({ success: true, previewUrl: nodemailer.getTestMessageUrl(info) });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
