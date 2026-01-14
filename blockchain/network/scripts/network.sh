#!/bin/bash
#
# Network Management Script for SECURE EHR Blockchain
# Usage: ./network.sh up|down|restart
#

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Network configuration
CHANNEL_NAME="ehr-channel"
CHAINCODE_NAME="ehr-contract"
CHAINCODE_VERSION="1.0"
CHAINCODE_SEQUENCE="1"

# Print colored message
function printMessage() {
    echo -e "${GREEN}===> $1${NC}"
}

function printError() {
    echo -e "${RED}ERROR: $1${NC}"
}

function printWarning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

# Network up
function networkUp() {
    printMessage "Starting Hyperledger Fabric Network..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        printError "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    printMessage "Creating Docker network..."
    docker network create ehr-network 2>/dev/null || true
    
    printMessage "Starting Certificate Authorities..."
    docker-compose -f docker/docker-compose-ca.yaml up -d
    
    sleep 5
    
    printMessage "✅ Network started successfully!"
    printMessage "Certificate Authorities:"
    printMessage "  - Hospital CA: http://localhost:7054"
    printMessage "  - Clinic CA:   http://localhost:8054"
    printMessage "  - Lab CA:      http://localhost:9054"
    printMessage "  - Orderer CA:  http://localhost:10054"
    echo ""
    printMessage "Next steps:"
    printMessage "1. Generate crypto materials: ./scripts/generate-crypto.sh"
    printMessage "2. Create channel: ./scripts/createChannel.sh"
    printMessage "3. Deploy chaincode: ./scripts/deployChaincode.sh"
}

# Network down
function networkDown() {
    printMessage "Stopping Hyperledger Fabric Network..."
    
    docker-compose -f docker/docker-compose-ca.yaml down
    
    # Remove Docker volumes (optional - uncomment to clean everything)
    # docker volume prune -f
    
    printMessage "Removing Docker network..."
    docker network rm ehr-network 2>/dev/null || true
    
    printMessage "✅ Network stopped successfully!"
}

# Network restart
function networkRestart() {
    printMessage "Restarting network..."
    networkDown
    sleep 2
    networkUp
}

# Show network status
function networkStatus() {
    printMessage "Network Status:"
    echo ""
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "network=ehr-network"
}

# Main script
case "$1" in
    up)
        networkUp
        ;;
    down)
        networkDown
        ;;
    restart)
        networkRestart
        ;;
    status)
        networkStatus
        ;;
    *)
        echo "Usage: $0 {up|down|restart|status}"
        echo ""
        echo "Commands:"
        echo "  up       - Start the network"
        echo "  down     - Stop the network"
        echo "  restart  - Restart the network"
        echo "  status   - Show network status"
        exit 1
        ;;
esac
