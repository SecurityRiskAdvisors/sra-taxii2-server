'use strict';

const Queue = require('bull');
const buildError = require('../../errors');

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

    next();
}

module.exports = {
    getStatusById: getStatusById
};
 