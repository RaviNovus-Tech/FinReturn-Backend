export const emailTemplates = {
  OTP: (data) => ({
    subject: 'Your Verification Code',
    text: `Your verification code is: ${data.otp}\nThis code will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Account Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0;">${data.otp}</div>
        <p>This code will expire in <strong>5 minutes</strong>.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} ${data.appName}. All rights reserved.</p>
      </div>
    `,
  }),
  PASSWORD_RESET: (data) => ({
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click the link below to reset your password:\n${data.resetLink}\nThis link will expire in 30 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${data.resetUrl}" target="_blank"
        style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in <strong>30 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} ${data.appName}. All rights reserved.</p>
      </div>
    `,
  }),
  // Add more templates here
};

