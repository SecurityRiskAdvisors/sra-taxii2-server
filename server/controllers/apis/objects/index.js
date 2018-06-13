'use strict';

const
    express = require('express'),
    objectsService = require('../../../services/objects'),
    setRenderDetail = require('../../../middleware/set-render-detail'),
    suggestContentType = require('../../../middleware/suggest-content-type'),
    getAllFiltersFromParams = require('../../../middleware/get-all-filters-from-params'),
    range = require('express-range'),
    roles = require('../../../middleware/roles'),
    mangleTaxiiRange = require('../../../middleware/mangle-taxii-range');

let router = express.Router({mergeParams: true});

/*
<api-root>/collections/<name>/objects/ GET, POST object
<api-root>/collections/<name>/objects/<object-id>/ GET object
*/

// @TODO - hardcoded STIX now, but these need to rely on collection content type
router.get('/:objectId', 
    roles.can('read objects from collection'),
    getAllFiltersFromParams({
        added_after: true,
        match: ['version']
    }, {'id': 'objectId'}),
    objectsService.getObjectById, 
    suggestContentType(process.env.STIX_CONTENT_TYPE), 
    setRenderDetail('Object Detail')
);

router.get('/',
    roles.can('read objects from collection'),
    getAllFiltersFromParams({
        added_after: true,
        match: ['id', 'type', 'version']
    }),
    mangleTaxiiRange,
    range({
        accept: 'items',
        limit: process.env.PAGINATION_LIMIT,
    }),
    objectsService.getObjects, 
    suggestContentType(process.env.STIX_CONTENT_TYPE), 
    setRenderDetail('Objects')
);

router.post('/', 
    roles.can('write objects to collection'),
    objectsService.postObjects, 
    suggestContentType(),
    setRenderDetail('Object Status')
);

module.exports = router;
