#!/bin/bash
#
# Complete Network Deployment Script
# This script will deploy the full Hyperledger Fabric network
#

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CHANNEL_NAME="ehr-channel"
CHAINCODE_NAME="ehr-contract"
CHAINCODE_VERSION="1.0"
CHAINCODE_SEQUENCE="1"
CHAINCODE_PATH="../chaincode/ehr-contract"

# Print functions
function printMessage() {
    echo -e "${GREEN}===> $1${NC}"
}

function printError() {
    echo -e "${RED}ERROR: $1${NC}"
}

function printWarning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

function printInfo() {
    echo -e "${BLUE}INFO: $1${NC}"
}

# Check prerequisites
function checkPrerequisites() {
    printMessage "Checking prerequisites..."
    
    # Check Docker
    if ! docker info > /dev/null 2>&1; then
        printError "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    # Check if binaries exist
    if [ ! -d "bin" ]; then
        printError "Fabric binaries not found. Run ./scripts/bootstrap.sh first."
        exit 1
    fi
    
    export PATH=${PWD}/bin:$PATH
    export FABRIC_CFG_PATH=${PWD}
    
    printMessage "✅ Prerequisites check passed"
}

# Generate crypto materials
function generateCrypto() {
    printMessage "Generating crypto materials..."
    
    # Remove old crypto
    rm -rf organizations/hospital/msp organizations/hospital/peers organizations/hospital/users
    rm -rf organizations/clinic/msp organizations/clinic/peers organizations/clinic/users
    rm -rf organizations/lab/msp organizations/lab/peers organizations/lab/users
    rm -rf organizations/orderer/msp organizations/orderer/orderers
    
    # Generate new crypto
    cryptogen generate --config=./crypto-config.yaml --output=organizations
    
    if [ $? -ne 0 ]; then
        printError "Failed to generate crypto materials"
        exit 1
    fi
    
    printMessage "✅ Crypto materials generated"
}

# Generate genesis block and channel transaction
function generateChannelArtifacts() {
    printMessage "Generating channel artifacts..."
    
    # Create channel-artifacts directory
    mkdir -p channel-artifacts
    
    # Generate genesis block
    configtxgen -profile ThreeOrgsApplicationGenesis \
        -outputBlock ./channel-artifacts/genesis.block \
        -channelID system-channel
    
    if [ $? -ne 0 ]; then
        printError "Failed to generate genesis block"
        exit 1
    fi
    
    # Generate channel creation transaction
    configtxgen -profile ThreeOrgsApplicationGenesis \
        -outputCreateChannelTx ./channel-artifacts/${CHANNEL_NAME}.tx \
        -channelID ${CHANNEL_NAME}
    
    if [ $? -ne 0 ]; then
        printError "Failed to generate channel transaction"
        exit 1
    fi
    
    # Generate anchor peer updates
    configtxgen -profile ThreeOrgsApplicationGenesis \
        -outputAnchorPeersUpdate ./channel-artifacts/HospitalMSPanchors.tx \
        -channelID ${CHANNEL_NAME} \
        -asOrg Hospital
    
    configtxgen -profile ThreeOrgsApplicationGenesis \
        -outputAnchorPeersUpdate ./channel-artifacts/ClinicMSPanchors.tx \
        -channelID ${CHANNEL_NAME} \
        -asOrg Clinic
    
    configtxgen -profile ThreeOrgsApplicationGenesis \
        -outputAnchorPeersUpdate ./channel-artifacts/LabMSPanchors.tx \
        -channelID ${CHANNEL_NAME} \
        -asOrg Lab
    
    printMessage "✅ Channel artifacts generated"
}

# Start network
function startNetwork() {
    printMessage "Starting Hyperledger Fabric network..."
    
    # Create Docker network
    docker network create ehr-network 2>/dev/null || true
    
    # Start CAs
    printInfo "Starting Certificate Authorities..."
    docker-compose -f docker/docker-compose-ca.yaml up -d
    sleep 5
    
    # Start Orderers
    printInfo "Starting Orderer nodes..."
    docker-compose -f docker/docker-compose-orderers.yaml up -d
    sleep 5
    
    # Start Peers
    printInfo "Starting Peer nodes..."
    docker-compose -f docker/docker-compose-peers.yaml up -d
    sleep 5
    
    printMessage "✅ Network started"
}

