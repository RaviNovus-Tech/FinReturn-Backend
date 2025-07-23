import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { emailTemplates } from "./emailTemplates.js";

dotenv.config();
// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(emailConfig);

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error("Email server connection error:", error);
  } else {
    console.log("Email server connected successfully");
  }
});

/**
 * Send email using specified template
 * @param {string} to - Recipient email
 * @param {EmailTemplates} templateType - Template type from enum
 * @param {object} data - Data for template
 * @returns {Promise<void>}
 */
export const sendEmail = async (to, templateType, data) => {
  try {
    if (!emailTemplates[templateType]) {
      throw new Error(`Email template ${templateType} not found`);
    }

    const template = emailTemplates[templateType]({
      appName: process.env.APP_NAME,
      ...data,
    });

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Our App"}" <${
        process.env.EMAIL_USERNAME
      }>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
