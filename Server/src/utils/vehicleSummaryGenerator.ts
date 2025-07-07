import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { VehicleInterface } from '../types/model-types/vehicle-types';
import { CompanyInterface } from '../types/model-types/company-types';

async function generateVehicleSummaryPDF(vehicle: VehicleInterface): Promise<Buffer> {
  const templatePath = path.join(__dirname, '../../public/templates/vehicle-summary-template.pdf');
  const templateBytes = fs.readFileSync(templatePath);

  const fontPath = path.join(__dirname, '../../public/fonts/Roboto-Regular.ttf');
  const fontBytes = fs.readFileSync(fontPath);

  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);

  const font = await pdfDoc.embedFont(fontBytes);
  const page = pdfDoc.getPage(0);
  const pageHeight = page.getHeight();

  const cm = (n: number) => n * 28.35;
  const y = (cmY: number) => pageHeight - cm(cmY);

  const drawText = (text: string, xCm: number, yCm: number, size = 12) => {
    page.drawText(text || '', {
      x: cm(xCm),
      y: y(yCm),
      size,
      font,
    });
  };

  const company = vehicle.company as CompanyInterface;

  const yOffset = 1.7;
  drawText(vehicle._id?.toString() ?? '-', 9.2, 3 + yOffset);
  drawText(company?.name ?? '-', 9.2, 4 + yOffset);
  drawText(vehicle.details?.name, 9.2, 5 + yOffset);
  drawText(vehicle.details?.model, 9.2, 6 + yOffset);
  drawText(vehicle.details?.year?.toString(), 9.2, 7 + yOffset);
  drawText(vehicle.details?.engine, 9.2, 8 + yOffset);
  drawText(vehicle.details?.power, 9.2, 9 + yOffset);
  drawText(vehicle.details?.identificationNumber, 9.2, 10 + yOffset);
  drawText(vehicle.details?.gvw?.toString(), 9.2, 11 + yOffset);
  drawText(vehicle.details?.fuelTank?.toString(), 9.2, 12 + yOffset);
  drawText(vehicle.details?.tires?.toString(), 9.2, 13 + yOffset);
  drawText(vehicle.details?.mileage?.toString(), 9.2, 14 + yOffset);
  drawText(vehicle.details?.chassisType, 9.2, 15 + yOffset);
  drawText(vehicle.details?.capacity?.toString(), 9.2, 16 + yOffset);
  drawText(vehicle.details?.size.toString(), 9.2, 17 + yOffset);
  drawText(vehicle.details?.category.toString(), 9.2, 18 + yOffset);
  drawText(vehicle.details?.pricePerDay?.toString(), 9.2, 19 + yOffset);
  drawText(vehicle.details?.pricePerKm?.toString(), 9.2, 20 + yOffset);
  drawText(vehicle.details?.isPromoted ? 'Yes' : 'No', 9.2, 21 + yOffset);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export default generateVehicleSummaryPDF;
