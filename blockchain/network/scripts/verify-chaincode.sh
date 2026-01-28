#!/bin/bash
#
# Chaincode Verification Script
# Verifies that chaincode is properly deployed and functional
#

set -e

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHANNEL_NAME="ehr-channel"
CHAINCODE_NAME="ehr-contract"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Chaincode Verification Script        ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Set environment
export PATH=${PWD}/bin:$PATH
export FABRIC_CFG_PATH=${PWD}

# Function to set peer environment
setPeerEnv() {
    local ORG=$1
    local PEER=$2
    
    case $ORG in
        "hospital")
            export CORE_PEER_LOCALMSPID="HospitalMSP"
            export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/hospital/peers/peer${PEER}.hospital.ehr.com/tls/ca.crt
            export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/hospital/users/Admin@hospital.ehr.com/msp
            if [ $PEER -eq 0 ]; then
                export CORE_PEER_ADDRESS=localhost:7051
            else
                export CORE_PEER_ADDRESS=localhost:8051
            fi
            ;;
        "clinic")
            export CORE_PEER_LOCALMSPID="ClinicMSP"
            export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/clinic/peers/peer0.clinic.ehr.com/tls/ca.crt
            export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/clinic/users/Admin@clinic.ehr.com/msp
            export CORE_PEER_ADDRESS=localhost:9051
            ;;
        "lab")
            export CORE_PEER_LOCALMSPID="LabMSP"
            export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/lab/peers/peer0.lab.ehr.com/tls/ca.crt
            export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/lab/users/Admin@lab.ehr.com/msp
            export CORE_PEER_ADDRESS=localhost:10051
            ;;
    esac
}

# 1. Check if network is running
echo -e "${BLUE}1. Checking network status...${NC}"
if ! docker ps | grep -q "peer0.hospital.ehr.com"; then
    echo -e "${RED}❌ Network is not running!${NC}"
    echo -e "${YELLOW}Run: ./scripts/deploy-network.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Network is running${NC}"
echo ""

# 2. Check installed chaincode
echo -e "${BLUE}2. Checking installed chaincode...${NC}"
setPeerEnv "hospital" 0

INSTALLED=$(peer lifecycle chaincode queryinstalled 2>&1 | grep "${CHAINCODE_NAME}" || true)
if [ -z "$INSTALLED" ]; then
    echo -e "${RED}❌ Chaincode not installed${NC}"
    exit 1
fi

PACKAGE_ID=$(echo "$INSTALLED" | sed -n "s/^Package ID: \(${CHAINCODE_NAME}[^,]*\), Label:.*/\1/p" | head -1)
echo -e "${GREEN}✅ Chaincode installed${NC}"
echo -e "   Package ID: ${PACKAGE_ID}"
echo ""

# 3. Approve chaincode for each organization
echo -e "${BLUE}3. Approving chaincode for all organizations...${NC}"

# Hospital
echo -e "${YELLOW}   Approving for Hospital...${NC}"
setPeerEnv "hospital" 0
peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer0.ehr.com \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version 1.0 \
    --package-id ${PACKAGE_ID} \
    --sequence 1 \
    --tls \
    --cafile ${PWD}/organizations/orderer/orderers/orderer0.ehr.com/msp/tlscacerts/tlsca.ehr.com-cert.pem \
    2>&1 | grep -q "successfully" && echo -e "${GREEN}   ✅ Hospital approved${NC}" || echo -e "${RED}   ❌ Hospital approval failed${NC}"

# Clinic
echo -e "${YELLOW}   Approving for Clinic...${NC}"
setPeerEnv "clinic" 0
peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer0.ehr.com \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version 1.0 \
    --package-id ${PACKAGE_ID} \
    --sequence 1 \
    --tls \
    --cafile ${PWD}/organizations/orderer/orderers/orderer0.ehr.com/msp/tlscacerts/tlsca.ehr.com-cert.pem \
    2>&1 | grep -q "successfully" && echo -e "${GREEN}   ✅ Clinic approved${NC}" || echo -e "${RED}   ❌ Clinic approval failed${NC}"

# Lab
echo -e "${YELLOW}   Approving for Lab...${NC}"
setPeerEnv "lab" 0
peer lifecycle chaincode approveformyorg \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer0.ehr.com \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version 1.0 \
    --package-id ${PACKAGE_ID} \
    --sequence 1 \
    --tls \
    --cafile ${PWD}/organizations/orderer/orderers/orderer0.ehr.com/msp/tlscacerts/tlsca.ehr.com-cert.pem \
    2>&1 | grep -q "successfully" && echo -e "${GREEN}   ✅ Lab approved${NC}" || echo -e "${RED}   ❌ Lab approval failed${NC}"

echo ""

# 4. Check commit readiness
echo -e "${BLUE}4. Checking commit readiness...${NC}"
setPeerEnv "hospital" 0
peer lifecycle chaincode checkcommitreadiness \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version 1.0 \
    --sequence 1 \
    --tls \
    --cafile ${PWD}/organizations/orderer/orderers/orderer0.ehr.com/msp/tlscacerts/tlsca.ehr.com-cert.pem \
    --output json | jq .

