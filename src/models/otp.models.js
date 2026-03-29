const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for OTP Verification"]
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:[true,"User is required for OTP Verification"]
    },
    otpHash:{
        type:String,
        required:[true,"OTP is required for OTP Verification"]
    }
},{
    timestamps:true
})

const OTP = mongoose.model("OTP", otpSchema);

module.exports = OTP;