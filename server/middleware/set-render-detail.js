const setRenderDetail = function (title, templateLocation = null) {

    let renderTemplate = process.env.BASE_TEMPLATE;
    if(templateLocation !== null) {
        renderTemplate = templateLocation;
    }

    return function (req, res, next) {
        res.locals.taxiiRenderTemplate = renderTemplate;
        res.locals.taxiiRenderTitle = title;
        return next();
    };
};

module.exports = setRenderDetail;