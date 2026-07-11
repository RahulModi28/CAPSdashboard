import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendRealEmail() {
  try {
    console.log('1. Reading HTML template...');
    const templatePath = path.join(__dirname, 'src', 'templates', 'NewRecruitmentEmail.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

    console.log('2. Dynamically replacing placeholders...');
    // Real data for the user rmodi182@gmail.com
    const volunteer = {
      name: 'Rahul Modi',
      email: 'rmodi182@gmail.com',
      partner_name: 'John Doe'
    };

    htmlTemplate = htmlTemplate
      .replace('[Name]', volunteer.name)
      .replace('[name of the room mate]', volunteer.partner_name);

    console.log(`3. Setting up Gmail SMTP for ${process.env.SMTP_EMAIL}...`);
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    console.log(`4. Sending email to ${volunteer.email}...`);
    let info = await transporter.sendMail({
      from: `"CAPS Team" <${process.env.SMTP_EMAIL}>`, // sender address
      to: volunteer.email, // list of receivers
      subject: "Your CAPS Roommate Details", // Subject line
      html: htmlTemplate, // html body
    });

    console.log("-----------------------------------------");
    console.log("✅ Message successfully sent to: %s", volunteer.email);
    console.log("Message ID: %s", info.messageId);
    console.log("-----------------------------------------");
    console.log("Check your rmodi182@gmail.com inbox (and spam folder)!");
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error(error);
  }
}

sendRealEmail();
