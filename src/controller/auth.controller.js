const User = require("../models/user.model")
const crypto = require("crypto") // nodejs ka building Package
const jwt = require("jsonwebtoken");




async function handleUserRegister (req,res){


    const {username ,email ,password} = req.body;

    const isAlreadyExsist = await User.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(isAlreadyExsist){
        return res.status(409).json({
            message:"Username & Email Already Exsist  "
        })
    }

    /**
     * hashpassword using nodejs  building Package
     */
    const hashPassword = crypto.createHash("sha256").update(password).digest("hex")

    const user = await User.create({
        username,
        email,
        password:hashPassword
    })

    const token = jwt.sign({
        id :user._id
    },process.env.JWT_SECRET_KEY,{
        expiresIn:"1d"
    })
   
    
    res.status(201).json({
        message:"User Register Successfully ",
        user:{
           id:user._id,
           name:user.username,
           email:user.email
        },
        token
    })



}





module.exports = {
    handleUserRegister
}