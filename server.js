require("dotenv").config()

const app = require("./src/app")
const dataBaseConnect = require("./src/config/database")

const PORT = process.env.PORT

dataBaseConnect();






app.listen(PORT ,()=>{
    console.log(`Server is Running PORT ${PORT}`);
    
})