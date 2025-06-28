import { Types } from "mongoose";
import CompanyModel from "../models/company";
import RentModel from "../models/rent";
import UserModel from "../models/user";
import VehicleModel from "../models/vehicle";
import type {
  VehicleForCreate,
  VehicleInterface,
} from "../types/model-types/vehicle-types";
import { uploadFilesToCloudinary, uploadSummaryPdf } from "../utils/uploadFilesToCloudinary";

async function getVehicles(
  options: {
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ vehicles: VehicleInterface[] }> {
  const { limit = 20, offset = 0 } = options;

  let vehicles = await VehicleModel.find().skip(offset).limit(limit).lean();

  const updates = await Promise.all(
    vehicles.map(async (vehicle) => {
      const available = await checkAvailabilityToday(vehicle._id);
      vehicle.available = available;

      return {
        updateOne: {
          filter: { _id: vehicle._id },
          update: { $set: { available } },
        },
      };
    })
  );

  await VehicleModel.bulkWrite(updates);

  return { vehicles };
}


async function getVehicleBySlug(slug: string): Promise<VehicleInterface> {
  const vehicle = await VehicleModel.findOne({ "details.slug": slug })
  .populate("company")
    .populate("likes")
    .lean();

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }
  
  return vehicle
};

async function getCount(): Promise<number> {
  const totalCount = await VehicleModel.countDocuments();

  if (!totalCount) {
    throw new Error("Error occurred while getting total count of vehicles.");
  }

  return totalCount;
}

async function createVehicle(
  vehicleData: VehicleForCreate
): Promise<VehicleInterface> {
  const { images, vehicleRegistration, summaryPdf } = vehicleData.details;

  if (images && images.length > 0) {
    const uploadedImages = await uploadFilesToCloudinary(
      images as Express.Multer.File[],
      "vehicles/images"
    );
    vehicleData.details.images = uploadedImages.map((img) => img.secureUrl);
  }

  if (vehicleRegistration && vehicleRegistration.length > 0) {
    const uploadedRegistrations = await uploadFilesToCloudinary(
      vehicleRegistration as Express.Multer.File[],
      "vehicles/registrations"
    );
    vehicleData.details.vehicleRegistration = uploadedRegistrations.map(
      (reg) => reg.secureUrl
    );
  }

  if (
    summaryPdf &&
    typeof summaryPdf !== "string"
  ) {
    const uploadedSummary = await uploadSummaryPdf(
      summaryPdf as Express.Multer.File,
      "vehicles/summaries"
    );
    vehicleData.details.summaryPdf = uploadedSummary.secureUrl;
  }

  const newVehicle = await VehicleModel.create(vehicleData);

  await CompanyModel.findByIdAndUpdate(
    vehicleData.company,
    { $addToSet: { carsAvailable: newVehicle._id } },
    { new: true }
  );

  return newVehicle;
}

async function createBulk(
  vehiclesData: VehicleForCreate[]
): Promise<VehicleInterface[]> {
  const processedVehiclesData = await Promise.all(
    vehiclesData.map(async (vehicle) => {
      if (
        vehicle.details.images?.length &&
        typeof vehicle.details.images[0] !== "string"
      ) {
        const uploadedImages = await uploadFilesToCloudinary(
          vehicle.details.images as Express.Multer.File[],
          "vehicles/images"
        );
        vehicle.details.images = uploadedImages.map((img) => img.secureUrl);
      }
      return vehicle;
    })
  );

  const createdVehicles = await VehicleModel.insertMany(processedVehiclesData, {
    ordered: false,
  });

  const companyUpdates: { [key: string]: Types.ObjectId[] } = {};

  for (const vehicle of createdVehicles) {
    const companyId = vehicle.company._id.toString();

    if (!companyUpdates[companyId]) {
      companyUpdates[companyId] = [];
    }
    companyUpdates[companyId].push(vehicle._id);
  }

  await Promise.all(
    Object.entries(companyUpdates).map(([companyId, vehicleIds]) =>
      CompanyModel.findByIdAndUpdate(companyId, {
        $addToSet: { carsAvailable: { $each: vehicleIds } },
      })
    )
  );

  return createdVehicles;
}

