'use strict';

const
    apiRoute = require('./apis'),
    discoveryRoute = require('./discovery'),
    userAuthenticate = require('../middleware/user-authenticate'),
    httpsRedirect = require('../../server/middleware/https-redirect');

function init(server) {
    server.get('*', function (req, res, next) {
            console.log('Request was made to: ' + req.originalUrl);
            return next();
        }, 
        httpsRedirect, 
        userAuthenticate
        // @TODO - add userAuthorize at each router endpoint 
    );

    let unless = (path, middleware) => {
        return function(req, res, next) {
            if (path === req.path) {
                return next();
            } else {
                return middleware(req, res, next);
            }
        };
    };

    // 
    /* @TODO Discussion: is adding basic auth middleware here polluting our routing?  If so, maybe we want to 
        move it out somewhere else, making basic auth only apply to the taxii2 specific endpoints.
        That way if we eventually support another version (like the taxii 2.1 spec), if a different auth
        scheme is required we can apply it solely to that API version's controllers?
        Most logical place to move auth is probably the taxii2 controllers which will require() an authScheme that
        gets called at the router.get('*') level
    */

    server.use(unless('/taxii', apiRoute));  
    server.use('/taxii', discoveryRoute);
}

module.exports = {
    init: init
};