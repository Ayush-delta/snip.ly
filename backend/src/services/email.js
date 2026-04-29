const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;
// Initialize Resend if API key exists
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Sends a password reset email.
 * If RESEND_API_KEY is not set (e.g. local dev), it just logs the link to the console.
 */
async function sendPasswordResetEmail(toEmail, resetToken, frontendUrl) {
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
  
  if (!resend) {
    console.log('\n======================================================');
    console.log(`[EMAIL SIMULATION] Forgot Password request for: ${toEmail}`);
    console.log(`[EMAIL SIMULATION] Reset Link: ${resetLink}`);
    console.log('======================================================\n');
    return;
  }

  try {
    await resend.emails.send({
      from: 'sniply <noreply@yourdomain.com>', // User needs to configure their Resend domain later
      to: toEmail,
      subject: 'Reset your password for snip.ly',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset your password for your snip.ly account.</p>
          <p>Click the button below to reset it. This link expires in 15 minutes.</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #00e5ff; color: #000; text-decoration: none; font-weight: bold; border-radius: 6px; margin: 20px 0;">Reset Password</a>
          <p style="color: #666; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    console.log(`[Email] Password reset sent to ${toEmail}`);
  } catch (error) {
    console.error('[Email] Failed to send password reset email:', error);
    throw new Error('Failed to send email');
  }
}

module.exports = {
  sendPasswordResetEmail
};
