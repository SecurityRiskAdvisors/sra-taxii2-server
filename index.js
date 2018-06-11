'use strict';

const
    express = require('express'),
    expressHandlebars = require('express-handlebars'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    mongooseConnect = require('./server/lib/mongoose-connect'),
    passport = require('passport'),
    BasicStrategy = require('passport-http').BasicStrategy,
    axios = require('axios'),
    renderResponse = require('./server/middleware/render-response'),
    https = require('https'),
    roles = require('./server/middleware/roles'),
    buildError = require('./server/errors'),
    errorHandler = require('./server/middleware/error-handler');
// @TODO - add and use helmet for HSTS and stuff https://github.com/helmetjs/helmet

require('dotenv').config();

let app = express();

let routes = require('./server/routes');

app.set('env', process.env.ENVIRONMENT);
app.set('viewDir', process.env.VIEW_DIR);
// @TODO - remove dupe after helmet
app.disable('x-powered-by');


// @TODO - this needs try catch with repeats.  Mongo isn't available when app starts 
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
            console.log(err);
            return done(buildError(401,err));
        }
    }
));
  
app.use(bodyParser.json({ type: '*/*' }));
app.use(roles.middleware());

app.engine('.hbs', expressHandlebars({
    defaultLayout: 'default',
    helpers: { json: function (context) { return JSON.stringify(context); } },
    layoutsDir: process.env.VIEW_DIR + '/layouts',
    extname: '.hbs'
}));

app.set('views', app.get('viewDir'));
app.set('view engine', '.hbs');

routes.init(app); 

app.use(renderResponse);
app.use(errorHandler);


module.exports = app;