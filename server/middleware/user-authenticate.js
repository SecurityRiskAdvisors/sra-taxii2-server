const passport = require('passport');
const buildError = require('../errors');

module.exports = (req, res, next) => {
    // this needs some rethinking... 
    let test = passport.authenticate('basic', { session: false })
    test(req,res,next);
}