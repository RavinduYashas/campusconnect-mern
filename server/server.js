const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const createAdmin = require('./config/createAdmin');
const seedGroups = require('./config/seedGroups');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Map to store connected users: userId -> socketId
const userSockets = new Map();

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on('register', (userId) => {
        if (userId) {
            userSockets.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
            io.emit('online_users', Array.from(userSockets.keys()));
        }
    });
    socket.on('disconnect', () => {
        for (let [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                console.log(`User ${userId} disconnected`);
                io.emit('online_users', Array.from(userSockets.keys()));
                break;
            }
        }
    });
    socket.emit('online_users', Array.from(userSockets.keys()));
});

// Export io and userSockets for use in controllers
app.set('io', io);
app.set('userSockets', userSockets);

// Middleware
app.use(express.json());
app.use(cors());

// Simple request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Connect to Database and start server
connectDB().then(() => {
    console.log('Database connected, initializing services...');
    
    // Create Default Admin & Seed Data
    createAdmin();
    seedGroups();

    // Routes
    app.use('/api/users', require('./routes/userRoutes'));
    app.use('/api/sports', require('./routes/sportRoutes'));
    app.use('/api/clubs', require('./routes/clubRoutes'));
    app.use('/api/notifications', require('./routes/QA/notificationRoutes'));
    app.use('/api/qa', require('./routes/QA/qaRoutes'));

    // Catch-all for unknown /api routes
    app.use('/api', (req, res) => {
        res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
    });

    // Server listening
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
});
