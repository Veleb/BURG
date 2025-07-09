import mongoose, { Types } from "mongoose";
import CompanyModel from "../models/company";
import RentModel from "../models/rent";
import UserModel from "../models/user";
import VehicleModel from "../models/vehicle";
import { CompanyInterface } from "../types/model-types/company-types";
import { RentForCreate, RentInterface } from "../types/model-types/rent-types";
import UserService from "./userService";
import TransactionModel from "../models/transactions";
import { VehicleInterface } from "../types/model-types/vehicle-types";
import { UserFromDB } from "../types/model-types/user-types";
import generateReceiptPDF from "../utils/receiptGenerator";
import sendReceiptEmail from "../utils/sendReceiptEmail";
import { uploadReceiptPdf } from "../utils/uploadFilesToCloudinary";

const adminCompanyId = new mongoose.Types.ObjectId(process.env.ADMIN_COMPANY_ID);

async function getAllRents(limit: number, offset: number): Promise<RentInterface[]> {
  try {
    const rents = await RentModel.find()
      .skip(offset)
      .limit(limit)
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate({
        path: 'vehicle',
        populate: {
          path: 'company',
          model: 'Company'
        }
      })
      .lean();

    return rents;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error fetching paginated rents');
  }
}

async function getTotalRentCount(): Promise<number> {
  try {
    return await RentModel.countDocuments();
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error counting rents');
  }
}

// async function getTotalCompanyRentCount(companyId: Types.ObjectId): Promise<number> {
//   try {
//     const company = await CompanyModel.findById(companyId).select('carsAvailable');

//     if (!company || !company.carsAvailable || company.carsAvailable.length === 0) {
//       return 0;
//     }

//     return await RentModel.countDocuments({
//       vehicle: { $in: company.carsAvailable },
//     });
//   } catch (error) {
//     throw new Error(error instanceof Error ? error.message : 'Error counting rents');
//   }
// }


async function createRent(rentData: RentForCreate): Promise<RentInterface> {
  try {
    const rent = await RentModel.create(rentData);

    await Promise.all([
      rent.user && UserModel.findByIdAndUpdate(rent.user, { $push: { rents: rent._id } }, { new: true }),
      rent.vehicle && VehicleModel.findByIdAndUpdate(rent.vehicle, { $push: { reserved: rent._id } }, { new: true })
    ]);

    const vehicle = await VehicleModel.findById(rent.vehicle).populate("company");

    if (vehicle?.company) {
      await CompanyModel.findByIdAndUpdate(
        (vehicle.company as CompanyInterface)._id,
        { $inc: { totalEarnings: (rent?.total ?? 0) * 0.90 } },
        { new: true }
      );
    }

    if (!adminCompanyId) {
      throw new Error("Admin company ID is not set in environment variables.");
    }

    await CompanyModel.findByIdAndUpdate(
      adminCompanyId,
      { $inc: { totalEarnings: rent.total * 0.10 } },
      { new: true }
    );

    return rent.toObject();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : `Error creating a rent`);
  }
}

// async function createRent(rentData: RentForCreate): Promise<RentInterface> {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const rent = await RentModel.create([rentData], { session });

//     await Promise.all([
//       rent[0].user && UserModel.findByIdAndUpdate(rent[0].user, { $push: { rents: rent[0]._id } }, { new: true, session }),
//       rent[0].vehicle && VehicleModel.findByIdAndUpdate(rent[0].vehicle, { $push: { reserved: rent[0]._id } }, { new: true, session })
//     ]);

//     const vehicle = await VehicleModel.findById(rent[0].vehicle).populate("company").session(session);

//     if (vehicle?.company) {
//       await CompanyModel.findByIdAndUpdate(
//         (vehicle.company as CompanyInterface)._id,
//         { $inc: { totalEarnings: (rent[0]?.total ?? 0) * 0.90 } },
//         { new: true, session }
//       );
//     }

//     if (!adminCompanyId) throw new Error("Admin company ID is not set.");

//     await CompanyModel.findByIdAndUpdate(
//       adminCompanyId,
//       { $inc: { totalEarnings: rent[0].total * 0.10 } },
//       { new: true, session }
//     );

//     await session.commitTransaction();
//     session.endSession();

//     return rent[0].toObject();
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();
//     throw new Error(err instanceof Error ? err.message : `Error creating rent`);
//   }
// }

