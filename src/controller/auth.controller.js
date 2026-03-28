
const User = require("../models/user.model")
const crypto = require("crypto"); // nodejs ka building Package
const { response } = require("express");
const jwt = require("jsonwebtoken");
const { networkInterfaces } = require("os");
const { promiseHooks } = require("v8");


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

    const accessToken = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "15m"  // max to max expire time 15m
    })
    const refreshToken = jwt.sign({
        id: user._id,
    }, process.env.JWT_SECRET_KEY, {
        expiresIn: "7d" // max to max expire time 7d
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 100  // 7 Days
    })

    res.status(201).json({
        message: "User Register Successfully ",
        user: {
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


module.exports = {
    handleUserRegister,
    handleUserGetMe,
    handleUserRefreshToken
}