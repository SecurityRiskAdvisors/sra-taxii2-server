const renderResponse = require('./render-response');
const verror = require('verror');

module.exports = (err, req, res, next) => {
    res.data = verror.info(err);

    res.status(res.data.http_status);
    renderResponse(req, res, next);
}