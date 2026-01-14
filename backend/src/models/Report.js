const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
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
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fileName: {
        type: DataTypes.STRING,
        field: 'file_name'
    },
    fileType: {
        type: DataTypes.STRING(50),
        field: 'file_type'
    },
    fileUrl: {
        type: DataTypes.TEXT,
        field: 'file_url'
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'reports',
    timestamps: true,
    underscored: true,
    updatedAt: false
});

module.exports = Report;
