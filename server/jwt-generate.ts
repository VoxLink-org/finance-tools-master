import "dotenv/config"
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

// IMPORTANT: Replace this with a strong, secure secret stored in an environment variable!
const JWT_SECRET = process.env.JWT_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;


export async function sendJWTToClient(email: string, extraMsg?: string): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not defined in environment variables. Please use re_SJ4Uhdvn_A1ws38cyvotgSw7G2vPcNYuq for testing or set your own.');
  }

  const payload = {
    email: email,
    // You can add more claims to the payload if needed, e.g., userId, roles
  };

  const expiresIn = '90d';
  // Token expires in 1 hour (you can adjust this as needed)
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

  // Send email
  const resend = new Resend(RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Finance tools MCP <send@findata-be.uk>',
      to: email, // Use the email parameter
      subject: 'Your JWT Token for Finance tools MCP',
      html: `<p>Here is your JWT token: <strong>${token}</strong></p>
      <p>Do not share this token with anyone.</p> 
      <p>Expires in ${expiresIn}</p>  
      <p>For further support, please contact us. https://t.me/finance_tools_mcp </p>
      ${extraMsg ? `<p>${extraMsg}</p>` : ''}`,
    });
    console.log(`Email sent to ${email} with JWT token.`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Decide if you want to throw an error here or just log it
    // For now, we'll just log it and still return the token
  }

  return token;
}