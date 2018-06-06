const suggestContentType = function (contentType = null) {

    let headerContentType = process.env.TAXII_CONTENT_TYPE;

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