const Group = require("../models/QA/Group");

const seedGroups = async () => {
    try {
        const groupCount = await Group.countDocuments();
        if (groupCount === 0) {
            const categories = [
                "Programming",
                "Web & Mobile",
                "Database",
                "Networking",
                "Software Engineering",
                "AI",
                "Data Science",
                "Cyber Security"
            ];

            const groupData = categories.map(name => ({
                name,
                description: `${name} discussion group for students and experts.`
            }));

            await Group.insertMany(groupData);
            console.log("Q&A Groups seeded successfully");
        }
    } catch (error) {
        console.error("Error seeding groups:", error);
    }
};

module.exports = seedGroups;
