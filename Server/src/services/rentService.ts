import { Types } from "mongoose";
import CompanyModel from "../models/company";
import RentModel from "../models/rent";
import UserModel from "../models/user";
import VehicleModel from "../models/vehicle";
import { CompanyInterface } from "../types/model-types/company-types";
import { RentForCreate, RentInterface } from "../types/model-types/rent-types";

async function getAllRentsPaginated(limit: number, offset: number): Promise<RentInterface[]> {
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

async function getRentsByCompanyIdPaginated(companyId: string, limit: number, offset: number): Promise<{ rents: RentInterface[]; totalCount: number }> {
  try {
    const company = await CompanyModel.findById(companyId).select('carsAvailable');
    if (!company) throw new Error('Company not found');

    const totalCount = await RentModel.countDocuments({ vehicle: { $in: company.carsAvailable } });

    const rents = await RentModel.find({
      vehicle: { $in: company.carsAvailable }
    })
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

    return { rents: rents ?? [], totalCount };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error fetching paginated rents by company ID');
  }
}

async function getAllRents(): Promise<RentInterface[]> {
  try {

    const rents = await RentModel.find()
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

    return rents ?? [];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error fetching rents by company ID');
  }
}

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

    const adminCompanyId = process.env.ADMIN_COMPANY_ID;
    
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
    throw new Error(err instanceof Error ? err.message : `Error creating a rent`);
  }
}

async function getRentsByCompanyId(companyId: string): Promise<RentInterface[]> {
  try {
    const company = await CompanyModel.findById(companyId).select('carsAvailable');
    if (!company) throw new Error('Company not found');

    const rents = await RentModel.find({
      vehicle: { $in: company.carsAvailable }
    })
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

    return rents ?? [];
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Error fetching rents by company ID');
  }
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
      await CompanyModel.findByIdAndUpdate(
        (rent.vehicle.company as CompanyInterface)._id,
        { $inc: { totalEarnings: -(rent?.total ?? 0) * 0.90 } },
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

    const adminCompanyId = process.env.ADMIN_COMPANY_ID;

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

const rentService = {
  getAllRents,
  createRent,
  getRentById,
  getRentsByCompanyId,
  getUnavailableDates,
  changeRentStatus,
  rentWithoutPaying,
  getAllRentsPaginated,
  getRentsByCompanyIdPaginated,
  getTotalRentCount
}

export default rentService;