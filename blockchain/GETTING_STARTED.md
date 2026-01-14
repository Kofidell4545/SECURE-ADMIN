# Getting Started with Hyperledger Fabric for SECURE EHR

## Quick Start Guide

This guide will help you set up and run the Hyperledger Fabric blockchain network for the SECURE EHR system.

## Prerequisites

Before starting, ensure you have:

1. ✅ **Docker Desktop** installed and running
2. ✅ **Node.js 18+** installed
3. ✅ **Git** installed
4. ✅ At least **8GB RAM** available
5. ✅ At least **20GB disk space** available

## Step-by-Step Setup

### Step 1: Download Fabric Binaries (One-time setup)

```bash
cd blockchain/network
./scripts/bootstrap.sh
```

This will download:
- Hyperledger Fabric binaries (peer, orderer, configtxgen, etc.)
- Docker images for Fabric components
- Fabric CA binaries

**Time**: ~5-10 minutes depending on internet speed

---

### Step 2: Start the Network

```bash
./scripts/network.sh up
```

This starts:
- 4 Certificate Authorities (Hospital, Clinic, Lab, Orderer)
- Docker network for all components

**Expected output**:
```
===> Starting Hyperledger Fabric Network...
===> Creating Docker network...
===> Starting Certificate Authorities...
===> ✅ Network started successfully!

Certificate Authorities:
  - Hospital CA: http://localhost:7054
  - Clinic CA:   http://localhost:8054
  - Lab CA:      http://localhost:9054
  - Orderer CA:  http://localhost:10054
```

---

### Step 3: Verify Network Status

```bash
./scripts/network.sh status
```

You should see 4 running containers:
- `ca.hospital.ehr.com`
- `ca.clinic.ehr.com`
- `ca.lab.ehr.com`
- `ca.orderer.ehr.com`

---

### Step 4: Install Chaincode Dependencies

```bash
cd ../chaincode/ehr-contract
npm install
```

---

## Network Management

### Start Network
```bash
./scripts/network.sh up
```

### Stop Network
```bash
./scripts/network.sh down
```

### Restart Network
```bash
./scripts/network.sh restart
```

### Check Status
```bash
./scripts/network.sh status
```

---

## Troubleshooting

### Docker not running
**Error**: `Docker is not running`

**Solution**: Start Docker Desktop and wait for it to fully initialize

### Port already in use
**Error**: `port is already allocated`

**Solution**: 
```bash
# Stop the network
./scripts/network.sh down

# Check for processes using the ports
lsof -i :7054
lsof -i :8054

# Kill the processes or restart Docker
```

### Network already exists
**Warning**: `network ehr-network already exists`

**Solution**: This is normal and can be ignored. The script will use the existing network.

---

## Next Steps

Once the network is running:

1. **Phase 3**: Integrate with backend
   - Install Fabric Gateway SDK
   - Create connection profiles
   - Test blockchain operations

2. **Phase 4**: Update frontend
   - Add blockchain status indicators
   - Create audit trail viewer
   - Show file integrity verification

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Frontend (Port 3000)            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Backend API (Port 5000)            │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ PostgreSQL   │  │ Fabric Gateway  │ │
│  │   (Queries)  │  │    Client       │ │
│  └──────────────┘  └────────┬────────┘ │
└─────────────────────────────┼──────────┘
                              │
                ┌─────────────▼──────────────┐
                │  Blockchain Network        │
                │  ┌──────────────────────┐  │
                │  │ Certificate          │  │
                │  │ Authorities (4)      │  │
                │  └──────────────────────┘  │
                │                            │
                │  ┌──────────────────────┐  │
                │  │ Smart Contracts      │  │
                │  │ - Patient            │  │
                │  │ - Report             │  │
                │  │ - Transfer           │  │
                │  │ - Access Log         │  │
                │  └──────────────────────┘  │
                └────────────────────────────┘
```

---

## Useful Commands

### View Container Logs
```bash
# Hospital CA logs
docker logs ca.hospital.ehr.com

# All CA logs
docker-compose -f docker/docker-compose-ca.yaml logs -f
```

### Access Container Shell
```bash
docker exec -it ca.hospital.ehr.com sh
```

### Clean Everything (Fresh Start)
```bash
./scripts/network.sh down
docker system prune -a --volumes  # WARNING: Removes all Docker data
./scripts/network.sh up
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Docker Desktop logs
3. Ensure all prerequisites are met
4. Check Hyperledger Fabric documentation: https://hyperledger-fabric.readthedocs.io/

---

## Current Status

✅ **Phase 1**: Smart contracts created  
✅ **Phase 2**: Network infrastructure ready  
⏳ **Phase 3**: Backend integration (next)  
⏳ **Phase 4**: Frontend updates (next)  
