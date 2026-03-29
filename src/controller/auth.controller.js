
const User = require("../models/user.model")
const crypto = require("crypto"); // nodejs ka building Package
const jwt = require("jsonwebtoken");
const Session = require("../models/session.models");
const { sendEmail } = require("../services/email.services");
const OTP = require("../models/otp.models");
const { generateOTP, genrateOtpHtml } = require("../utils/otp.utils");



/**
 * @name  handleUserRegister
 * @description user register
 */

async function handleUserRegister(req, res) {


    const { username, email, password } = req.body;

    const isAlreadyExsist = await User.findOne({
        $or: [
            { username },
            { email }
        ]
    })

    if (isAlreadyExsist) {
        return res.status(409).json({
            message: "Username & Email Already Exsist  "
        })
    }

    /**
     * hashpassword using nodejs  building Package
     */
    const hashPassword = crypto.createHash("sha256").update(password).digest("hex")

    const user = await User.create({
        username,
        email,
        password: hashPassword
    })


    const otpCode = generateOTP();
    const html = genrateOtpHtml(otpCode)

    const otphash = crypto.createHash("sha256").update(otpCode).digest("hex")
    await OTP.create({
        email,
        user: user._id,
        otpHash: otphash,
    })

    await sendEmail(email, "OTP Verification", `Your OTP is ${otpCode}`, html)


   

    res.status(201).json({
        message: "User Register Successfully ",
        user: {
            name: user.username,
            email: user.email,
            verifyed: user.verifyed
        },
    })



}


/**
 * @name handleUserLoging
 * @description user login with email and password
 */

async function handleUserLoging(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email })

    if (!user) {
        return res.status(401).json({
            message: "Invalid Email or Password"
        })
    }
    if (!user.verifyed) {
        return res.status(401).json({
            message: "Please Verify Your Email Before Login"
        })
    }

    const hashPassword = crypto.createHash("sha256").update(password).digest("hex")

    const isPasswordValid = hashPassword === user.password;

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Invalid Email or Password"
        })
    }

    const refreshToken = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d" // max to max expire time 7d
    })

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")
    // Create a new session 
    const session = await Session.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    })

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id,
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "15m"  
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 
    })
    res.status(200).json({
        message: "User Login Successfully",
        user:{
            id: user._id,
            name: user.username,
            email: user.email
        },
        accessToken
        })
        






}


/**
 * @name handleUserGetMe
 * @description user presonal data get  
 */

async function handleUserGetMe(req, res) {

    const token = req.headers.authorization?.split(" ")[1];

    // console.log(token)

    if (!token) {
        return res.status(401).json({
            message: "Token Not Found And Unauthorized"
        })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    // console.log(decoded)

    const user = await User.findById(decoded.id)

    res.status(200).json({
        message: "User Fatch Successfully",
        user: {
            username: user.username,
            email: user.email
        }
    })


}


/**
 * 
 * @name handleUserRefreshToken
 * @descraiption  user token handleUserRefreshToken 
 */

async function handleUserRefreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

if (!refreshToken) {
    return res.status(401).json({
        message: "Refresh Token not Found"
    });
}

try {

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

    // yha pehle refresh token ka hash banayenge taki database me usko match kar sake
    // ye logout ke time pe bhi use hoga taki usko revoke kar sake
    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await Session.findOne({
        refreshTokenHash,
        revoked: false
    })
    if (!session) {
        return res.status(401).json({
            message: "Invalid Refresh Token"
        });
    }




    //  New Access Token
    const accessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "15m" }
    );

    //  New Refresh Token
    const newRefreshToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" }
    );

    //  Update Session with New Refresh Token Hash
    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    //  Cookie me NEW refresh token set 
    res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    return res.status(200).json({
        message: "Access Token Refresh Successfully",
        accessToken
    });

} catch (error) {

    return res.status(401).json({
        message: "Invalid or Expired Refresh Token"
    });
}

}


/**
 * @name handleUserLogout
 * @description user logout and session revoke
 */

async function handleUserLogout(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh Token not Found"
        });
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const session = await Session.findOne({
        refreshTokenHash,
        revoked:false
    })

    if(!session){
        return res.status(400).json({
            message:"Invalid Refresh Token"
        })
    }
    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "User Logout Successfully"
    })

}

/**
 * @name handleUserLogoutAll
 * @description user logout all session revoke
 */
async function handleUserLogoutAll(req,res){

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({
            message: "Refresh Token not Found"
        });
    }
    const decoded = jwt.verify(refreshToken,process.env.JWT_SECRET_KEY)

    await Session.updateMany({
        user: decoded.id,
        revoked:false
    },{
        revoked:true
    })

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "User Logout All Session Successfully"
    })





}

/**
 * @name handleOtpVerification
 * @description user verify otp for email verification
 */


async function handleOtpVerifyEmail(req,res){
    const { email, otp } = req.body;

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex")

    const otpRecord = await OTP.findOne({
        email,
        otpHash
    })

    if (!otpRecord) {
        return res.status(400).json({
            message: "Invalid OTP"
        })
    }
    const user = await User.findByIdAndUpdate(otpRecord.user,{
        verifyed:true
    })

    await OTP.deleteMany({
        user: otpRecord.user
    })

    return res.status(200).json({
        message: "Email Verify Successfully",
        user:{
            name: user.username,
            email: user.email,
            verifyed: user.verifyed
        }
    })
}









module.exports = {
    handleUserRegister,
    handleUserGetMe,
    handleUserRefreshToken,
    handleUserLogout,
    handleUserLogoutAll,
    handleUserLoging,
    handleOtpVerifyEmail
}