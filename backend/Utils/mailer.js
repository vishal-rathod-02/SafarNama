import nodemailer from "nodemailer";

const { SMTP_EMAIL, SMTP_PASS } = process.env;

let transporter = null;

if (SMTP_EMAIL && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASS,
    },
    pool: true, // Use pooled connections for better performance and resource preservation
    maxConnections: 5,
    maxMessages: 100,
  });

  transporter.verify((error) => {
    if (error) {
      console.warn("⚠️ SMTP Mailer configuration warning:", error.message);
    } else {
      console.log("✅ SMTP Mailer is ready for dispatches");
    }
  });
} else {
  console.warn("⚠️ SMTP_EMAIL or SMTP_PASS missing in environment. Email dispatches will be logged to console in development mode.");
}

/**
 * Send an email safely with fallback logging
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  if (!transporter) {
    console.log(`\n📧 [DEV EMAIL DISPATCH MOCK]\nTo: ${to}\nSubject: ${subject}\n`);
    return { success: true, mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SafarNama" <${SMTP_EMAIL}>`,
      to,
      subject,
      html,
      ...(text && { text }),
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Failed to send email via SMTP:", error.message);
    throw new Error("Unable to send email. Please verify your email address or try again later.");
  }
};

export default transporter;
