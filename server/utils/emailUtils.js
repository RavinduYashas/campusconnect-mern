const nodemailer = require("nodemailer");

const sendVerificationEmail = async (email, otp) => {
    // ALWAYS log OTP to console for easy testing during development
    console.log('\n=========================================');
    console.log('       CAMPUSCONNECT VERIFICATION        ');
    console.log(`  Target Email: ${email}`);
    console.log(`  Your Code   : ${otp}`);
    console.log('=========================================\n');

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP Verification Code",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Email Verification</h2>
          <p>Hello,</p>
          <p>Your OTP code for CampusConnect is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code expires in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">© 2026 CampusConnect. All rights reserved.</p>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return true;
    } catch (error) {
        console.log("Email error:", error);
        // In development, we return true if it's just an auth error so they can still test with the console log
        if (error.code === 'EAUTH' || error.responseCode === 535) {
            console.log("NOTE: Email failed to send due to Auth error. You can still use the code above in the terminal.");
            return true;
        }
        return false;
    }
};

module.exports = { sendVerificationEmail };
