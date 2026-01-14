/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const PatientContract = require('./lib/patient-contract');
const ReportContract = require('./lib/report-contract');
const TransferContract = require('./lib/transfer-contract');
const AccessLogContract = require('./lib/access-log-contract');

module.exports.PatientContract = PatientContract;
module.exports.ReportContract = ReportContract;
module.exports.TransferContract = TransferContract;
module.exports.AccessLogContract = AccessLogContract;

module.exports.contracts = [
    PatientContract,
    ReportContract,
    TransferContract,
    AccessLogContract
];
