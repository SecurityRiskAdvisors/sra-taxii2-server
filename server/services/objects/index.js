'use strict';

const ModelFactory = require('../../../helpers/model-factory')
const mongoose = require('mongoose');
const getPaginatedTaxiiRequest = require('../../lib/get-paginated-taxii-request');
const uuid4 = require('uuid/v4');
const buildError = require('../../errors');

const mockPostObjectsResponse = {
    "id": "2d086da7-4bdc-4f91-900e-d77486753710",
    "status": "pending",
    "request_url": "https://example.com/api1/collections/91a7b528-80eb-42ed-a74dc6fbd5a26116/objects",
    "request_timestamp": "2016-11-02T12:34:34.12345Z",
    "total_count": 4,
    "success_count": 1,
    "successes": [
    "indicator--c410e480-e42b-47d1-9476-85307c12bcbf"
    ],
    "failure_count": 0,
    "pending_count": 3
};

const getObjects = (ModelFactory) => async (req, res, next) => {

    // Using the model factory here because we want to cache and share mongo connections - each api root is its own db which means a new connect

    try {
        let models = ModelFactory(req.params.apiRootId, req.params.collectionName);

        // Express res and req objects have null prototypes so they don't get hasOwnProperty
        let query = (Object.prototype.hasOwnProperty.call(res.locals, 'taxiiMongooseFilter')) ? res.locals.taxiiMongooseFilter : {};
        let objectsResponse =  await getPaginatedTaxiiRequest(
            req, 
            res, 
            next, 
            models.object, 
            query, 
            {
                sort: { createdAt: 1},
                leanWithId: false,
                select: '-_id -__v -updatedAt -createdAt'
            }, 
            null
        );

        res.data = {
            id: "bundle--" + uuid4(),
            type: "bundle",
            spec_version: "2.0",
            objects: objectsResponse
        };
        
        return next();
    } 
    catch(err) {
        next(buildError(500, err));
    }
}

const getObjectById = async(req, res, next) => {
    let paramId = req.params.objectId || 0;

    try {
        let models = ModelFactory(req.params.apiRootId, req.params.collectionName);
        let query = (Object.prototype.hasOwnProperty.call(res.locals, 'taxiiMongooseFilter')) ? res.locals.taxiiMongooseFilter : {id:paramId};
        let objectResult = await models.object.find(query).select('-_id -__v -updatedAt -createdAt');
        let bundleType = '';

        // this logic is pretty rough, cleanup?
        if(objectResult === undefined || objectResult.length == 0 || !objectResult[0].toJSON().hasOwnProperty('type')) {
            bundleType = "objects"
        } else {
            let obj = objectResult[0].toJSON();
            bundleType = obj["type"] + 's';
        }

        res.data = {
            id: "bundle--" + uuid4(),
            type: "bundle",
            spec_version: "2.0"
        };
        res.data[bundleType] = objectResult;
        
        return next();
    } 
    catch (err) {
        next(buildError(500, err));
    }


}

// @TODO - not implemented
const postObjects = (req, res) => {
    res.send(mockPostObjectsResponse);
}

module.exports = {
    getObjects: getObjects(ModelFactory),
    getObjectById: getObjectById,
    postObjects: postObjects
};