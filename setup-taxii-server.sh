#!/bin/bash

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

if [ -z "$1" ]; then
    read -e -p "Installation directory (full path if using home dir, don't use ~) [./]: " INSTALL_DIR
    INSTALL_DIR=${INSTALL_DIR:-"./"}
else
  INSTALL_DIR=$1
fi

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
mkdir -p /opt/taxii/sharedimport

mkdir -p $TAXII_CERT_DIR
# generate CA cert
openssl genrsa -out $TAXII_CERT_DIR/taxiiRootCA.key 4096
openssl req -new -x509 -days 9999 -nodes -key $TAXII_CERT_DIR/taxiiRootCA.key -sha256 -out $TAXII_CERT_DIR/taxiiRootCA.pem -config $INSTALL_DIR/sra-taxii2-server/dev/taxii-ca.cnf

# taxii server certs
openssl req -new -sha256 -nodes -out $TAXII_CERT_DIR/taxii-server.csr -newkey rsa:4096 -keyout $TAXII_CERT_DIR/taxii-server.key -config $INSTALL_DIR/sra-taxii2-server/dev/server/taxii-server.cnf
openssl x509 -req -in $TAXII_CERT_DIR/taxii-server.csr -CA $TAXII_CERT_DIR/taxiiRootCA.pem -CAkey $TAXII_CERT_DIR/taxiiRootCA.key -CAcreateserial -out $TAXII_CERT_DIR/taxii-server.crt -days 3650 -passin "pass:!!TAXII_PASSWORD_REPLACE!!" -sha256 -extfile $INSTALL_DIR/sra-taxii2-server/dev/server/v3.ext
openssl x509 -in $TAXII_CERT_DIR/taxii-server.crt -out $TAXII_CERT_DIR/taxii-server.pem -outform PEM

# manager service certs (not used yet)
openssl req -new -sha256 -nodes -out $TAXII_CERT_DIR/taxii-manager.csr -newkey rsa:4096 -keyout $TAXII_CERT_DIR/taxii-manager.key -config $INSTALL_DIR/sra-taxii2-server/dev/manager/taxii-manager.cnf
openssl x509 -req -in $TAXII_CERT_DIR/taxii-manager.csr -CA $TAXII_CERT_DIR/taxiiRootCA.pem -CAkey $TAXII_CERT_DIR/taxiiRootCA.key -CAcreateserial -out $TAXII_CERT_DIR/taxii-manager.crt -days 3650 -passin "pass:!!TAXII_PASSWORD_REPLACE!!" -sha256 -extfile $INSTALL_DIR/sra-taxii2-server/dev/manager/v3.ext
openssl x509 -in $TAXII_CERT_DIR/taxii-manager.crt -out $TAXII_CERT_DIR/taxii-manager.pem -outform PEM

echo ""
echo "If no errors above, code downloaded and certs generated. Starting service configuration..."
echo ""

if [ -z "$2" ]; then
  read -p "Pagination limit (max number of results returned by operation per page) [100]: " PAGINATION_LIMIT
  PAGINATION_LIMIT=${PAGINATION_LIMIT:-"100"}
else
  PAGINATION_LIMIT=$2
fi

if [ -z "$3" ]; then
  read -p "Server Title (displayed at discovery operation) [SRA TAXII2 Server]: " TAXII_TITLE
  TAXII_TITLE=${TAXII_TITLE:-"SRA TAXII2 Server"}
else
  TAXII_TITLE=$3
fi

if [ -z "$4" ]; then
  read -p "Server Description (displayed at discovery operation) [Base TAXII2 Server for development and integration with other tooling]: " TAXII_DESCRIPTION
  TAXII_DESCRIPTION=${TAXII_DESCRIPTION:-"Base TAXII2 Server for development and integration with other tooling"}
else
  TAXII_DESCRIPTION=$4
fi

if [ -z "$5" ]; then
  read -p "Server Contact (displayed at discovery operation) [https://github.com/SecurityRiskAdvisors/sra-taxii2-server]: " TAXII_CONTACT
  TAXII_CONTACT=${TAXII_CONTACT:-"https://github.com/SecurityRiskAdvisors/sra-taxii2-server"}
else
  TAXII_CONTACT=$5
fi

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
ALLOW_HTTP=false
EOF

cat > $INSTALL_DIR/sra-taxii2-server-queue/.env <<EOF
CONNECTION_STRING=mongodb://sra-taxii2-mongo:27017/
FILE_TEMP_DIR=/opt/taxii/sharedimport
EOF

cat > $INSTALL_DIR/sra-taxii2-manager/server/.env <<EOF
FILE_TEMP_DIR=/opt/taxii/sharedimport
EOF

chown $RUN_USER:$RUN_USER $INSTALL_DIR -R

