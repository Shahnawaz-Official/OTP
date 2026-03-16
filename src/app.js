const express = require("express")
const morgan = require("morgan")


const app = express()

app.use(express.json())
app.use(morgan("dev"))

const authRouter = require("./routes/auth.routes")

app.use("/api/auth",authRouter)


module.exports = app