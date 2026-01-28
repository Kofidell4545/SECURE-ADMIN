#!/bin/bash
#
# Complete System Health Check
# Verifies all containers and services are running
#

set -e

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SECURE EHR - System Health Check     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0

# Function to check service
check_service() {
    local name=$1
    local check_cmd=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking $name... "
    
    if eval "$check_cmd" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Running${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
        return 0
    else
        echo -e "${RED}❌ Not Running${NC}"
        return 1
    fi
}

# 1. Docker Check
echo -e "${BLUE}1. Docker Services${NC}"
check_service "Docker Daemon" "docker info"
echo ""

# 2. PostgreSQL (Secure EHR Database)
echo -e "${BLUE}2. PostgreSQL Database${NC}"
check_service "PostgreSQL Container" "docker ps | grep -q secure-postgres"
echo ""

# 3. Blockchain Network
echo -e "${BLUE}3. Hyperledger Fabric Network${NC}"
check_service "Peer0 Hospital" "docker ps | grep -q peer0.hospital.ehr.com"
check_service "Peer1 Hospital" "docker ps | grep -q peer1.hospital.ehr.com"
check_service "Peer0 Clinic" "docker ps | grep -q peer0.clinic.ehr.com"
check_service "Peer0 Lab" "docker ps | grep -q peer0.lab.ehr.com"
check_service "Orderer0" "docker ps | grep -q orderer0.ehr.com"
check_service "Orderer1" "docker ps | grep -q orderer1.ehr.com"
check_service "Orderer2" "docker ps | grep -q orderer2.ehr.com"
check_service "CA Hospital" "docker ps | grep -q ca.hospital.ehr.com"
check_service "CA Clinic" "docker ps | grep -q ca.clinic.ehr.com"
check_service "CA Lab" "docker ps | grep -q ca.lab.ehr.com"
check_service "CA Orderer" "docker ps | grep -q ca.orderer.ehr.com"
echo ""

# 4. Hyperledger Explorer
echo -e "${BLUE}4. Blockchain Explorer${NC}"
check_service "Explorer" "docker ps | grep -q explorer.ehr.com"
check_service "Explorer DB" "docker ps | grep -q explorerdb.ehr.com"
echo ""

# 5. Backend API
echo -e "${BLUE}5. Backend API${NC}"
check_service "Backend Server (Port 5000)" "curl -s http://localhost:5000/health"
echo ""

# 6. Frontend
echo -e "${BLUE}6. Frontend Dashboard${NC}"
check_service "React App (Port 3000)" "curl -s http://localhost:3000"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Health Check Summary                 ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

PERCENTAGE=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "${GREEN}✅ ALL SYSTEMS OPERATIONAL!${NC}"
    echo -e "${GREEN}   $PASSED_CHECKS/$TOTAL_CHECKS checks passed (100%)${NC}"
elif [ $PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  MOSTLY OPERATIONAL${NC}"
    echo -e "${YELLOW}   $PASSED_CHECKS/$TOTAL_CHECKS checks passed ($PERCENTAGE%)${NC}"
else
    echo -e "${RED}❌ SYSTEM ISSUES DETECTED${NC}"
    echo -e "${RED}   $PASSED_CHECKS/$TOTAL_CHECKS checks passed ($PERCENTAGE%)${NC}"
fi

echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:5000${NC}"
echo -e "  Explorer:  ${GREEN}http://localhost:8080${NC}"
echo -e "  Health:    ${GREEN}http://localhost:5000/health${NC}"
echo ""

# Detailed container status
echo -e "${BLUE}Container Details:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "peer|orderer|ca|explorer|postgres" || echo "No blockchain containers running"

echo ""
exit 0
