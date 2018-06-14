# sra-taxii2-server

**Note**: this is a project preview, not intended for production services yet.  

Taxii2 server based on https://docs.google.com/document/d/1Jv9ICjUNZrOnwUXtenB1QcnBLO35RnjQcJLsa1mGSkI/pub#h.1fg89uogyma3

Uses Node.js with MongoDB backend.

## Installation (Easy) ##

#### Requirements ####
* Modern Linux installation (preferably Ubuntu, Mint, Debian, Manjaro, Arch, CentOS or something similar) with sudo permissions
* Expects these installed packages:
  * docker
  * docker-compose
  * openssl
  * git

**Download and run the installation script**
```bash
wget https://raw.githubusercontent.com/SecurityRiskAdvisors/sra-taxii2-server/master/setup-taxii-server.sh 
sudo ./setup-taxii-server.sh
cd <installation_directory>
sudo docker-compose up
```

## Usage ##

**Default username:** admin@example.com

**Default pw:** admin

Use Postman or a taxii2 client to talk to taxii endpoints like https://localhost:3003/taxii

For Postman, you'll need to turn off SSL cert verification or make your host trust the CA cert.

Endpoints support filtering like
https://localhost:3003/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82/objects?added_after=2018-05-08T21:07:34.514Z

The server also supports HTTP requests to taxii endpoints and will render them differently for browser viewing.

The manager server API supports some CRUD operations for accounts and collections, but it's currently incomplete.

## Installation (Hard/Dev) ##

#### Linux Docker Host ####

##### Run the following commands on your Linux Host #####

**Make a directory to house taxii server and manager:**
```bash
mkdir taxii2
cd taxii2
```

**Clone taxii 2 server into its own subdirectory:**

(Make sure you're in the taxii2 directory you created above)
```bash
mkdir sra-taxii2-server
cd sra-taxii2-server
git clone https://github.com/SecurityRiskAdvisors/sra-taxii2-server.git .
cd ..
```

**Clone taxii 2 manager server into its own subdirectory:**

(Make sure you're in the taxii2 directory you created above)
```bash
mkdir sra-taxii2-manager
cd sra-taxii2-manager
mkdir server
cd server
git clone https://github.com/SecurityRiskAdvisors/sra-taxii2-manager-server.git .
cd ..
```

**Clone taxii 2 server queue into its own subdirectory:**

(Make sure you're in the taxii2 directory you created above)
```bash
mkdir sra-taxii2-server-queue
cd sra-taxii2-server-queue
git clone https://github.com/SecurityRiskAdvisors/sra-taxii2-server-queue.git .
cd ..
```

**Create self-signed certificates for dev/testing:**

**Note**: Uses self-signed certs and a local cert authority, not a good idea to use this stuff in prod.

```bash
sudo mkdir –p /opt/taxii/certs
cd /opt/taxii/certs
```

Follow the guide here: https://engineering.circle.com/https-authorized-certs-with-node-js-315e548354a2 and put all your certs in /opt/taxii/certs.  sra-taxii2-server expects taxii-server-key.pem and taxii-server-crt.pem.  sra-taxii2-manager-server expects taxii-manager-key.pem and taxii-manager-crt.pem

**Start the TAXII server**

(you may not need sudo depending on how you set your docker perms)
```bash
cd <location_to_your_taxii2_dir>/taxii2/sra-taxii2-server
sudo docker-compose up
```


## Features ##

Full Taxii 2.0 spec minus complete error-handling related to content types and other scenarios. 

The POST side to add STIX 2 objects to a collection (and status to check on the progress of imports) is handled by a deferred job queue at https://github.com/SecurityRiskAdvisors/sra-taxii2-server-queue.  The queue functionality is roughed-in and was done this way to support larger STIX bundle uploads from other REST operations in the future.  The queue streams in files and processes them piecemeal rather than blocking to accept and parse a huge upload in memory.  

## Notes/Design Decisions ##

Designed to be a full implementation of the spec with a separate manager application for easier integration into other projects or standalone use.  This server is reliant on the sra-taxii2-manager-server and sra-taxii2-server-queue project.

## Tests ##

**Note**: Tests are integration only and expect some defaults for now.
```bash
sudo docker exec -it sra-taxii2-server /bin/bash 
npm test
```
