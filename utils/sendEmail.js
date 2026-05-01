// sendEmail.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Γενική συνάρτηση αποστολής email
async function sendEmail({ to, subject, text, html }) {
  try {
    let info = await transporter.sendMail({
      from: '"Facilities Booking" <no-reply@facilities.com>',
      to,
      subject,
      text,
      html
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
      console.error("❌ Error sending email:", err);
      throw err; // 🔥 CRITICAL FIX
  }
}

module.exports = sendEmail;