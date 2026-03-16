const express = require("express")
const router = express.Router()

const {handleUserRegister} = require("../controller/auth.controller")




router.post("/register",handleUserRegister)





module.exports = router