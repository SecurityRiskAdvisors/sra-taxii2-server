#!/bin/bash
# Cloudformation setup.
# Use your CF template to replace the following template vars surrounded by !!'s:
# TAXII_PASSWORD_REPLACE
# TAXII_TITLE_REPLACE
# TAXII_DESC_REPLACE
# TAXII_CONTACT_REPLACE


TAXII_CERT_DIR=/opt/taxii/certs
INSTALL_DIR=/opt/taxii/service
TAXII_TITLE="!!TAXII_TITLE_REPLACE!!"
TAXII_DESCRIPTION="!!TAXII_DESC_REPLACE!!"
TAXII_CONTACT=!!TAXII_CONTACT_REPLACE!!

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

sed -i 's/!!TAXII_PASSWORD_REPLACE2!!/!!TAXII_PASSWORD_REPLACE!!/' $INSTALL_DIR/sra-taxii2-server/dev/ca.cnf 

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
openssl req -new -x509 -days 9999 -config $INSTALL_DIR/sra-taxii2-server/dev/ca.cnf -keyout $TAXII_CERT_DIR/ca-key.pem -out $TAXII_CERT_DIR/ca-crt.pem

# taxii server certs
openssl genrsa -out $TAXII_CERT_DIR/taxii-server-key.pem 4096
openssl req -new -config $INSTALL_DIR/sra-taxii2-server/dev/taxii-server.cnf -key $TAXII_CERT_DIR/taxii-server-key.pem -out $TAXII_CERT_DIR/taxii-server-csr.pem
openssl x509 -req -extfile $INSTALL_DIR/sra-taxii2-server/dev/taxii-server.cnf -days 999 -passin "pass:!!TAXII_PASSWORD_REPLACE!!" -in $TAXII_CERT_DIR/taxii-server-csr.pem -CA $TAXII_CERT_DIR/ca-crt.pem -CAkey $TAXII_CERT_DIR/ca-key.pem -CAcreateserial -out $TAXII_CERT_DIR/taxii-server-crt.pem

# manager service certs (not used yet)
openssl genrsa -out $TAXII_CERT_DIR/taxii-manager-key.pem 4096
openssl req -new -config $INSTALL_DIR/sra-taxii2-server/dev/taxii-manager.cnf -key $TAXII_CERT_DIR/taxii-manager-key.pem -out $TAXII_CERT_DIR/taxii-manager-csr.pem
openssl x509 -req -extfile $INSTALL_DIR/sra-taxii2-server/dev/taxii-manager.cnf -days 999 -passin "pass:!!TAXII_PASSWORD_REPLACE!!" -in $TAXII_CERT_DIR/taxii-manager-csr.pem -CA $TAXII_CERT_DIR/ca-crt.pem -CAkey $TAXII_CERT_DIR/ca-key.pem -CAcreateserial -out $TAXII_CERT_DIR/taxii-manager-crt.pem

echo ""
echo "If no errors above, code downloaded and certs generated. Starting service configuration..."
echo ""

cat > $INSTALL_DIR/sra-taxii2-server/.env <<EOF
ENVIRONMENT=local
SERVER_CONTAINER_ALIAS=sra-taxii2-server
HTTP_PORT=80
HTTPS_PORT=443
VIEW_DIR=./app/views
CONNECTION_STRING=mongodb://sra-taxii2-mongo:27017/
CONF_DB=taxii2config
CERT_DIR=/opt/taxii/certs
STIX_CONTENT_TYPE="application/vnd.oasis.stix+json; version=2.0"
TAXII_CONTENT_TYPE="application/vnd.oasis.taxii+json; version=2.0"
PAGINATION_LIMIT=100,
MANAGER_URL=http://sra-taxii2-manager-server:4001
JOB_QUEUE_DB=taxii2jobs
TEMP_FILE_DIR=/opt/taxii/filetemp
BASE_TEMPLATE=base-json
TAXII_TITLE="$TAXII_TITLE"
TAXII_DESCRIPTION="$TAXII_DESCRIPTION"
TAXII_CONTACT="$TAXII_CONTACT"
ALLOW_HTTP=true
EOF

cat > $INSTALL_DIR/sra-taxii2-server-queue/.env <<EOF
CONNECTION_STRING=mongodb://sra-taxii2-mongo:27017/
FILE_TEMP_DIR=/opt/taxii/sharedimport
EOF

cat > $INSTALL_DIR/sra-taxii2-manager/server/.env <<EOF
FILE_TEMP_DIR=/opt/taxii/sharedimport
EOF

echo "Service configuration complete..."