async function getRentsByCompany(companyId: Types.ObjectId, limit: number, offset: number) {
  // Step 1: Find all vehicle IDs that belong to the company
  const vehicles = await VehicleModel.find({ company: companyId }).select('_id');
  const vehicleIds = vehicles.map(v => v._id);

  if (vehicleIds.length === 0) return []; // No vehicles = no rents

  // Step 2: Find rents for those vehicles
  const rents = await RentModel.find({ vehicle: { $in: vehicleIds } })
    .skip(offset)
    .limit(limit)
    .sort({ start: -1 })
    .populate({
      path: 'user',
      select: '-password'
    })
    .populate({
      path: 'vehicle',
      populate: {
        path: 'company',
        model: 'Company'
      }
    });

  return rents;
}

async function getTotalCompanyRentCount(companyId: Types.ObjectId) {
  const vehicles = await VehicleModel.find({ company: companyId }).select('_id');
  const vehicleIds = vehicles.map(v => v._id);

  if (vehicleIds.length === 0) return 0;

  return RentModel.countDocuments({ vehicle: { $in: vehicleIds } });
}

async function getRentById(rentId: Types.ObjectId): Promise<RentInterface | null> {
  try {
    const rent = await RentModel.findById(rentId)
      .populate({
        path: 'user',
        select: '-password',
      })
      .populate('vehicle')
      .lean(); 

    if (!rent) {
      throw new Error('Rent not found');
    }

    return rent as RentInterface; 
  } catch (error) {
    throw new Error(`Error fetching rent.`);
  }
}

async function getUnavailableDates(vehicleId: Types.ObjectId): Promise<RentInterface[]> {
  try {
    const reservations: RentInterface[] = await RentModel.find({
      vehicle: vehicleId,
      status: { $ne: "canceled" },
    }).lean();

    return reservations;
  } catch (err) {
    throw new Error(`Error fetching unavailable dates for vehicle: ${err}`);
  }
}

async function changeRentStatus(rentId: Types.ObjectId, status: string) {

  try {
    
    const rent = await RentModel.findByIdAndUpdate(
      rentId,
      { $set: { status: status } },
      { new: true }
    )
    .populate('vehicle')
    .populate({
      path: 'vehicle',
      populate: { path: 'company' }
    })
    .lean()

    if (!rent) {
      throw new Error("Rent not found.");
    }

    if (status === 'canceled' && rent.vehicle?.company) {

      await TransactionModel.findOneAndUpdate(
        { merchantId: rent.orderId },
        { $set: { status: 'canceled' } }
      );

      await CompanyModel.findByIdAndUpdate(
        (rent.vehicle.company as CompanyInterface)._id,
        { $inc: { totalEarnings: -(rent?.total ?? 0) * 0.90 } },
        { new: true }
      )
      
      await CompanyModel.findByIdAndUpdate(
        process.env.ADMIN_COMPANY_ID,
        { $inc: { totalEarnings: -(rent?.total ?? 0) * 0.10 } },
        { new: true }
      )
    }

    return rent;

  } catch (err) {
    console.error(`Error confirming a rent! ${err}`)
    throw new Error(`Error confirming a rent!`);
  }

}

async function rentWithoutPaying(rentData: RentForCreate): Promise<RentInterface> {
  try {
    const rent = await RentModel.create(rentData);

    await Promise.all([
      rent.user && UserModel.findByIdAndUpdate(rent.user, { $push: { rents: rent._id } }, { new: true }),
      rent.vehicle && VehicleModel.findByIdAndUpdate(rent.vehicle, { $push: { reserved: rent._id } }, { new: true })
    ]);

    if (!adminCompanyId) {
      throw new Error("Admin company ID is not set in environment variables.");
    }

    await CompanyModel.findByIdAndUpdate(
      adminCompanyId,
      { $inc: { totalEarnings: -rent.total } },
      { new: true }
    );

    return rent.toObject();
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Error creating rent without paying");
  }
}

