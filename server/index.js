'use strict';

const
    http = require('http'),
    https = require('https'),
    fs = require('fs');

let app = require('../index');

// @TODO - add and use helmet for HSTS and stuff https://github.com/helmetjs/helmet

let sslCertDir = process.env.CERT_DIR.replace(/^(.+?)\/*?$/, "$1");

let hostname = process.env.HOSTNAME,
    httpPort = process.env.HTTP_PORT,
    httpsPort = process.env.HTTPS_PORT,
    sslOptions = {
        key: fs.readFileSync(sslCertDir + '/taxii-server.key'),
        cert: fs.readFileSync(sslCertDir + '/taxii-server.crt'),
        ca: fs.readFileSync(sslCertDir + '/taxiiRootCA.pem'), 
    };

http.createServer(app).listen(httpPort, function () {
    console.log('Taxii HTTP redirect server listening on - http://' + hostname + ':' + httpPort);
});

https.createServer(sslOptions, app).listen(httpsPort, function () {
    console.log('HTTPS Taxii server listening on - https://' + hostname + ':' + httpsPort);
});


