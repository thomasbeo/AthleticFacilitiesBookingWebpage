const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Γενική συνάρτηση αποστολής email
async function sendEmail({ to, subject, text, html }) {
  try {
    let info = await transporter.sendMail({
      from: `"Facilities Booking" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
}

module.exports = sendEmail;