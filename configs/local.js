'use strict';

const localConfig = {
    hostname: 'localhost',
    httpPort: 3000,
    httpsPort: 3001,
    viewDir: './app/views',
    connectionString: "mongodb://sra-taxii2-mongo:27017/",
    // if you're using a taxii management application it needs to point to the same conf DB to manage this instance
    confDb: "taxii2config",
    certDir: "/opt/taxii/certs",
    stixContentType: 'application/vnd.oasis.stix+json; version=2.0',
    taxiiContentType: 'application/vnd.oasis.taxii+json; version=2.0',
    paginationLimit: 100,
    managerUrl: 'https://sra-taxii2-manager-server:4001',
    jobQueueDb: 'taxii2jobs'
};

module.exports = localConfig;
