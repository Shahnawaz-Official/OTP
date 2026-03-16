const mongoose = require("mongoose")



const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true ,"UserName is Required"],
        unique:[true,"Username must be Unique"]
    },
    email:{
        type:String,
        required:[true,"Email is required for Register Website"],
        unique:[true,"email must be Unique"]
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    }
})


const User = mongoose.model("User",userSchema)

module.exports = User