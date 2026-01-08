const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING
    },
    bloodType: {
        type: DataTypes.STRING(10),
        field: 'blood_type'
    },
    npi: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING(50)
    },
    address: {
        type: DataTypes.TEXT
    },
    medicalHistory: {
        type: DataTypes.TEXT,
        field: 'medical_history'
    },
    allergies: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: []
    },
    currentMedications: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        field: 'current_medications',
        defaultValue: []
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Active'
    },
    lastVisit: {
        type: DataTypes.DATE,
        field: 'last_visit'
    },
    nextAppointment: {
        type: DataTypes.DATE,
        field: 'next_appointment'
    }
}, {
    tableName: 'patients',
    timestamps: true,
    underscored: true
});

module.exports = Patient;
