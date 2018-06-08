'use strict'

const buildError = require('../../errors');
const ApiRootModel = require('sra-taxii2-server-model/models/apiroot');

const getDiscoveryData = async (req, res, next) => {

    try {
        let apiRootsResult = await ApiRootModel.find({});
        let defaultApiRoot = apiRootsResult.filter(x => x.default);

        res.data = {
            title: process.env.TAXII_TITLE,
            description: process.env.TAXII_DESCRIPTION,
            contact: process.env.TAXII_CONTACT,
            default: req.protocol + '://' + req.get('host') + '/' + defaultApiRoot[0].name,
            api_roots: apiRootsResult.map(x => req.protocol + '://' + req.get('host') + '/' + x.name)
        };
        
        return next();
    } 
    catch (err) {
        next(buildError(500, err));
    }
}

module.exports = {
    getDiscoveryData: getDiscoveryData
};