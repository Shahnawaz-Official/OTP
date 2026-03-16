const mongoose = require("mongoose");




async function dataBaseConnect() {
    await mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Database Connected Successfully");
    })
    .catch((err) => {
        console.log("MongoDB Connection Error", err);
    });
}



module.exports = dataBaseConnect;