'use strict';

module.exports = (req, res, next) => {
    const statusCode = res.statusCode || 404;
    res.status(statusCode);
    
    // @TODO - this is hardcoded for now, how to handle?
    res.data = res.data ? res.data : {
        "title": "Not Found",
        "description": "The requested resource could not be found.",
        "http_status": 404
    };

    // respond with html page
    if (req.accepts('html')) {
        let renderTemplate = res.locals.taxiiRenderTemplate ? res.locals.taxiiRenderTemplate : process.env.BASE_TEMPLATE
        let renderTitle = res.locals.taxiiRenderTitle ? res.locals.taxiiRenderTitle : "Error";
        return res.render(renderTemplate, {
            title: renderTitle,
            data: res.data
        });
    } 

    res.setHeader('content-type', 'application/vnd.oasis.taxii+json; version=2.0');
    return res.send(res.data);
};