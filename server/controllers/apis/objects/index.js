'use strict';

const
    express = require('express'),
    objectsService = require('../../../services/objects'),
    setRenderDetail = require('../../../middleware/set-render-detail'),
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
    suggestContentType(process.env.STIX_CONTENT_TYPE), 
    setRenderDetail('Object Detail')
);

router.get('/',
    getAllFiltersFromParams({
        added_after: true,
        match: ['id', 'type', 'version']
    }),
    range({
        accept: 'items',
        limit: process.env.PAGINATION_LIMIT,
    }),
    objectsService.getObjects, 
    suggestContentType(process.env.STIX_CONTENT_TYPE), 
    setRenderDetail('Objects')
);

router.post('/', 
    objectsService.postObjects, 
    suggestContentType(),
    setRenderDetail('Object Status')
);

module.exports = router;
