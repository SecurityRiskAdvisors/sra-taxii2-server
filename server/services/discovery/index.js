'use strict'

const buildError = require('../../errors');

const mockResponse = {
    "title": "Some TAXII Server",
    "description": "This TAXII Server contains a listing of...",
    "contact": "string containing contact information",
    "default": "https://example.com/api2/",
    "api_roots": [
        "https://example.com/api1/",
        "https://example.com/api2/",
        "https://example.net/trustgroup1/"
    ]
};

const getDiscoveryData = (req, res, next) => {
    res.data = mockResponse;
    next();
}

module.exports = {
    getDiscoveryData: getDiscoveryData
};