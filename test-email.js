import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function sendTestEmail() {
  console.log('1. Reading HTML template...');
  const templatePath = path.join(__dirname, 'src', 'templates', 'NewRecruitmentEmail.html');
  let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');

  console.log('2. Dynamically replacing placeholders...');
  // Simulating data from the database
  const volunteer = {
    name: 'Rahul Modi',
    email: 'rmodi182@gmail.com',
    partner_name: 'John Doe'
  };

  htmlTemplate = htmlTemplate
    .replace('[Name]', volunteer.name)
    .replace('[name of the room mate]', volunteer.partner_name);

  console.log('3. Setting up Ethereal Email (Fake SMTP for testing)...');
  // Generate test SMTP service account from ethereal.email
  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  console.log(`4. Sending email to ${volunteer.email}...`);
  let info = await transporter.sendMail({
    from: '"CAPS Automation" <noreply@caps.edu>', // sender address
    to: volunteer.email, // list of receivers
    subject: "Your CAPS Roommate Details", // Subject line
    html: htmlTemplate, // html body
  });

  console.log("-----------------------------------------");
  console.log("✅ Message sent: %s", info.messageId);
  console.log("🔗 Preview URL: %s", nodemailer.getTestMessageUrl(info));
  console.log("-----------------------------------------");
  console.log("Click the Preview URL above to see exactly how the email looks in a browser!");
}

sendTestEmail().catch(console.error);
