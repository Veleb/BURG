import nodemailer from 'nodemailer';

async function sendReceiptEmail(toUserEmail: string, toCompanyEmail: string, pdfBuffer: Buffer) {
  const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',      
  port: 465,                   
  secure: true,               
  auth: {
    user: process.env.SMTP_USER,  
    pass: process.env.SMTP_PASS, 
  },
});

  await transporter.sendMail({
    from: '"BURG" <no-reply@burgrental.com>',
    to: toUserEmail,
    subject: 'Your Vehicle Rental Receipt',
    text: 'Thank you for your rental! Please find your receipt attached.',
    attachments: [
      {
        filename: 'receipt.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });

  await transporter.sendMail({
    from: '"BURG" <no-reply@burgrental.com>',
    to: toCompanyEmail,
    subject: 'New Rental Receipt Issued',
    text: 'A new vehicle rental receipt has been issued. Please find the receipt attached.',
    attachments: [
      {
        filename: 'receipt.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}

export default sendReceiptEmail;