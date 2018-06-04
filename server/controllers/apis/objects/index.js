'use strict';

const
    express = require('express'),
    objectsService = require('../../../services/objects'),
    setRenderDetail = require('../../../middleware/set-render-detail'),
    config = require('../../../../configs'),
    suggestContentType = require('../../../middleware/suggest-content-type'),
    getAllFiltersFromParams = require('../../../middleware/get-all-filters-from-params'),
    range = require('express-range');

let router = express.Router({mergeParams: true});

/*
<api-root>/collections/<name>/objects/ GET, POST object
<api-root>/collections/<name>/objects/<object-id>/ GET object
*/

// @TODO - hardcoded STIX now, but these need to rely on collection content type
router.get('/:objectId', 
    getAllFiltersFromParams({
        added_after: true,
        match: ['version']
    }, {'id': 'objectId'}),
    objectsService.getObjectById, 
    suggestContentType(config.stixContentType), 
    setRenderDetail('Object Detail')
);

router.get('/',
    getAllFiltersFromParams({
        added_after: true,
        match: ['id', 'type', 'version']
    }),
    range({
        accept: 'items',
        limit: config.paginationLimit,
    }),
    objectsService.getObjects, 
    suggestContentType(config.stixContentType), 
    setRenderDetail('Objects')
);

// @TODO - implementation unfinished
router.post('/', 
    objectsService.postObjects, 
    suggestContentType(),
    setRenderDetail('Object Status')
);

module.exports = router;
