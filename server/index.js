'use strict';

const
    express = require('express'),
    expressHandlebars = require('express-handlebars'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    mongooseConnect = require('./lib/mongoose-connect'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    http = require('http'),
    https = require('https'),
    axios = require('axios'),
    renderResponse = require('./middleware/render-response'),
    roles = require('./middleware/roles'),
    buildError = require('./errors'),
    errorHandler = require('./middleware/error-handler');
// @TODO - add and use helmet for HSTS and stuff https://github.com/helmetjs/helmet

require('dotenv').config();

module.exports = function() {
    let server = express(),
        create,
        start;

    create = function() {
        let routes = require('./routes');

        server.set('env', process.env.ENVIRONMENT);
        server.set('httpPort', process.env.HTTP_PORT);
        server.set('httpsPort', process.env.HTTPS_PORT);
        server.set('hostname',  process.env.HOSTNAME);
        server.set('viewDir', process.env.VIEW_DIR);
        // @TODO - remove dupe after helmet
        server.disable('x-powered-by');

        let sslCertDir = process.env.CERT_DIR.replace(/^(.+?)\/*?$/, "$1");
        server.set('sslOptions', {
            key: fs.readFileSync(sslCertDir + '/key.pem'),
            cert: fs.readFileSync(sslCertDir + '/cert.pem'),
            passphrase: 'testpw'
        });

        // @TODO - this needs try catch with repeats.  Mongo isn't available when server starts 
        mongooseConnect(process.env.CONNECTION_STRING, process.env.CONF_DB, 4000);

        // @TODO - make debugging more env friendly
        /*mongoose.set('debug', function (collectionName, method, query, doc) {
            console.log("colName: ", collectionName);
            console.log("query: ", query);
            console.log("method: ", method);
        });*/

        passport.use(new BasicStrategy(
            {passReqToCallback: true},
            async function(req, username, password, done) {
                try {
                    // @TODO - DEV ONLY!!!!
                    // self signed cert
                    const agent = new https.Agent({  
                        rejectUnauthorized: false
                    });
                    const loginResult = await axios.post(process.env.MANAGER_URL + '/taxii2manager/v1/auth/login', {
                        email: username,
                        password: password
                    }, { httpsAgent: agent });

                    // for logging or whatever
                    return done(null, loginResult.data);
                } 
                catch(err) {
                    return done(buildError(401,err));
                }
            }
        ));
          
        server.use(bodyParser.json({ type: '*/*' }));
        server.use(roles.middleware());

        server.engine('.hbs', expressHandlebars({
            defaultLayout: 'default',
            helpers: { json: function (context) { return JSON.stringify(context); } },
            layoutsDir: process.env.VIEW_DIR + '/layouts',
            extname: '.hbs'
        }));

        server.set('views', server.get('viewDir'));
        server.set('view engine', '.hbs');

        routes.init(server); 

        server.use(renderResponse);
        server.use(errorHandler);
    };

    start = function() {
        let hostname = server.get('hostname'),
            httpPort = server.get('httpPort'),
            httpsPort = server.get('httpsPort'),
            sslOptions = server.get('sslOptions');

        http.createServer(server).listen(httpPort, function () {
            console.log('Taxii HTTP redirect server listening on - http://' + hostname + ':' + httpPort);
        });
        
        https.createServer(sslOptions, server).listen(httpsPort, function () {
            console.log('HTTPS Taxii server listening on - https://' + hostname + ':' + httpsPort);
        });
    };

    return {
        create: create,
        start: start
    };
};
