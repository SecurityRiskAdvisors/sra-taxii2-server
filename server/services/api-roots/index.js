'use strict';
const mongoose = require('mongoose');

const mockResponse = {
        "title": "Malware Research Group",
        "description": "A trust group setup for malware researchers",
        "versions": ["taxii-2.0"],
        "max_content_length": 9765625
       };


const getApiRoots = (req, res, next) => {
    res.data = mockResponse;
    next();
}

const getApiRootById = (req, res, next) => {
    let id = req.params.apiRootId || 0,
        result = {};

    res.data = mockResponse;
    next();
}

module.exports = {
    getApiRoots: getApiRoots,
    getApiRootById: getApiRootById
};
