# sra-taxii2-server

**Note**: this is a project preview, installation and use process is not streamlined.  This server is reliant on the sra-taxii2-manager-server project for the time being as well.

Taxii2 server based on https://docs.google.com/document/d/1Jv9ICjUNZrOnwUXtenB1QcnBLO35RnjQcJLsa1mGSkI/pub#h.1fg89uogyma3

Uses Node.js with MongoDB backend.

Designed to be a full implementation of the spec with a separate manager application for easier integration into other projects or standalone use.

## Installation ##

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

**Create self-signed certificates for dev/testing:**

**Note**: The project currently expects a cert passphrase of testpw.  Change this in the app.js/index.js of the base server for the manager and taxii server project if you want to use a different passphrase for testing.  Just a reminder - this project is not production ready.  This setup is for development and testing.

```bash
sudo mkdir /opt/taxii/certs
cd /opt/taxii/certs
sudo openssl req -x509 -newkey rsa:2048 -keyout keytmp.pem -out cert.pem -days 365
sudo openssl rsa -in keytmp.pem -out key.pem
```

**Start the TAXII server**

(you may not need sudo depending on how you set your docker perms)
```bash
cd <location_to_your_taxii2_dir>/taxii2/sra-taxii2-server
sudo docker-compose up
```

## Usage ##

**Default username:** admin@example.com

**Default pw:** admin

Use Postman or a taxii2 client to talk to taxii endpoints like https://localhost:3003/taxii

Endpoints support filtering like
https://localhost:3003/apiroot1/collections/9ee8a9b3-da1b-45d1-9cf6-8141f7039f82/objects?added_after=2018-05-08T21:07:34.514Z

The server also supports HTTP requests to taxii endpoints and will render them differently for browser viewing.

The manager server API supports some CRUD operations for accounts and collections, but it's currently incomplete.

## Features ##

Full Taxii 2.0 spec minus POST, Status, and complete error-handling related to content types and other scenarios

The POST side to add STIX 2 objects to a collection (and status to check on the progress of imports) will be handled by a deferred job queue at https://github.com/SecurityRiskAdvisors/sra-taxii2-server-queue but it's not wired up yet.  The queue functionality was run through some basic tests and is working, it just needs REST code in the server and some shared volume to share uploaded files.  

## Tests ##

To be implemented
