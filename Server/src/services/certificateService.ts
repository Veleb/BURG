import { Types } from "mongoose";
import UserModel from "../models/user";

async function verifyCertificate(userId: Types.ObjectId, certificateCode: string) {
    
    const user = await UserModel.findById(userId).lean();
    
    if (!user) {
        throw new Error("User not found");
    }

    if (user.certificateCode === certificateCode) {
        return true;
    }
    
    return false;
}

const certificateService = {
    verifyCertificate,
}

export default certificateService;