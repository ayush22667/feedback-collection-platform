const nodemailer = require('nodemailer');

// In-memory OTP storage (in production, use Redis)
const otpStorage = new Map();

// Create transporter
const createTransporter = () => {
  console.log('Creating email transporter...');
  console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'not configured');
  
  if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('Setting up Gmail transporter');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else if (process.env.SMTP_HOST) {
    console.log('Setting up SMTP transporter');
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // For development - use ethereal email
    console.log('No email configuration found, using console logging for OTP');
    return null;
  }
};

const transporter = createTransporter();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
const sendOTP = async (email, businessName = '') => {
  try {
    const otp = generateOTP();
    const expirationTime = Date.now() + (10 * 60 * 1000); // 10 minutes
    
    // Store OTP
    otpStorage.set(email, {
      otp,
      expiresAt: expirationTime,
      attempts: 0
    });

    const subject = 'Email Verification - Your OTP Code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Hello${businessName ? ` ${businessName}` : ''},</p>
        <p>Thank you for registering with our feedback collection platform. To complete your registration, please use the following OTP code:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        
        <p><strong>This OTP will expire in 10 minutes.</strong></p>
        <p>If you didn't request this verification, please ignore this email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;

    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html
      };

      await transporter.sendMail(mailOptions);
      console.log(`OTP sent to ${email}: ${otp}`);
    } else {
      // For development - log to console
      console.log(`\n=== OTP EMAIL ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`OTP: ${otp}`);
      console.log(`Expires: ${new Date(expirationTime).toLocaleString()}`);
      console.log(`================\n`);
    }

    return {
      success: true,
      expirationDate: new Date(expirationTime).toISOString()
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Verify OTP
const verifyOTP = (email, otp) => {
  const storedData = otpStorage.get(email);
  
  if (!storedData) {
    return {
      valid: false,
      error: 'OTP not found or expired'
    };
  }

  // Check if OTP is expired
  if (Date.now() > storedData.expiresAt) {
    otpStorage.delete(email);
    return {
      valid: false,
      error: 'OTP has expired'
    };
  }

  // Check attempts
  if (storedData.attempts >= 3) {
    otpStorage.delete(email);
    return {
      valid: false,
      error: 'Too many failed attempts'
    };
  }

  // Verify OTP
  if (storedData.otp !== otp) {
    storedData.attempts++;
    return {
      valid: false,
      error: 'Invalid OTP'
    };
  }

  // OTP is valid, remove from storage
  otpStorage.delete(email);
  return {
    valid: true
  };
};

// Send welcome email
const sendWelcomeEmail = async (email, businessName) => {
  try {
    const subject = 'Welcome to Feedback Collection Platform!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Feedback Collection Platform!</h2>
        <p>Hello ${businessName},</p>
        <p>Congratulations! Your account has been successfully created and verified.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="color: #007bff; margin-top: 0;">What's Next?</h3>
          <ul style="color: #333;">
            <li>Create your first feedback form</li>
            <li>Customize your form fields and design</li>
            <li>Share your form with customers</li>
            <li>Analyze responses and insights</li>
          </ul>
        </div>
        
        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
        <p>Thank you for choosing our platform!</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message, please do not reply to this email.
        </p>
      </div>
    `;

    if (transporter) {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject,
        html
      };

      await transporter.sendMail(mailOptions);
      console.log(`Welcome email sent to ${email}`);
    } else {
      console.log(`\n=== WELCOME EMAIL ===`);
      console.log(`To: ${email}`);
      console.log(`Subject: ${subject}`);
      console.log(`Business: ${businessName}`);
      console.log(`====================\n`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email failure
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  sendWelcomeEmail
};
