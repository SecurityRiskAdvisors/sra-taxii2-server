'use strict';

const config = require('../../../configs');
const Queue = require('bull');
const buildError = require('../../errors');

const mockResponse = {
        "status": "pending",
        "request_url": "https://example.com/api1/collections/91a7b528-80eb-42ed-a74dc6fbd5a26116/objects",
        "request_timestamp": "2016-11-02T12:34:34.12345Z",
        "total_objects": 4,
        "success_count": 1,
        "successes": [
            "indicator--c410e480-e42b-47d1-9476-85307c12bcbf"
        ],
        "failure_count": 1,
        "failures": [
            {
                "id": "malware--664fa29d-bf65-4f28-a667-bdb76f29ec98",
                "message": "Unable to process object"
            }
        ],
        "pending_count": 2,
        "pendings": [
            "indicator--252c7c11-daf2-42bd-843b-be65edca9f61",
            "relationship--045585ad-a22f-4333-af33-bfd503a683b5"
        ]
    };


const getStatusById = async (req, res, next) => {
    let id = req.params.statusId || 0;
    let result = {};

    if(!id) {
        result.id = id;
        next(buildError(404, new Error("no status found")));
    }

    let importStixQueue = new Queue('importStix2', {redis: {port: 6379, host: 'sra-taxii2-redis'}});

    let statusJobResult = await importStixQueue.getJob(id);

    let requestUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    result.request_url = requestUrl;

    let currentTime = new Date();
    result.request_timestamp =  currentTime.toISOString();

    if(!statusJobResult) {
        next(buildError(404, new Error("no status found")));
    } else if(statusJobResult.hasOwnProperty('returnvalue')) {
        // getState is slow?
        // completed, failed, delayed, active, waiting, paused, stuck or null.
        // @TODO - get this from return value maybe?
        if(['completed', 'failed', 'null'].includes(statusJobResult.getState())) {
            result.status = 'completed';
        } else {
            result.status = 'pending';
        }
        result.failure_count = statusJobResult.returnvalue.failure_count;
        result.success_count = statusJobResult.returnvalue.success_count;
        result.total_count = statusJobResult.returnvalue.total_count;
        result.pending_count = statusJobResult.returnvalue.pending_count;
    } else {
        result.failure_count = 0;
        result.success_count = 0;
        result.total_count = 0;
        result.pending_count = 0;
    }


    res.data = result;

    // @TODO - remove these, endpoint not implemented yet
    //res.data["statusId"] = req.params.statusId;
    //res.data["apiRootId"] = req.params.apiRootId;
    next();
}

module.exports = {
    getStatusById: getStatusById
};
