import { Invitation, Organization } from '../organizationTypes';

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || '';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@yourapp.com';
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  async sendInvitationEmail(
    invitation: Invitation,
    organization: Organization
  ): Promise<boolean> {
    const inviteLink = `${this.baseUrl}/invite/${invitation.token}`;
    
    const emailData = {
      to: invitation.email,
      from: this.fromEmail,
      subject: `دعوت به ${organization.name}`,
      html: this.getInvitationEmailTemplate(invitation, organization, inviteLink),
      text: this.getInvitationEmailText(invitation, organization, inviteLink),
    };

    // روش 1: استفاده از SendGrid
    if (process.env.SENDGRID_API_KEY) {
      return this.sendViaSendGrid(emailData);
    }
    
    // روش 2: استفاده از Resend
    if (process.env.RESEND_API_KEY) {
      return this.sendViaResend(emailData);
    }
    
    // روش 3: استفاده از NodeMailer (SMTP)
    if (process.env.SMTP_HOST) {
      return this.sendViaSMTP(emailData);
    }

    // برای development: فقط لاگ می‌کنیم
    console.log('📧 Email would be sent:', emailData);
    console.log('🔗 Invitation link:', inviteLink);
    return true;
  }

  private async sendViaSendGrid(emailData: any): Promise<boolean> {
    try {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      await sgMail.send(emailData);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }

  private async sendViaResend(emailData: any): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Resend error:', error);
      return false;
    }
  }

  private async sendViaSMTP(emailData: any): Promise<boolean> {
    try {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      });
      
      return true;
    } catch (error) {
      console.error('SMTP error:', error);
      return false;
    }
  }

  private getInvitationEmailTemplate(
    invitation: Invitation,
    organization: Organization,
    inviteLink: string
  ): string {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      line-height: 1.6;
      color: #374151;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      opacity: 0.9;
    }
    .info-box {
      background-color: #f9fafb;
      border-right: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .link {
      color: #667eea;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 دعوت به ${organization.name}</h1>
    </div>
    
    <div class="content">
      <p>سلام،</p>
      
      <p>شما به <strong>${organization.name}</strong> دعوت شده‌اید!</p>
      
      <div class="info-box">
        <p style="margin: 0;"><strong>نوع سازمان:</strong> ${this.getOrganizationTypeLabel(organization.type)}</p>
      </div>
      
      <p>با پذیرفتن این دعوت، می‌توانید:</p>
      <ul>
        <li>پیچ‌های خود را ارسال کنید</li>
        <li>تحلیل‌های جامع دریافت کنید</li>
        <li>از امکانات سازمان استفاده کنید</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="${inviteLink}" class="button">
          پذیرش دعوت‌نامه
        </a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        یا این لینک را در مرورگر خود کپی کنید:<br>
        <a href="${inviteLink}" class="link">${inviteLink}</a>
      </p>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        ⏰ این دعوت‌نامه تا ${new Date(invitation.expiresAt).toLocaleDateString('fa-IR')} معتبر است.
      </p>
    </div>
    
    <div class="footer">
      <p>این ایمیل به صورت خودکار ارسال شده است.</p>
      <p>اگر این دعوت‌نامه را انتظار نداشتید، می‌توانید آن را نادیده بگیرید.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  private getInvitationEmailText(
    invitation: Invitation,
    organization: Organization,
    inviteLink: string
  ): string {
    return `
دعوت به ${organization.name}

سلام،

شما به ${organization.name} دعوت شده‌اید!

نوع سازمان: ${this.getOrganizationTypeLabel(organization.type)}

برای پذیرش دعوت، روی لینک زیر کلیک کنید:
${inviteLink}

این دعوت‌نامه تا ${new Date(invitation.expiresAt).toLocaleDateString('fa-IR')} معتبر است.

اگر این دعوت‌نامه را انتظار نداشتید، می‌توانید آن را نادیده بگیرید.
    `;
  }

  private getOrganizationTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'science_park': 'پارک علم و فناوری',
      'accelerator': 'شتابدهنده',
      'bootcamp': 'بوت‌کمپ',
      'innovation_center': 'مرکز نوآوری',
    };
    return labels[type] || type;
  }
}

export const emailService = new EmailService();
