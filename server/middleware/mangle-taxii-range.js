
module.exports = (req, res, next) => {
    // Taxii spec doesn't seem to follow RFC it links here https://tools.ietf.org/html/rfc7233#section-2.2
    // it wants "items 10-30" where RFC7233 wants "items=10-30"
    // We're sticking with the RFC internally since the middleware library supports it and it makes more sense
    // but we'll mangle taxiified range headers just to ensure compatability with clients using the spec as-is
    let rawRangeHeader = req.get("Range");
    if(rawRangeHeader) {
        if(/items \d+\-\d+$/.test(rawRangeHeader)) {
            req.headers['range'] = rawRangeHeader.replace(" ", "=");
        }
    };

    return next();
};