const updateVehicle = async (
  vehicleId: Types.ObjectId,
  data: VehicleForCreate
) => {
  try {
    const vehicle = await VehicleModel.findByIdAndUpdate(vehicleId, data);

    if (!vehicle) {
      throw new Error(`Error occurred while updating vehicle`);
    }

    return vehicle;
  } catch (err) {
    throw new Error("Error updating vehicle");
  }
};

async function getCompanyVehicles(
  companyId: string
): Promise<VehicleInterface[]> {
  const company = await CompanyModel.findById(companyId)
    .populate("carsAvailable")
    .lean();

  if (!company || !Array.isArray(company.carsAvailable)) {
    throw new Error("No vehicles found for this company.");
  }

  return company.carsAvailable;
}

async function getVehicleById(vehicleId: string): Promise<VehicleInterface> {
  const vehicle = await VehicleModel.findById(vehicleId)
    .populate("company")
    .populate("likes")
    .lean();

  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  return vehicle;
}

async function checkAvailability(
  vehicleId: Types.ObjectId,
  startDate: Date,
  endDate: Date
): Promise<boolean> {
  const utcStart = new Date(startDate.toISOString());
  const utcEnd = new Date(endDate.toISOString());

  if (utcStart >= utcEnd) return false;

  const conflict = await RentModel.findOne({
    vehicle: vehicleId,
    status: { $in: ["confirmed", "pending", "active"] },
    $nor: [{ end: { $lte: utcStart } }, { start: { $gte: utcEnd } }],
  }).lean();

  return !conflict;
}

async function checkAvailabilityToday(vehicleId: Types.ObjectId): Promise<boolean> {
  const now = new Date();

  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrowUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

  const existingReservation = await RentModel.findOne({
    vehicle: vehicleId,
    status: { $in: ["confirmed", "pending", "active"] },
    start: { $lt: tomorrowUTC },
    end: { $gt: todayUTC },
  });



  const isAvailable = !existingReservation;

  await VehicleModel.findByIdAndUpdate(
    vehicleId,
    { $set: { available: isAvailable } },
    { new: true }
  );

  return isAvailable;
}

async function likeVehicle(vehicleId: string, userId: Types.ObjectId) {
  const updatedVehicle = await VehicleModel.findByIdAndUpdate(
    vehicleId,
    { $addToSet: { likes: userId } },
    { new: true, select: "likes" }
  );

  await UserModel.findByIdAndUpdate(
    userId,
    { $addToSet: { likes: vehicleId } },
    { new: true }
  );

  return updatedVehicle;
}

async function removeLikeVehicle(vehicleId: string, userId: Types.ObjectId) {
  const updatedVehicle = await VehicleModel.findByIdAndUpdate(
    vehicleId,
    { $pull: { likes: userId } },
    { new: true, select: "likes" }
  );

  await UserModel.findByIdAndUpdate(
    userId,
    { $pull: { likes: vehicleId } },
    { new: true }
  );

  return updatedVehicle;
}

async function deleteVehicleById(
  vehicleId: string
): Promise<VehicleInterface | null> {
  const vehicle = await VehicleModel.findById(vehicleId);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  await UserModel.updateMany(
    { likes: vehicleId },
    { $pull: { likes: vehicleId } }
  );

  if (vehicle.company) {
    await CompanyModel.findByIdAndUpdate(
      vehicle.company,
      { $pull: { carsAvailable: vehicleId } },
      { new: true }
    );
  }

  await RentModel.deleteMany({ vehicle: vehicleId });

  const deletedVehicle = await VehicleModel.findByIdAndDelete(vehicleId);
  return deletedVehicle;
}

async function isReferralValid(
  referralCode: string,
  userId: Types.ObjectId
): Promise<boolean> {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  const referer = await UserModel.findOne({ referralCode });
  if (!referer) throw new Error("Referer not found");

  if (user.disallowedReferralCodes.includes(referralCode)) {
    return false;
  }

  if (referer._id.equals(user._id)) {
    throw new Error("You cannot refer yourself");
  }

  referer.credits += 5;

  await referer.save();
  // await user.save();

  return true;
}

const vehicleService = {
  getVehicles,
  getCompanyVehicles,
  getVehicleById,
  getVehicleBySlug,
  checkAvailability,
  likeVehicle,
  removeLikeVehicle,
  deleteVehicleById,
  createVehicle,
  createBulk,
  updateVehicle,
  isReferralValid,
  getCount,
};

export default vehicleService;
