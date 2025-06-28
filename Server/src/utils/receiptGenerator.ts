import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { RentInterface } from '../types/model-types/rent-types';
import { UserFromDB } from '../types/model-types/user-types';
import { TransactionInterface } from '../types/model-types/transaction-types';
import fontkit from '@pdf-lib/fontkit';
import { VehicleInterface } from '../types/model-types/vehicle-types';
import { CompanyInterface } from '../types/model-types/company-types';

async function generateReceiptPDF(
  rent: RentInterface,
  user: UserFromDB,
  transaction: TransactionInterface
): Promise<Buffer> {
  const templatePath = path.join(__dirname, '../../public/templates/burg-receipt-template.pdf');
  const templateBytes = fs.readFileSync(templatePath);

  const fontPath = path.join(__dirname, '../../public/fonts/Roboto-Regular.ttf'); // or NotoSans-Regular.ttf
  const fontBytes = fs.readFileSync(fontPath);

  const pdfDoc = await PDFDocument.load(templateBytes);

  pdfDoc.registerFontkit(fontkit);

  const font = await pdfDoc.embedFont(fontBytes);

  const pages = pdfDoc.getPages();

  const page1 = pages[0];
  const page2 = pages[1];

  const height1 = page1.getSize().height;
  const height2 = page2.getSize().height;

  function cmToPdfPointPage1(xCm: number, yCm: number, pageHeight = height1) {
      const x = xCm * 28.35;
      const y = pageHeight - (yCm * 28.35);
      return { x, y };
  }

  function cmToPdfPointPage2(xCm: number, yCm: number, pageHeight = height2) {
      const x = xCm * 28.35;
      const y = pageHeight - (yCm * 28.35);
      return { x, y };
  }

  const vehicle = rent.vehicle as VehicleInterface;

  const { x: transactionX, y: transactionY } = cmToPdfPointPage1(1.42, 12.80);
  const { x: dateX, y: dateY } = cmToPdfPointPage1(12, 12.80);
  
  const { x: fullNameX, y: fullNameY } = cmToPdfPointPage1(1.42, 13.84);
  const { x: userIdX, y: userIdY } = cmToPdfPointPage1(12, 13.84);
  const { x: phoneNumberX, y: phoneNumberY } = cmToPdfPointPage1(1.42, 15.82);
  
  const { x: agencyFullNameX, y: agencyFullNameY } = cmToPdfPointPage1(1.42, 18.89);
  const { x: agencyIdX, y: agencyIdY } = cmToPdfPointPage1(12, 18.89);
  const { x: agencyPhoneNumberX, y: agencyPhoneNumberY } = cmToPdfPointPage1(1.42, 20.88);  
  
  const { x: vehicleTypeX, y: vehicleTypeY } = cmToPdfPointPage1(1.77, 24.37);
  const { x: rentalDaysX, y: rentalDaysY } = cmToPdfPointPage1(7.43, 24.37);
  const { x: ratePerDayX, y: ratePerDayY } = cmToPdfPointPage1(13.09, 24.37);

  const { x: subtotalX, y: subtotalY } = cmToPdfPointPage1(1.77, 26.91);
  const { x: gstX, y: gstY } = cmToPdfPointPage1(7.43, 26.91);
  const { x: totalAmountX, y: totalAmountY } = cmToPdfPointPage1(13.09, 26.91);
  const { x: grandTotalAmountX, y: grandTotalAmountY } = cmToPdfPointPage2(13.75, 1.40);

  const { x: transactionIdX, y: transactionIdY } = cmToPdfPointPage2(4.39, 5.08);
  
  const { x: paymentCheckmarkX, y: paymentCheckmarkY } = cmToPdfPointPage2(1.55, 3.63);
  const { x: transactionCheckmarkX, y: transactionCheckmarkY } = cmToPdfPointPage2(1.55, 5.67);

  page1.drawText(transaction._id.toString(), { x: transactionX, y: transactionY, size: 12, font });
  page1.drawText(new Date().toDateString(), { x: dateX, y: dateY, size: 12, font });

  page1.drawText(user.fullName, { x: fullNameX, y: fullNameY, size: 12, font });
  page1.drawText(user._id.toString(), { x: userIdX, y: userIdY, size: 12, font });
  page1.drawText(user.phoneNumber || 'N/A', { x: phoneNumberX, y: phoneNumberY, size: 12, font });

  const company = vehicle.company as CompanyInterface;

  if (company) {
    page1.drawText(company.name, { x: agencyFullNameX, y: agencyFullNameY, size: 12, font });
    page1.drawText(company._id.toString(), { x: agencyIdX, y: agencyIdY, size: 12, font });
    page1.drawText(company.phoneNumber, { x: agencyPhoneNumberX, y: agencyPhoneNumberY, size: 12, font });

  }

  const days = Math.ceil((new Date(rent.end).getTime() - new Date(rent.start).getTime()) / (1000 * 60 * 60 * 24));

  page1.drawText(vehicle.details?.model || 'N/A', { x: vehicleTypeX, y: vehicleTypeY, size: 12, font });
  page1.drawText(days.toString(), { x: rentalDaysX, y: rentalDaysY, size: 12, font });
  page1.drawText(vehicle.details?.pricePerDay.toString() || '0', { x: ratePerDayX, y: ratePerDayY, size: 12, font });

  const subtotal = days * (vehicle.details?.pricePerDay || 0);
  const gst = subtotal * 0.18;
  const total = rent.total;

  page1.drawText(`₹${subtotal.toFixed(2)}`, { x: subtotalX, y: subtotalY, size: 12, font });
  page1.drawText(`₹${gst.toFixed(2)}`, { x: gstX, y: gstY, size: 12, font });
  page1.drawText(`₹${total.toFixed(2)}`, { x: totalAmountX, y: totalAmountY, size: 12, font });
  page2.drawText(`${total.toFixed(2)}`, { x: grandTotalAmountX, y: grandTotalAmountY, size: 12, font });

  page2.drawText(transaction._id.toString(), { x: transactionIdX, y: transactionIdY, size: 12, font });
  page2.drawText('✓', { x: paymentCheckmarkX, y: paymentCheckmarkY, size: 12, font });
  page2.drawText('✓', { x: transactionCheckmarkX, y: transactionCheckmarkY, size: 12, font });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}


export default generateReceiptPDF;
