const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { sequelize, testConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');
const { fabricGateway } = require('./services/fabric');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/patients', require('./routes/patient.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/transfers', require('./routes/transfer.routes'));
app.use('/api/audit', require('./routes/audit.routes'));

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database (create tables if they don't exist)
        await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
        logger.info('✅ Database synchronized');

        // Initialize Fabric connection (optional - graceful degradation)
        if (process.env.FABRIC_ENABLED !== 'false') {
            fabricGateway.connect().catch(err => {
                logger.warn('⚠️  Fabric connection failed, continuing without blockchain:', err.message);
                logger.warn('   App will work normally, but blockchain features will be disabled');
            });
        } else {
            logger.info('ℹ️  Blockchain disabled via FABRIC_ENABLED=false');
        }

        // Start listening
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
            logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
            logger.info(`🔐 Blockchain: ${process.env.FABRIC_ENABLED !== 'false' ? 'Enabled' : 'Disabled'}`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await fabricGateway.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await fabricGateway.disconnect();
    process.exit(0);
});

startServer();

module.exports = app;
