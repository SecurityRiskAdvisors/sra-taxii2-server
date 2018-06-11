const renderResponse = require('./render-response');
const verror = require('verror');


module.exports = (err, req, res, next) => {
    res.data = verror.info(err);

    res.status(res.data.http_status);

    res.locals.taxiiRenderTemplate = 'base-json';
    res.locals.taxiiRenderTitle = 'Error';
    renderResponse(req, res, next);
}