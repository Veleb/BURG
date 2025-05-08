import { Types } from "mongoose";
import UserModel from "../models/user";
import { customAlphabet } from 'nanoid';

const generateCertificateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 10);


async function verifyCertificate(certificateCode: string) {
    
    const user = await UserModel.findOne({ certificateCode }).select('-password').lean();
    
    if (user) {
        return [true, user.certificateDownloadLink]
    }
    
    return [false, null];
}

// async function addCertificate(userId: Types.ObjectId, certificateDownloadLink: string) {
    
    
//     const user = await UserModel.findById(userId).select('-password').lean()

//     if (!user) {
//         throw new Error("User not found");
//     }

//     if (user.certificateDownloadLink !== certificateDownloadLink) {
//         const user = await UserModel.findByIdAndUpdate(userId, {
//             certificateDownloadLink: certificateDownloadLink,
//             certificateCode: generateCertificateCode() 
//         }, { new: true}).select('-password').lean();
        
//         return user;
//     }

//     return user;
// }

async function addCertificate(userId: Types.ObjectId, certificateDownloadLink: string) {
    const user = await UserModel.findById(userId).select('-password').lean();

    if (!user) {
        throw new Error("User not found");
    }

    const updateFields: Partial<typeof user> = {
        certificateDownloadLink
    };

    if (!user.certificateCode) {
        updateFields.certificateCode = generateCertificateCode();
    }

    if (user.certificateDownloadLink !== certificateDownloadLink) {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
        ).select('-password').lean();

        return updatedUser;
    }

    return user;
}


const certificateService = {
    verifyCertificate,
    addCertificate,
    
}

export default certificateService;