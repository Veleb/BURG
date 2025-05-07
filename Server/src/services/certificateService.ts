import { Types } from "mongoose";
import UserModel from "../models/user";
import { customAlphabet } from 'nanoid';

const generateCertificateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10);


async function verifyCertificate(userId: Types.ObjectId, certificateCode: string) {
    
    const user = await UserModel.findById(userId).lean();
    
    if (!user) {
        throw new Error("User not found");
    }

    if (user.certificateCode === certificateCode) {
        return [true, user.certificateDownloadLink];
    }
    
    return [false, null];
}

async function addCertificate(userId: Types.ObjectId, certificateDownloadLink: string) {
    
    const user = await UserModel.findByIdAndUpdate(userId, {
        certificateDownloadLink: certificateDownloadLink,
        certificateCode: generateCertificateCode() 
    }, { new: true}).select('-password').lean();
    
    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

const certificateService = {
    verifyCertificate,
    addCertificate,
    
}

export default certificateService;