const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transfer = sequelize.define('Transfer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'patient_id',
        references: {
            model: 'patients',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    urgency: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Pending'
    },
    fromHospital: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'from_hospital'
    },
    toHospital: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'to_hospital'
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    notes: {
        type: DataTypes.TEXT
    },
    requestedBy: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'requested_by'
    },
    requestedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'requested_at'
    },
    reviewedBy: {
        type: DataTypes.STRING,
        field: 'reviewed_by'
    },
    reviewedAt: {
        type: DataTypes.DATE,
        field: 'reviewed_at'
    }
}, {
    tableName: 'transfers',
    timestamps: false
});

module.exports = Transfer;
