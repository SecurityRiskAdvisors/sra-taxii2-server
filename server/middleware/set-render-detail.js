const setRenderDetail = function (title, templateLocation = null) {

    // @TODO - grab this from config
    let renderTemplate = 'base-json';
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