import { Resend } from "resend";

// Lazy initialization - only throw when actually used, not at startup
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured. Email sending is unavailable.");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "VaultGenesis <noreply@vaultgenesis.com>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send a transactional email via Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const { data, error } = await getResend().emails.send({
    from: options.from ?? FROM_EMAIL,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    console.error("[Resend] Email send error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log("[Resend] Email sent:", data?.id);
}

/**
 * Send a welcome email to a new user
 */
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Welcome to VaultGenesis",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 8px;">Welcome to VaultGenesis</h1>
        <p style="color: #aaa; margin-bottom: 24px;">The next-generation DeFi platform</p>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your account is ready. You can now:</p>
        <ul>
          <li>🪙 Create and deploy your own tokens</li>
          <li>📈 Participate in presales</li>
          <li>💰 Stake tokens and earn rewards</li>
          <li>🤖 Run automated trading bots</li>
        </ul>
        <a href="https://vaultgenesis.com" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #fff; color: #000; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
          Get Started
        </a>
        <p style="margin-top: 32px; color: #555; font-size: 12px;">VaultGenesis — vaultgenesis.com</p>
      </div>
    `,
  });
}

/**
 * Send a token deployment confirmation email
 */
export async function sendTokenDeployedEmail(
  to: string,
  tokenName: string,
  tokenSymbol: string,
  txHash?: string
): Promise<void> {
  await sendEmail({
    to,
    subject: `Your token ${tokenSymbol} has been deployed!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; border-radius: 12px;">
        <h1 style="font-size: 28px; font-weight: 900; margin-bottom: 8px;">Token Deployed!</h1>
        <p style="color: #aaa; margin-bottom: 24px;">Your token is now live on the blockchain</p>
        <p>Your token <strong>${tokenName} (${tokenSymbol})</strong> has been successfully deployed.</p>
        ${txHash ? `
        <div style="background: #111; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="color: #aaa; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.05em;">Transaction Hash</p>
          <p style="font-family: monospace; font-size: 13px; word-break: break-all; margin: 0;">${txHash}</p>
        </div>
        <a href="https://etherscan.io/tx/${txHash}" style="display: inline-block; padding: 12px 24px; background: #fff; color: #000; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
          View on Etherscan
        </a>
        ` : ''}
        <p style="margin-top: 32px; color: #555; font-size: 12px;">VaultGenesis — vaultgenesis.com</p>
      </div>
    `,
  });
}