export async function handleSuccessfulPayment(orderId: string): Promise<{ success: boolean; transactionId: Types.ObjectId; rent: RentInterface }> {
  try {
    const rent = await RentModel.findOne({ orderId })
      .populate('user')
      .populate({
        path: 'vehicle',
        populate: { path: 'company', model: 'Company' }
      });

    if (!rent) throw new Error("Rent not found");
    if (!rent.vehicle) throw new Error("Vehicle not populated");
    if (!rent.user) throw new Error("User not populated");
    if (!rent.vehicle.company) throw new Error("Company not populated on vehicle");


    const vehicle: VehicleInterface = rent.vehicle;
    const user: UserFromDB = rent.user;
    const company: CompanyInterface = vehicle.company as CompanyInterface;

    const { rental: updatedRent, updatedUser } = await UserService.updateDataAfterPayment(
      user._id,
      rent,
      rent.referralCode || '',
    );

    const transaction = await TransactionModel.create({
      user: user._id,
      rent: updatedRent._id,
      total: updatedRent.total,
      company: company._id,
      status: "success",
      merchantOrderId: rent.orderId,
    });

    await CompanyModel.findByIdAndUpdate(company._id, {
      $inc: { earnings: updatedRent.total },
      transactions: transaction._id,
    });

    await CompanyModel.findByIdAndUpdate(
      adminCompanyId, {
      $inc: { earnings: updatedRent.total },
      transactions: transaction._id,
    });

    const pdfBuffer = await generateReceiptPDF(updatedRent, updatedUser, transaction);

    const pdfFile: Express.Multer.File = {
      buffer: pdfBuffer,
      mimetype: 'application/pdf',
      fieldname: 'receiptPdf',
      originalname: 'receipt.pdf',
      encoding: '7bit',
      size: pdfBuffer.length,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    const uploadedResult = await uploadReceiptPdf(pdfFile, 'rents/receipts');

    await RentModel.findByIdAndUpdate(
      updatedRent._id,
      {
        receiptUrl: uploadedResult.secureUrl,
      },
      { new: true }
    );

    await sendReceiptEmail(updatedUser.email, company.email, pdfBuffer);

    return {
      success: true,
      transactionId: transaction._id,
      rent: updatedRent,
    };

  } catch (error) {
    console.error("handleSuccessfulPayment error:", error);
    throw new Error("Failed to handle successful payment");
  }
}

export async function handleFailedPayment(orderId: string): Promise<{ success: boolean; transactionId: Types.ObjectId; rent: RentInterface }> {
  try {
    const rent = await RentModel.findOne({ orderId })
    .populate("vehicle")
    .populate("user")
    .populate({
      path: 'vehicle',
      populate: { path: 'company' }
    });

    if (!rent) throw new Error("Rent not found");

    const vehicle: VehicleInterface = rent.vehicle;
    const user: UserFromDB = rent.user;
    const company: CompanyInterface = vehicle.company as CompanyInterface;

    const { rental: updatedRent, updatedUser } = await UserService.updateDataAfterFailedPayment(
      user._id,
      rent,
    );

    const transaction = await TransactionModel.create({
      user: user._id,
      rent: updatedRent._id,
      total: updatedRent.total,
      company: company._id,
      status: "failed",
      merchantOrderId: rent.orderId,
    });

    return {
      success: false,
      transactionId: transaction._id,
      rent: updatedRent,
    };

  } catch (error) {
    console.error("handleSuccessfulPayment error:", error);
    throw new Error("Failed to handle successful payment");
  }
}

export async function handlePendingPayment(orderId: string): Promise<{ success: boolean; transactionId: Types.ObjectId; rent: RentInterface }> {
  try {
    const rent = await RentModel.findOne({ orderId })
    .populate("vehicle")
    .populate("user")
    .populate({
      path: 'vehicle',
      populate: { path: 'company' }
    });

    if (!rent) throw new Error("Rent not found");

    const vehicle: VehicleInterface = rent.vehicle;
    const user: UserFromDB = rent.user;
    const company: CompanyInterface = vehicle.company as CompanyInterface;

    const transaction = await TransactionModel.create({
      user: user._id,
      rent: rent._id,
      total: rent.total,
      company: company._id,
      status: "pending",
      merchantOrderId: rent.orderId,
    });

    return {
      success: false,
      transactionId: transaction._id,
      rent,
    };

  } catch (error) {
    console.error("handleSuccessfulPayment error:", error);
    throw new Error("Failed to handle successful payment");
  }
}
async function getAllReceipts() {
  try {
    const rents = await RentModel.find({ receiptUrl: { $exists: true, $ne: null } })
      .populate("vehicle")
      .lean();

    const receipts = rents.map(rent => rent.receiptUrl);

    return { receipts, rents };
  } catch (err) {
    throw new Error("Error fetching receipts");
  }
}

async function getAllUserReceipts(userId: Types.ObjectId) {
  try {
    const rents = await RentModel.find({ user: userId, receiptUrl: { $exists: true, $ne: null } })
      .populate("vehicle")
      .lean();

    const receipts = rents.map(rent => rent.receiptUrl);

    return { receipts, rents };
  } catch (err) {
    throw new Error("Error fetching user receipts");
  }
}

const rentService = {
  getAllRents,
  createRent,
  getRentById,
  getRentsByCompany,
  getUnavailableDates,
  changeRentStatus,
  rentWithoutPaying,
  getTotalRentCount,
  getTotalCompanyRentCount,
  handleSuccessfulPayment,
  handleFailedPayment,
  handlePendingPayment,
  getAllUserReceipts,
  getAllReceipts
}

export default rentService;