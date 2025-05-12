import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { CertificateForPDF } from '../types/model-types/certificate-types';

const FRONT_END_URL = process.env.PROD === 'true' ? process.env.FRONT_END_PROD : process.env.FRONT_END_LOCAL;

export async function generateCertificatePDF(data: CertificateForPDF): Promise<Buffer> {

  const templatePath = path.join(__dirname, '../templates/burg-cert-generator-template.pdf');
  const templateBytes = fs.readFileSync(templatePath);
  
  const pdfDoc = await PDFDocument.load(templateBytes);
  
  pdfDoc.registerFontkit(fontkit);
  
  const fontBytes = fs.readFileSync(path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf'));

  const pages = pdfDoc.getPages();
  const page = pages[0];

  const customFont = await pdfDoc.embedFont(fontBytes);
  
  const qrDataUrl = await QRCode.toDataURL(`${FRONT_END_URL}/certificate?code=${data.code}`);
  const qrImage = await pdfDoc.embedPng(qrDataUrl);

  page.drawText(data.issuedTo, { x: 170, y: 425, size: 24, font: customFont, color: rgb(0, 0, 0) });
  page.drawText(data.position, { x: 170, y: 360, size: 18, font: customFont, color: rgb(0, 0, 0) });
  page.drawText(data.code, { x: 145, y: 150, size: 12, font: customFont });
  page.drawText(data.date, { x: 275, y: 150, size: 12, font: customFont });

  page.drawImage(qrImage, {
    x: 370,
    y: 230,
    width: 100,
    height: 100
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
