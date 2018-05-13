const passport = require('passport');
const buildError = require('../errors');

module.exports = (req, res, next) => {
    passport.authenticate('basic', function (err, user, info) {
        if (err) { 
            // login error
            return next(buildError(401)); 
        }

        if (!user) { 
            return next(buildError(401));
        }

        req.logIn(user, { session: false }, function (err) {
            if (err) { 
                return next(buildError(500, err)); 
            }
            return next();
        });
    })(req, res, next);
}