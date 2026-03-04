const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const createAdmin = require('./config/createAdmin');

dotenv.config();

// Connect to Database
connectDB().then(() => {
    // Create Default Admin
    createAdmin();
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Simple request logger to help debug API calls
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Define Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/sports', require('./routes/sportRoutes'));

// Return JSON for unknown /api routes instead of HTML 404 (helps devtools)
app.use('/api', (req, res) => {
    res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Print registered API routes for debugging
const listRoutes = () => {
    try {
        const routes = [];
        app._router.stack.forEach((middleware) => {
            if (middleware.route) {
                // routes registered directly on the app
                const methods = Object.keys(middleware.route.methods).join(',').toUpperCase();
                routes.push(`${methods} ${middleware.route.path}`);
            } else if (middleware.name === 'router') {
                // router middleware
                middleware.handle.stack.forEach((handler) => {
                    if (handler.route) {
                        const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
                        routes.push(`${methods} ${handler.route.path}`);
                    }
                });
            }
        });
        console.log('Registered routes:\n' + routes.join('\n'));
    } catch (err) {
        console.error('Could not list routes', err);
    }
};

listRoutes();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
