const config = require('../../configs');

const suggestContentType = function (contentType = null) {

    let headerContentType = config.taxiiContentType;

    if(contentType) {
        headerContentType = contentType
    }

    return function (req, res, next) {
        // respond with html content for browsers
        res.setHeader('content-type', req.accepts('html') ? 'text/html' : headerContentType);
        next();
    }
};

module.exports = suggestContentType;