const express = require("express")
const morgan = require("morgan")
const cookieParser = require("cookie-parser")


const app = express()

app.use(express.json())
app.use(morgan("dev"))
app.use(cookieParser())

const authRouter = require("./routes/auth.routes")

app.use("/api/auth",authRouter)


module.exports = app