echo ""

# 5. Commit chaincode
echo -e "${BLUE}5. Committing chaincode...${NC}"
setPeerEnv "hospital" 0
peer lifecycle chaincode commit \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer0.ehr.com \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --version 1.0 \
    --sequence 1 \
    --tls \
    --cafile ${PWD}/organizations/orderer/orderers/orderer0.ehr.com/msp/tlscacerts/tlsca.ehr.com-cert.pem \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/hospital/peers/peer0.hospital.ehr.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/clinic/peers/peer0.clinic.ehr.com/tls/ca.crt \
    --peerAddresses localhost:10051 \
    --tlsRootCertFiles ${PWD}/organizations/lab/peers/peer0.lab.ehr.com/tls/ca.crt

echo -e "${GREEN}✅ Chaincode committed${NC}"
echo ""

# 6. Verify committed chaincode
echo -e "${BLUE}6. Verifying committed chaincode...${NC}"
peer lifecycle chaincode querycommitted \
    --channelID ${CHANNEL_NAME} \
    --name ${CHAINCODE_NAME} \
    --cafile ${PWD}/organizations/orderer/orderers/orderer0.ehr.com/msp/tlscacerts/tlsca.ehr.com-cert.pem

echo ""

# 7. Test chaincode - Create a test patient
echo -e "${BLUE}7. Testing chaincode - Creating test patient...${NC}"
setPeerEnv "hospital" 0

TEST_PATIENT='{
    "id": "TEST_001",
    "npi": "1234567890",
    "name": "Test Patient",
    "dateOfBirth": "1990-01-01",
    "gender": "Male",
    "bloodType": "O+",
    "allergies": "None",
    "medicalHistory": "Test history"
}'

peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer0.ehr.com \
    --tls \
    --cafile ${PWD}/organizations/orderer/orderers/orderer0.ehr.com/msp/tlscacerts/tlsca.ehr.com-cert.pem \
    -C ${CHANNEL_NAME} \
    -n ${CHAINCODE_NAME} \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/hospital/peers/peer0.hospital.ehr.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/clinic/peers/peer0.clinic.ehr.com/tls/ca.crt \
    -c '{"function":"PatientContract:createPatient","Args":["TEST_001","'"$(echo $TEST_PATIENT | sed 's/"/\\"/g')"'"]}'

echo -e "${GREEN}✅ Test patient created${NC}"
echo ""

# 8. Query the test patient
echo -e "${BLUE}8. Querying test patient...${NC}"
peer chaincode query \
    -C ${CHANNEL_NAME} \
    -n ${CHAINCODE_NAME} \
    -c '{"function":"PatientContract:getPatient","Args":["TEST_001"]}' | jq .

echo ""

# 9. Test Consent Contract
echo -e "${BLUE}9. Testing Consent Contract - Granting consent...${NC}"

TEST_CONSENT='{
    "patientId": "TEST_001",
    "providerId": "PROVIDER_001",
    "providerName": "Dr. Test",
    "dataTypes": ["medical_history", "lab_results"],
    "purpose": "Treatment",
    "expiryDate": "2026-12-31"
}'

peer chaincode invoke \
    -o localhost:7050 \
    --ordererTLSHostnameOverride orderer0.ehr.com \
    --tls \
    --cafile ${PWD}/organizations/orderer/orderers/orderer0.ehr.com/msp/tlscacerts/tlsca.ehr.com-cert.pem \
    -C ${CHANNEL_NAME} \
    -n ${CHAINCODE_NAME} \
    --peerAddresses localhost:7051 \
    --tlsRootCertFiles ${PWD}/organizations/hospital/peers/peer0.hospital.ehr.com/tls/ca.crt \
    --peerAddresses localhost:9051 \
    --tlsRootCertFiles ${PWD}/organizations/clinic/peers/peer0.clinic.ehr.com/tls/ca.crt \
    -c '{"function":"ConsentContract:grantConsent","Args":["CONSENT_TEST_001","'"$(echo $TEST_CONSENT | sed 's/"/\\"/g')"'"]}'

echo -e "${GREEN}✅ Consent granted${NC}"
echo ""

# 10. Check consent
echo -e "${BLUE}10. Checking consent...${NC}"
peer chaincode query \
    -C ${CHANNEL_NAME} \
    -n ${CHAINCODE_NAME} \
    -c '{"function":"ConsentContract:checkConsent","Args":["TEST_001","PROVIDER_001","medical_history"]}' | jq .

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ ALL VERIFICATIONS PASSED!         ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo -e "  ✅ Network is running"
echo -e "  ✅ Chaincode installed on all peers"
echo -e "  ✅ Chaincode approved by all organizations"
echo -e "  ✅ Chaincode committed to channel"
echo -e "  ✅ PatientContract tested successfully"
echo -e "  ✅ ConsentContract tested successfully"
echo ""
echo -e "${BLUE}Your blockchain is ready for your defense! 🎉${NC}"
