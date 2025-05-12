import mongoose, { Types } from "mongoose";
import UserModel from "../models/user";
import { customAlphabet } from 'nanoid';
import CertificateModel from "../models/certificate";
import { CertificateForCreate } from "../types/model-types/certificate-types";

const generateCertificateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10);


async function verifyCertificate(certificateCode: string) {
    
    const cert = await CertificateModel.findOne({ code: certificateCode }).lean();

    if (cert && !cert.isRedeemed) {
        return [true, cert];
    }

    return [false, null];
}

async function redeemCertificate(certificateCode: string, userId: Types.ObjectId) {

  if (!userId) {
    throw new Error("User ID must be provided");
  }

  const certificate = await CertificateModel.findOne({ code: certificateCode });

  if (!certificate) {
    throw new Error("Invalid certificate code");
  }

  if (certificate.isRedeemed) {
    throw new Error("Certificate already redeemed");
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const alreadyLinked = user.certificates?.includes(certificate._id);

  if (!alreadyLinked) {
    await UserModel.findByIdAndUpdate(userId, {
      $addToSet: { certificates: certificate._id }  
    });
  }

  certificate.isRedeemed = true;
  certificate.redeemed_at = new Date();
  certificate.user = userId; 
  await certificate.save();

  return certificate;
}

async function addCertificate(
issuedTo: string, downloadLink: string, position: string, isRedeemed: boolean, redeemed_at: Date, userId: Types.ObjectId  ) {
    if (userId) {
      const user = await UserModel.findById(userId).select('-password').lean();

      if (!user) {
        throw new Error("User not found");
      }

    }
  
    const newCertificateData: CertificateForCreate = {
      code: generateCertificateCode(),
      issuedTo,
      downloadLink,
      position,
      isRedeemed,
      redeemed_at,
      user: userId
    };
  
    if (userId) {
      newCertificateData.user = userId;
    }
  
    const certificate = await CertificateModel.create(newCertificateData);
    return certificate;
}


async function addCertificateToUser(certificateCode: string, userId: Types.ObjectId) {
  if (!userId) throw new Error("User ID is required");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    
    const user = await UserModel.findById(userId).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    const certificate = await CertificateModel.findOne({ code: certificateCode }).session(session);

    if (!certificate) {
      throw new Error("Certificate not found");
    }

    if (certificate.user && !certificate.user.equals(userId)) {
      throw new Error("Certificate belongs to another user");
    }

    if (user.certificates?.some(id => id.equals(certificate._id))) {
      throw new Error("Certificate already associated with this user");
    }

    await UserModel.updateOne(
      { _id: userId },
      { $addToSet: { certificates: certificate._id } }
    ).session(session);

    if (!certificate.user) {

      await CertificateModel.updateOne(
        { _id: certificate._id },
        { $set: { user: userId } }
      ).session(session);

    }

    await session.commitTransaction();
    return {
      message: "Certificate added successfully",
      certificateId: certificate._id,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function getAllUserCertificates(userId: Types.ObjectId) {

  const user = await UserModel.findById(userId).select('-password').populate('certificates').lean();

  if (!user) {
    throw new Error('User not found');
  }

  return user.certificates;
}

async function getAllCertificates() {

  const certificates = await CertificateModel.find().lean();

  if (!certificates) {
    throw new Error('Error fetching certificates')
  }

  return certificates;
}

const certificateService = {
    verifyCertificate,
    addCertificate,
    redeemCertificate,
    addCertificateToUser,
    getAllUserCertificates,
    getAllCertificates,
    
}

export default certificateService;