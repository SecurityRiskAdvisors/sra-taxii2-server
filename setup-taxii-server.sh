#!/bin/bash
# This script will test if you have given a leap year or not.

echo "Interactive setup script for SRA Taxii 2.0 Server."
echo "========================================================================"
echo "  Notes: "
echo "      Input defaults are shown in [BRACKETS]"
echo "      Script requires git, openssl, docker installed."
echo ""

if [ "$(id -u)" != "0" ]; then
	echo "Exiting... setup must be run as sudo/root.  Please run sudo ./setup-taxii-server.sh."
	exit 1
fi

RUN_USER="$(who|awk '{print $1}')"
TAXII_CERT_DIR=/opt/taxii/certs

echo "Running as sudo/root and creating project files with user privileges for $RUN_USER" 
echo ""

read -e -p "Installation directory (full path if using home dir, don't use ~) [./]: " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-"./"}

if [[ $INSTALL_DIR == *~* ]]
then
  echo "You entered ~. I give up."
  exit 1
fi

if [[ -d $INSTALL_DIR ]]
then
  echo "Using installation dir - $INSTALL_DIR" 
else
  echo "Creating installation dir - $INSTALL_DIR" 
  mkdir -p $INSTALL_DIR
fi

echo "Downloading git projects to installation directory..."
mkdir -p $INSTALL_DIR/sra-taxii2-server
if [ -n "$(ls -A $INSTALL_DIR/sra-taxii2-server)" ]; then
   echo "Taxii server installation directory is not empty, exiting..."
   exit 1
fi
git clone https://github.com/SecurityRiskAdvisors/sra-taxii2-server.git $INSTALL_DIR/sra-taxii2-server

mkdir -p $INSTALL_DIR/sra-taxii2-manager
mkdir -p $INSTALL_DIR/sra-taxii2-manager/server
if [ -n "$(ls -A $INSTALL_DIR/sra-taxii2-manager/server)" ]; then
   echo "Taxii server manager service installation directory is not empty, exiting..."
   exit 1
fi
git clone https://github.com/SecurityRiskAdvisors/sra-taxii2-manager-server.git $INSTALL_DIR/sra-taxii2-manager/server

mkdir -p $INSTALL_DIR/sra-taxii2-server-queue
if [ -n "$(ls -A $INSTALL_DIR/sra-taxii2-server-queue)" ]; then
   echo "Taxii server queue installation directory is not empty, exiting..."
   exit 1
fi
git clone https://github.com/SecurityRiskAdvisors/sra-taxii2-server-queue.git $INSTALL_DIR/sra-taxii2-server-queue

mkdir -p /opt/taxii/filetemp

mkdir -p $TAXII_CERT_DIR
openssl req -new -x509 -days 9999 -config $INSTALL_DIR/sra-taxii2-server/dev/ca.cnf -keyout $TAXII_CERT_DIR/ca-key.pem -out $TAXII_CERT_DIR/ca-crt.pem

# taxii server certs
openssl genrsa -out $TAXII_CERT_DIR/taxii-server-key.pem 4096
openssl req -new -config $INSTALL_DIR/sra-taxii2-server/dev/taxii-server.cnf -key $TAXII_CERT_DIR/taxii-server-key.pem -out $TAXII_CERT_DIR/taxii-server-csr.pem
openssl x509 -req -extfile $INSTALL_DIR/sra-taxii2-server/dev/taxii-server.cnf -days 999 -passin "pass:password" -in $TAXII_CERT_DIR/taxii-server-csr.pem -CA $TAXII_CERT_DIR/ca-crt.pem -CAkey $TAXII_CERT_DIR/ca-key.pem -CAcreateserial -out $TAXII_CERT_DIR/taxii-server-crt.pem

# manager service certs (not used yet)
openssl genrsa -out $TAXII_CERT_DIR/taxii-manager-key.pem 4096
openssl req -new -config $INSTALL_DIR/sra-taxii2-server/dev/taxii-manager.cnf -key $TAXII_CERT_DIR/taxii-manager-key.pem -out $TAXII_CERT_DIR/taxii-manager-csr.pem
openssl x509 -req -extfile $INSTALL_DIR/sra-taxii2-server/dev/taxii-manager.cnf -days 999 -passin "pass:password" -in $TAXII_CERT_DIR/taxii-manager-csr.pem -CA $TAXII_CERT_DIR/ca-crt.pem -CAkey $TAXII_CERT_DIR/ca-key.pem -CAcreateserial -out $TAXII_CERT_DIR/taxii-manager-crt.pem

echo ""
echo "If no errors above, code downloaded and certs generated. Starting service configuration..."
echo ""

read -p "Pagination limit (max number of results returned by operation per page) [100]: " PAGINATION_LIMIT
PAGINATION_LIMIT=${PAGINATION_LIMIT:-"100"}

read -p "Server Title (displayed at discovery operation) [SRA TAXII2 Server]: " TAXII_TITLE
TAXII_TITLE=${TAXII_TITLE:-"SRA TAXII2 Server"}

read -p "Server Description (displayed at discovery operation) [Base TAXII2 Server for development and integration with other tooling]: " TAXII_DESCRIPTION
TAXII_DESCRIPTION=${TAXII_DESCRIPTION:-"Base TAXII2 Server for development and integration with other tooling"}

read -p "Server Contact (displayed at discovery operation) [https://github.com/SecurityRiskAdvisors/sra-taxii2-server]: " TAXII_CONTACT
TAXII_CONTACT=${TAXII_CONTACT:-"https://github.com/SecurityRiskAdvisors/sra-taxii2-server"}

cat > $INSTALL_DIR/sra-taxii2-server/.env <<EOF
ENVIRONMENT=local
SERVER_CONTAINER_ALIAS=sra-taxii2-server
HTTP_PORT=3000
HTTPS_PORT=3001
VIEW_DIR=./app/views
CONNECTION_STRING=mongodb://sra-taxii2-mongo:27017/
CONF_DB=taxii2config
CERT_DIR=/opt/taxii/certs
STIX_CONTENT_TYPE="application/vnd.oasis.stix+json; version=2.0"
TAXII_CONTENT_TYPE="application/vnd.oasis.taxii+json; version=2.0"
PAGINATION_LIMIT=$PAGINATION_LIMIT,
MANAGER_URL=https://sra-taxii2-manager-server:4001
JOB_QUEUE_DB=taxii2jobs
TEMP_FILE_DIR=/opt/taxii/filetemp
BASE_TEMPLATE=base-json
TAXII_TITLE="$TAXII_TITLE"
TAXII_DESCRIPTION="$TAXII_DESCRIPTION"
TAXII_CONTACT="$TAXII_CONTACT"
EOF

cat > $INSTALL_DIR/sra-taxii2-server-queue/.env <<EOF
CONNECTION_STRING=mongodb://sra-taxii2-mongo:27017/
FILE_TEMP_DIR=/opt/taxii/filetemp
EOF

chown $RUN_USER:$RUN_USER $INSTALL_DIR -R