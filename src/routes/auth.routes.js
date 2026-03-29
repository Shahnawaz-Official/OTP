const express = require("express")
const router = express.Router()

const {handleUserRegister,handleUserGetMe,handleUserRefreshToken,handleUserLogout} = require("../controller/auth.controller")


/**
 * @name  POST  - /api/auth/register
 */

router.post("/register",handleUserRegister)

/**
 * @name  GET - /api/auth/get-me
 */
router.get("/get-me",handleUserGetMe)

/**
 *  @name  GET  - api/auth/refresh-token
 */
router.get("/refresh-token",handleUserRefreshToken)

/**
 * @name  GET  - /api/auth/logout
 */

router.get("/logout",handleUserLogout)

module.exports = router