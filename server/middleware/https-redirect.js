const config = require('../../configs');

module.exports = (req, res, next) => {
    // To handle apps behind ELB we need to look for forwarded protocol
    // req.header('X-Forwarded-Proto') === 'https'.  We'll have to specify a config option or something
    // because this is likely insecure if not behind a proxy
    if(req.secure) {
        return next();
    };

    let portSuffix = '';
    if(config.httpsPort && config.httpsPort != '443') {
        portSuffix = ':' + config.httpsPort;
    }

    res.redirect('https://' + req.hostname + portSuffix + req.url); 
};

