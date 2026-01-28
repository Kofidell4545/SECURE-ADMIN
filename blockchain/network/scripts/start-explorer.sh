#!/bin/bash
#
# Start Hyperledger Explorer
#

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Starting Hyperledger Explorer        ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if network is running
if ! docker ps | grep -q "peer0.hospital.ehr.com"; then
    echo -e "${YELLOW}⚠️  Blockchain network not running${NC}"
    echo -e "${YELLOW}   Starting network first...${NC}"
    ./network.sh up
    sleep 10
fi

# Start Explorer
echo -e "${BLUE}Starting Explorer containers...${NC}"
docker-compose -f ../docker/docker-compose-explorer.yaml up -d

echo ""
echo -e "${GREEN}✅ Hyperledger Explorer started!${NC}"
echo ""
echo -e "${BLUE}Access Explorer at:${NC}"
echo -e "  ${GREEN}http://localhost:8080${NC}"
echo ""
echo -e "${BLUE}Waiting for Explorer to initialize (30 seconds)...${NC}"
sleep 30

echo ""
echo -e "${GREEN}Explorer should now be ready!${NC}"
echo -e "${BLUE}Login credentials:${NC}"
echo -e "  Username: ${GREEN}admin${NC}"
echo -e "  Password: ${GREEN}adminpw${NC}"
