# Hyperledger Fabric Network for SECURE EHR

This directory contains the Hyperledger Fabric blockchain network configuration for the SECURE EHR system.

## Network Architecture

### Organizations
- **Hospital Org**: Main healthcare provider (2 peers)
- **Clinic Org**: Partner clinic (1 peer)
- **Lab Org**: Diagnostic laboratory (1 peer)
- **Orderer Org**: Ordering service (3 Raft orderers)

### Channels
- **ehr-channel**: Main channel for patient records, reports, and transfers
- **lab-results-channel**: Private channel for Hospital + Lab only

## Prerequisites

1. **Docker Desktop** - Latest version
2. **Docker Compose** - v2.x
3. **Hyperledger Fabric Binaries** - v2.5.x
4. **Node.js** - v18+

## Quick Start

```bash
# 1. Download Fabric binaries and Docker images
./scripts/bootstrap.sh

# 2. Start the network
./scripts/network.sh up createChannel -c ehr-channel

# 3. Deploy chaincode
./scripts/network.sh deployCC -ccn ehr-contract -ccp ../chaincode/ehr-contract -ccl javascript

# 4. Test the network
./scripts/test-network.sh
```

## Directory Structure

```
network/
├── docker/                    # Docker Compose files
│   ├── docker-compose-ca.yaml
│   ├── docker-compose-orderer.yaml
│   └── docker-compose-peers.yaml
├── organizations/             # Crypto materials for orgs
│   ├── hospital/
│   ├── clinic/
│   ├── lab/
│   └── orderer/
├── channel-artifacts/         # Channel configuration
└── scripts/                   # Network management scripts
    ├── bootstrap.sh
    ├── network.sh
    ├── createChannel.sh
    └── deployChaincode.sh
```

## Network Components

### Peers
- `peer0.hospital.ehr.com:7051`
- `peer1.hospital.ehr.com:8051`
- `peer0.clinic.ehr.com:9051`
- `peer0.lab.ehr.com:10051`

### Orderers
- `orderer0.ehr.com:7050`
- `orderer1.ehr.com:8050`
- `orderer2.ehr.com:9050`

### Certificate Authorities
- `ca.hospital.ehr.com:7054`
- `ca.clinic.ehr.com:8054`
- `ca.lab.ehr.com:9054`

## Next Steps

After network setup:
1. Deploy chaincode (smart contracts)
2. Configure backend Fabric Gateway client
3. Integrate with existing EHR API
4. Test end-to-end flow
