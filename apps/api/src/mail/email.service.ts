import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmailService {
  private readonly mailersend: MailerSend;
  private readonly logger = new Logger(EmailService.name);
  private readonly sender: Sender;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.mailersend = new MailerSend({
      apiKey: this.configService.get<string>('MAILERSEND_API_KEY') || '',
    });
    this.sender = new Sender(
      this.configService.get<string>('MAIL_FROM') || 'no-reply@golfinity.com',
      this.configService.get<string>('MAIL_NAME') || 'Golfinity Connect',
    );
  }

  private getCommonStyles() {
    return `
      body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1a1a1a; margin: 0; padding: 0; background-color: #f8fafc; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
      .header { background: #000000; padding: 40px 20px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
      .content { padding: 40px; }
      .footer { background: #f1f5f9; padding: 30px 20px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
      .button { display: inline-block; padding: 16px 32px; background-color: #10b981; color: white !important; text-decoration: none; border-radius: 12px; font-weight: 700; margin-top: 25px; transition: all 0.2s; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); }
      .button:hover { background-color: #059669; transform: translateY(-1px); }
      .divider { height: 1px; background: #e2e8f0; margin: 30px 0; }
      .token-box { background: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 12px; font-family: 'Courier New', monospace; font-size: 24px; color: #065f46; font-weight: 800; letter-spacing: 4px; text-align: center; margin: 25px 0; }
      .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
      .badge-success { background: #d1fae5; color: #065f46; }
      .order-item { display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0; }
      .order-total { margin-top: 20px; font-size: 18px; font-weight: 800; text-align: right; }
      h2 { color: #0f172a; margin-top: 0; font-size: 22px; font-weight: 700; }
      p { color: #475569; margin-bottom: 20px; }
    `;
  }

  async sendMarketingEmail(
    to: string,
    fullName: string,
    title: string,
    content: string,
    ctaText?: string,
    ctaUrl?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { email: to },
      include: { preference: true },
    });

    if (user && !user.preference?.marketingEmails) {
      this.logger.log(`Skipping marketing email for ${to} (opted out)`);
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getCommonStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Golfinity Connect</h1>
          </div>
          <div class="content">
            <p class="badge badge-success">Special Update</p>
            <h2>${title}</h2>
            <p>Hello ${fullName},</p>
            <div>${content}</div>
            ${
              ctaText && ctaUrl
                ? `
              <div style="text-align: center;">
                <a href="${ctaUrl}" class="button">${ctaText}</a>
              </div>
            `
                : ''
            }
          </div>
          <div class="footer">
            <p>You're receiving this because you're a Golfinity Connect member.</p>
            <p><a href="${this.configService.get('FRONTEND_URL')}/settings" style="color: #64748b; text-decoration: underline;">Unsubscribe from marketing emails</a></p>
            &copy; ${new Date().getFullYear()} Golfinity Connect.
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, title, html);
  }

  async sendOrderConfirmationEmail(
    email: string,
    fullName: string,
    order: any,
  ) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getCommonStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Golfinity Connect</h1>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <span class="badge badge-success">Order Confirmed</span>
            </div>
            <h2 style="text-align: center; margin-top: 15px;">Order Received! 🍔</h2>
            <p>Hello ${fullName}, your order <strong>#${order.id.slice(-6).toUpperCase()}</strong> has been received and is being prepared.</p>
            
            <div class="divider"></div>
            
            <h3>Order Details</h3>
            ${order.items
              .map(
                (item: any) => `
              <div class="order-item">
                <span>${item.quantity}x ${item.menuItem.name}</span>
                <span>$${(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
              </div>
            `,
              )
              .join('')}
            
            <div class="order-total">
              <span style="font-weight: 400; font-size: 14px; color: #64748b;">Total Paid:</span>
              $${Number(order.totalPaid).toFixed(2)}
            </div>
            
            <div class="divider"></div>
            <p>We'll notify you once your order is on the way to your current location.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Golfinity Connect. Fresh food, delivered to the green.
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Your Golfinity Order Confirmation', html);
  }

  async sendWelcomeEmail(email: string, fullName: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getCommonStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Golfinity Connect</h1>
          </div>
          <div class="content">
            <h2>Welcome to the Green, ${fullName}! 🏌️‍♂️</h2>
            <p>We're thrilled to have you join our premium golf community. Golfinity Connect is designed to elevate your golfing experience, from tracking rounds to social leaderboards and effortless on-course ordering.</p>
            <p>Start your journey by exploring the latest courses or joining a tournament.</p>
            <div style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL')}" class="button">Go to Dashboard</a>
            </div>
            <div class="divider"></div>
            <p>If you have any questions, our support team is always here to help.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Golfinity Connect. All rights reserved.<br>
            Designed for golfers who demand the best.
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Welcome to Golfinity Connect!', html);
  }

  async sendVerificationEmail(email: string, fullName: string, token: string) {
    const verifyUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getCommonStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Golfinity Connect</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email 📧</h2>
            <p>Hello ${fullName},</p>
            <p>Welcome to Golfinity Connect! To ensure the security of your account and access all premium features, please verify your email address by clicking the button below.</p>
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="button">Verify Email Address</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">If you're having trouble with the button, you can also use this verification code in the app:</p>
            <div class="token-box">${token}</div>
            <div class="divider"></div>
            <p>Welcome aboard! We can't wait to see you on the course.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Golfinity Connect. All rights reserved.<br>
            Elevating your game, one round at a time.
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Verify your Golfinity Connect email', html);
  }

  async sendPasswordResetEmail(email: string, fullName: string, token: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>${this.getCommonStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Golfinity Connect</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>Hello ${fullName},</p>
            <p>We received a request to reset the password for your Golfinity Connect account. No worries, it happens to the best of us!</p>
            <p>Click the button below to set a new password. This link will expire in 1 hour.</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p style="margin-top: 30px; font-size: 14px; color: #666;">If you prefer, you can also copy and paste this token directly into the app:</p>
            <div class="token-box">${token}</div>
            <div class="divider"></div>
            <p style="font-size: 13px; color: #999;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Golfinity Connect. All rights reserved.<br>
            Secure, premium, and built for you.
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(email, 'Reset Your Golfinity Password', html);
  }

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const recipients = [new Recipient(to, to)];

      const emailParams = new EmailParams()
        .setFrom(this.sender)
        .setTo(recipients)
        .setReplyTo(this.sender)
        .setSubject(subject)
        .setHtml(html)
        .setText(subject); // Fallback text

      await this.mailersend.email.send(emailParams);
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack);
      // Don't throw error to avoid breaking the main flow, but log it
    }
  }
}
