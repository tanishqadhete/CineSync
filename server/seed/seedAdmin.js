require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const connectDB = require("../config/db");
const seedAdmin = async () => {
    try {
        await connectDB();
        const existingAdmin = await User.findOne({
            role: "ADMIN"
        });
        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit();
        }
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await User.create({
            username: "Admin",
            email: "admin@cinesync.com",
            password: hashedPassword,
            role: "ADMIN"
        });
        console.log("Admin created successfully.");
        process.exit();
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
};

seedAdmin();