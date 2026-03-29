const express = require("express")
const router = express.Router()

const {
    handleUserRegister,
    handleUserLoging,
    handleUserGetMe,
    handleUserRefreshToken,
    handleUserLogout,
    handleUserLogoutAll
    } = require("../controller/auth.controller")


/**
 * @name  POST  - /api/auth/register
 */

router.post("/register",handleUserRegister)


/**
 * @name  POST  - /api/auth/login
 * @description user login with email and password
 */

router.post("/login",handleUserLoging)

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

/**
 * @name GET - /api/auth/logout-all
 */

router.get("/logout-all",handleUserLogoutAll)





module.exports = router