# Create channel
function createChannel() {
    printMessage "Creating channel: ${CHANNEL_NAME}..."
    
    # Set environment for Hospital peer0
    export CORE_PEER_TLS_ENABLED=true
    export CORE_PEER_LOCALMSPID="HospitalMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/hospital/peers/peer0.hospital.ehr.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/hospital/users/Admin@hospital.ehr.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    
    # Create channel
    peer channel create \
        -o localhost:7050 \
        -c ${CHANNEL_NAME} \
        -f ./channel-artifacts/${CHANNEL_NAME}.tx \
        --outputBlock ./channel-artifacts/${CHANNEL_NAME}.block \
        --tls \
        --cafile ${PWD}/organizations/orderer/orderers/orderer0.ehr.com/msp/tlscacerts/tlsca.ehr.com-cert.pem
    
    if [ $? -ne 0 ]; then
        printError "Failed to create channel"
        exit 1
    fi
    
    printMessage "✅ Channel created"
}

# Join peers to channel
function joinChannel() {
    printMessage "Joining peers to channel..."
    
    # Join Hospital peer0
    printInfo "Joining peer0.hospital.ehr.com..."
    export CORE_PEER_LOCALMSPID="HospitalMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/hospital/peers/peer0.hospital.ehr.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/hospital/users/Admin@hospital.ehr.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block
    
    # Join Hospital peer1
    printInfo "Joining peer1.hospital.ehr.com..."
    export CORE_PEER_ADDRESS=localhost:8051
    peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block
    
    # Join Clinic peer0
    printInfo "Joining peer0.clinic.ehr.com..."
    export CORE_PEER_LOCALMSPID="ClinicMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/clinic/peers/peer0.clinic.ehr.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/clinic/users/Admin@clinic.ehr.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block
    
    # Join Lab peer0
    printInfo "Joining peer0.lab.ehr.com..."
    export CORE_PEER_LOCALMSPID="LabMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/lab/peers/peer0.lab.ehr.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/lab/users/Admin@lab.ehr.com/msp
    export CORE_PEER_ADDRESS=localhost:10051
    peer channel join -b ./channel-artifacts/${CHANNEL_NAME}.block
    
    printMessage "✅ All peers joined channel"
}

# Package chaincode
function packageChaincode() {
    printMessage "Packaging chaincode..."
    
    cd ${CHAINCODE_PATH}
    npm install
    cd -
    
    peer lifecycle chaincode package ${CHAINCODE_NAME}.tar.gz \
        --path ${CHAINCODE_PATH} \
        --lang node \
        --label ${CHAINCODE_NAME}_${CHAINCODE_VERSION}
    
    printMessage "✅ Chaincode packaged"
}

# Install chaincode on all peers
function installChaincode() {
    printMessage "Installing chaincode on all peers..."
    
    # Install on Hospital peer0
    printInfo "Installing on peer0.hospital.ehr.com..."
    export CORE_PEER_LOCALMSPID="HospitalMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/hospital/peers/peer0.hospital.ehr.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/hospital/users/Admin@hospital.ehr.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
    peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
    
    # Install on Clinic peer0
    printInfo "Installing on peer0.clinic.ehr.com..."
    export CORE_PEER_LOCALMSPID="ClinicMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/clinic/peers/peer0.clinic.ehr.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/clinic/users/Admin@clinic.ehr.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
    peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
    
    # Install on Lab peer0
    printInfo "Installing on peer0.lab.ehr.com..."
    export CORE_PEER_LOCALMSPID="LabMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/lab/peers/peer0.lab.ehr.com/tls/ca.crt
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/lab/users/Admin@lab.ehr.com/msp
    export CORE_PEER_ADDRESS=localhost:10051
    peer lifecycle chaincode install ${CHAINCODE_NAME}.tar.gz
    
    printMessage "✅ Chaincode installed on all peers"
}

# Main deployment function
function deployNetwork() {
    printMessage "========================================="
    printMessage "  Deploying Hyperledger Fabric Network  "
    printMessage "========================================="
    echo ""
    
    checkPrerequisites
    generateCrypto
    generateChannelArtifacts
    startNetwork
    
    printMessage "Waiting for network to stabilize..."
    sleep 10
    
    createChannel
    joinChannel
    packageChaincode
    installChaincode
    
    echo ""
    printMessage "========================================="
    printMessage "  ✅ NETWORK DEPLOYED SUCCESSFULLY!     "
    printMessage "========================================="
    echo ""
    printInfo "Network Status:"
    printInfo "  - 4 Peer nodes running"
    printInfo "  - 3 Orderer nodes running"
    printInfo "  - 4 Certificate Authorities running"
    printInfo "  - Channel '${CHANNEL_NAME}' created"
    printInfo "  - Chaincode '${CHAINCODE_NAME}' installed"
    echo ""
    printInfo "Next steps:"
    printInfo "  1. Approve and commit chaincode"
    printInfo "  2. Test transactions"
    printInfo "  3. Connect backend application"
}

# Run deployment
deployNetwork
