module.exports = (req, res, next) => {
    // To handle apps behind ELB we need to look for forwarded protocol
    // req.header('X-Forwarded-Proto') === 'https'.  We'll have to specify a config option or something
    // because this is likely insecure if not behind a proxy
    if(req.secure) {
        return next();
    };

    let portSuffix = '';
    if(process.env.HTTPS_PORT && process.env.HTTPS_PORT != '443') {
        portSuffix = ':' + process.env.HTTPS_PORT;
    }

    res.redirect('https://' + req.hostname + portSuffix + req.url); 
};

