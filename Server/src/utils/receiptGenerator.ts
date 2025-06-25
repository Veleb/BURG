import PDFDocument from "pdfkit";
import { RentInterface } from "../types/model-types/rent-types";
import { UserFromDB } from "../types/model-types/user-types";
import { VehicleInterface } from "../types/model-types/vehicle-types";
import { TransactionInterface } from "../types/model-types/transaction-types";

async function generateReceiptPDF(
  rent: RentInterface,
  user: UserFromDB,
  transaction: TransactionInterface
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.fontSize(20).text("Vehicle Rental Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Receipt #: ${transaction._id}`);
    doc.text(`Date: ${new Date()}`);
    doc.text(`Order ID: ${rent.orderId}`);
    doc.moveDown();

    doc.text(`Renter: ${user.fullName}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Phone: ${user.phoneNumber || "N/A"}`);
    doc.moveDown();

    const vehicle = rent.vehicle as VehicleInterface;

    doc.text(
      `Vehicle: ${vehicle.details?.name} ${vehicle.details?.model} (${vehicle.details?.year})`
    );
    doc.text(
      `License Plate: ${vehicle.details?.identificationNumber || "N/A"}`
    );
    doc.moveDown();

    doc.text(`Rental Start: ${new Date(rent.start)}`);
    doc.text(`Rental End: ${new Date(rent.end)}`);
    doc.text(
      `Duration: ${Math.ceil(
        (rent.end.getTime() - rent.start.getTime()) / (1000 * 60 * 60 * 24)
      )} days`
    );
    doc.moveDown();

    doc.text(`Total Paid: ₹${rent.total.toFixed(2)}`);
    doc.text(`Payment Status: ${transaction.status}`);
    doc.moveDown();

    doc.text("Thank you for renting with us!", { align: "center" });

    doc.end();
  });
}

export default generateReceiptPDF;
