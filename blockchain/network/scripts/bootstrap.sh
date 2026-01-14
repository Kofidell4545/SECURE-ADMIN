#!/bin/bash
#
# Bootstrap script to download Hyperledger Fabric binaries and Docker images
#

set -e

# Fabric version
FABRIC_VERSION=2.5.0
CA_VERSION=1.5.5

echo "========================================="
echo "Downloading Hyperledger Fabric ${FABRIC_VERSION}"
echo "========================================="

# Create bin directory if it doesn't exist
mkdir -p ../bin

# Download Fabric binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- ${FABRIC_VERSION} ${CA_VERSION} -d -s

# Move binaries to bin directory
if [ -d "fabric-samples/bin" ]; then
    cp -r fabric-samples/bin/* ../bin/
    rm -rf fabric-samples
fi

# Add bin directory to PATH
export PATH=$(pwd)/../bin:$PATH

echo ""
echo "========================================="
echo "Bootstrap completed successfully!"
echo "========================================="
echo ""
echo "Fabric binaries installed in: $(pwd)/../bin"
echo ""
echo "Next steps:"
echo "1. ./scripts/network.sh up createChannel -c ehr-channel"
echo "2. ./scripts/network.sh deployCC -ccn ehr-contract"
echo ""
