const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path as needed
const dotenv = require('dotenv');

dotenv.config();

const getNextExpertEmail = async () => {
    // Find all users with the expert email pattern
    const experts = await User.find({ email: /^ept\d{3}@sliitplatform\.com$/ }, 'email');

    // Extract numerical IDs
    const existingIds = experts
        .map(e => {
            const match = e.email.match(/^ept(\d{3})@/);
            return match ? parseInt(match[1]) : null;
        })
        .filter(id => id !== null)
        .sort((a, b) => a - b);

    // Find the first gap
    let nextId = 1;
    for (const id of existingIds) {
        if (id === nextId) {
            nextId++;
        } else if (id > nextId) {
            break;
        }
    }

    const nextIdStr = nextId.toString().padStart(3, '0');
    return {
        email: `ept${nextIdStr}@sliitplatform.com`,
        id: nextId
    };
};

const runTest = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Test 1: Generate next email
        const result = await getNextExpertEmail();
        console.log('Next available expert email:', result.email);

        // Test 2: Simulate deletion and gap find
        // This is hard to do without side effects on DB. 
        // I will just log the existing IDs to see if there's a gap.
        const experts = await User.find({ email: /^ept\d{3}@sliitplatform\.com$/ }, 'email');
        const existingIds = experts.map(e => parseInt(e.email.match(/\d{3}/)[0])).sort((a, b) => a - b);
        console.log('Existing IDs:', existingIds);

        const nextId = result.id;
        console.log('Logic says next ID is:', nextId);

        let gapFound = false;
        for (let i = 0; i < existingIds.length; i++) {
            if (existingIds[i] !== i + 1) {
                console.log(`Gap found at ${i + 1}`);
                gapFound = true;
                break;
            }
        }
        if (!gapFound) {
            console.log('No gaps in existing IDs. Next ID should be', existingIds.length + 1);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

runTest();
