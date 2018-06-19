'use strict';

const buildError = require('../../errors');
const ApiRootModel = require('sra-taxii2-server-model/models/apiroot');

const getApiRoots = (req, res, next) => {
    res.data = mockResponse;
    next();
}

const getApiRootById = async (req, res, next) => {
    let paramId = req.params.apiRootId || 0;

    try {
        let apiRootResult = await ApiRootModel.findOne({name: paramId});

        if(apiRootResult == null) {
            return next(buildError(404, new Error("no apiroot found")));
        }

        res.data = {
            title: apiRootResult.name,
            description: apiRootResult.description || '',
            "versions": ["taxii-2.0"],
            "max_content_length": 9765625
        };
        
        res.status(200);
        return next();
    } 
    catch (err) {
        next(buildError(500, err));
    }
}

module.exports = {
    getApiRoots: getApiRoots,
    getApiRootById: getApiRootById
};
