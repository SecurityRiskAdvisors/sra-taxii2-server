#!/bin/bash
# This script will test if you have given a leap year or not.

echo "Interactive setup script for SRA Taxii 2.0 Server."
echo "========================================================================"
echo "  Notes: "
echo "      Input defaults are shown in [BRACKETS]"
echo "      Script requires git, docker installed for now."
echo ""

if [ "$(id -u)" != "0" ]; then
	echo "Exiting... setup must be run as sudo/root for now.  Please run sudo ./setup-taxii-server.sh."
	exit 1
fi

RUN_USER="$(who|awk '{print $1}')"
TAXII_CERT_DIR=/opt/taxii/certs/temp

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


mkdir -p $TAXII_CERT_DIR
openssl req -new -x509 -days 9999 -config $INSTALL_DIR/sra-taxii2-server/dev/ca.cnf -keyout $TAXII_CERT_DIR/ca-key.pem -out $TAXII_CERT_DIR/ca-crt.pem

# taxii server certs
openssl genrsa -out $TAXII_CERT_DIR/taxii-server-key.pem 4096
openssl req -new -config $INSTALL_DIR/sra-taxii2-server/dev/taxii-server.cnf -key $TAXII_CERT_DIR/taxii-server-key.pem -out $TAXII_CERT_DIR/taxii-server-csr.pem
openssl x509 -req -extfile $INSTALL_DIR/sra-taxii2-server/dev/taxii-server.cnf -days 999 -passin "pass:password" -in $TAXII_CERT_DIR/taxii-server-csr.pem -CA $TAXII_CERT_DIR/ca-crt.pem -CAkey $TAXII_CERT_DIR/ca-key.pem -CAcreateserial -out $TAXII_CERT_DIR/taxii-server-crt.pem

chown $RUN_USER:$RUN_USER $INSTALL_DIR -R

#if (( ("$year" % 400) == "0" )) || (( ("$year" % 4 == "0") && ("$year" % 100 != "0") )); then
#  echo "$year is a leap year."
#else
#  echo "This is not a leap year."
#fi
