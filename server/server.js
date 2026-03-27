const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const createAdmin = require('./config/createAdmin');
const seedGroups = require('./config/seedGroups');

dotenv.config();

// Connect to Database
connectDB().then(() => {
    // Create Default Admin
    
    createAdmin();
    // Seed Q&A Groups
    seedGroups();
});

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Your frontend URL
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Map to store connected users: userId -> socketId
const userSockets = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Client emits 'register' when they log in
    socket.on('register', (userId) => {
        if (userId) {
            userSockets.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);

            // Broadcast the updated list of online users to everyone
            io.emit('online_users', Array.from(userSockets.keys()));
        }
    });

    socket.on('disconnect', () => {
        // Remove user from map on disconnect
        for (let [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                console.log(`User ${userId} disconnected`);

                // Broadcast the updated list of online users to everyone
                io.emit('online_users', Array.from(userSockets.keys()));
                break;
            }
        }
    });
});

// Broadcast online users immediately upon connection to give the new client the current state
io.on('connection', (socket) => {
    socket.emit('online_users', Array.from(userSockets.keys()));
});

// Export io and userSockets for use in controllers
app.set('io', io);
app.set('userSockets', userSockets);

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
app.use('/api/qa', require('./routes/QA/qaRoutes'));
app.use('/api/notifications', require('./routes/QA/notificationRoutes'));

// Return JSON for unknown /api routes instead of HTML 404 (helps devtools)
app.use('/api', (req, res) => {
    res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Print registered API routes for debugging (call after all routes registered)
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
app.use('/api/qa', require('./routes/QA/qaRoutes'));
app.use('/api/notifications', require('./routes/QA/notificationRoutes')); // Add notification routes
app.use('/api/notifications', require('./routes/QA/notificationRoutes'));

// STUDY GROUP ROUTES - Use this path if your file is directly in routes folder
// Change this line to match where your file actually is
app.use('/api/study-groups', require('./routes/StudyGroups/StudyGroups'));
app.use('/api/workshops', require('./routes/Workshops/Workshops'));

// NOT this path:
// app.use('/api/study-groups', require('./routes/StudyGroups/studyGroupRoutes'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
