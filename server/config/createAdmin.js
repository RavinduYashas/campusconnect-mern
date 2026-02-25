const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
    try {
        const adminEmail = (process.env.ADMIN_EMAIL || "admin@sliitplatform.com").trim();
        const adminPassword = (process.env.ADMIN_PASSWORD || "Admin@123").trim();

        const exists = await User.findOne({ role: "admin" });

        if (!exists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            await User.create({
                name: "System Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                profileCompleted: true
            });

            console.log(`Admin account created: ${adminEmail} (Credentials from .env)`);
        }
    } catch (error) {
        console.error("Error creating admin:", error);
    }
};

module.exports = createAdmin;
