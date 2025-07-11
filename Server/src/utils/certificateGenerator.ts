import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import { CertificateForPDF } from '../types/model-types/certificate-types';

const FRONT_END_URL = process.env.FRONT_END_PROD;

export async function generateCertificatePDF(data: CertificateForPDF): Promise<Buffer> {
  const templatePath = path.join(__dirname, '../../public/templates/burg-cert-generator-template.pdf');
  const templateBytes = fs.readFileSync(templatePath);

  const fontPath = path.join(__dirname, '../../public/fonts/Roboto-Regular.ttf');
  const fontBytes = fs.readFileSync(fontPath);

  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);

  const qrDataUrl = await QRCode.toDataURL(`${FRONT_END_URL}/certificate?code=${data.code}`);
  const qrImage = await pdfDoc.embedPng(qrDataUrl);

  const pages = pdfDoc.getPages();
  const page = pages[0];
  const height = page.getSize().height;

  function cmToPdfPoint(xCm: number, yCm: number) {
    const x = xCm * 28.35;
    const y = height - (yCm * 28.35);
    return { x, y };
  }

  const { x: nameX, y: nameY } = cmToPdfPoint(13, 8);       
  const { x: positionX, y: positionY } = cmToPdfPoint(13.5, 11); 
  const { x: dateX, y: dateY } = cmToPdfPoint(15, 12.1);
  const { x: codeX, y: codeY } = cmToPdfPoint(15.2, 12.6);
  const { x: qrX, y: qrY } = cmToPdfPoint(13, 16.7);   

  page.drawText(data.issuedTo, { x: nameX, y: nameY, size: 24, font, color: rgb(0, 0, 0) });
  page.drawText(data.position, { x: positionX, y: positionY, size: 18, font, color: rgb(0, 0, 0) });
  page.drawText(data.code, { x: codeX, y: codeY, size: 12, font });
  page.drawText(data.date, { x: dateX, y: dateY, size: 12, font });

  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: 100,
    height: 100
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
