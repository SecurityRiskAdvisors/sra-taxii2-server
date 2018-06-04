'use strict';

const ModelFactory = require('../../../helpers/model-factory')
const mongoose = require('mongoose');
const getPaginatedTaxiiRequest = require('../../lib/get-paginated-taxii-request');
const uuid4 = require('uuid/v4');
const buildError = require('../../errors');
const config = require('../../../configs');
const Queue = require('bull');
const fs = require('fs');
const util = require('util');

const writefile = util.promisify(fs.writeFile);

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

const postObjects = async (req, res, next) => {
    const uuid = uuid4();
    console.log("body: ", req.body);
    console.log("has type: ", req.body.hasOwnProperty('type'));
    if(req.body.hasOwnProperty('type') && req.body.type == 'bundle') {
        let fileName = uuid + '.json';
        console.log(req.params.apiRootId, req.params.collectionName, fileName);

        await writefile(config.tempFileDir + '/' + fileName, JSON.stringify(req.body));
        let importStixQueue = new Queue('importStix2', {redis: {port: 6379, host: 'sra-taxii2-redis'}});
        let jobResult = await importStixQueue.add('importStix2',{
            apiRoot: req.params.apiRootId,
            collection: req.params.collectionName,
            file: fileName
        }, {jobId: uuid});

        let requestUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        let currentTime = new Date();

        res.data = {
            "id": uuid,
            "status": "pending",
            "request_url": requestUrl,
            "request_timestamp": currentTime.toISOString(),
            "total_count": req.body.objects.length,
            "success_count": 0,
            "successes": [],
            "failure_count": 0,
            "pending_count": req.body.objects.length
        };
        console.log("result: ", jobResult);
        
    } else {
        next(buildError(422, "not a valid STIX 2.0 bundle"));
    }
    return next();
}

module.exports = {
    getObjects: getObjects(ModelFactory),
    getObjectById: getObjectById,
    postObjects: postObjects
};