/*
 * Fabric Services Index
 * Central export for all blockchain services
 */

const fabricGateway = require('./gateway.service');
const patientFabric = require('./patient.fabric');
const reportFabric = require('./report.fabric');
const accessLogFabric = require('./access-log.fabric');
const consentFabric = require('./consent.fabric');

module.exports = {
    fabricGateway,
    patientFabric,
    reportFabric,
    accessLogFabric,
    consentFabric
};
