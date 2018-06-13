'use strict';

const
    express = require('express'),
    collectionsService = require('../../../services/collections'),
    setRenderDetail = require('../../../middleware/set-render-detail'),
    suggestContentType = require('../../../middleware/suggest-content-type'),
    getAllFiltersFromParams = require('../../../middleware/get-all-filters-from-params'),
    passport = require('passport'),
    range = require('express-range'),
    mangleTaxiiRange = require('../../../middleware/mangle-taxii-range');
    

let router = express.Router({mergeParams: true});

/*
<api-root>/collections/ GET collections
<api-root>/collections/<name>/ GET collection
<api-root>/collections/<name>/manifest/ GET manifest
*/

// some of this can be parallelized 
// see: https://engineering.gosquared.com/making-dashboard-faster
// possible package - https://github.com/tjmehta/middleware-flow

router.get('/:collectionName/manifest', 
    getAllFiltersFromParams({
        match: ['id', 'type', 'version']
    }),
    mangleTaxiiRange,
    range({
        accept: 'items',
        limit: process.env.PAGINATION_LIMIT,
    }),
    collectionsService.getCollectionManifestByName, 
    suggestContentType(), 
    setRenderDetail('Collection Manifest')
);

router.get('/:collectionName', 
    collectionsService.getCollectionByName, 
    suggestContentType(), 
    setRenderDetail('Collection Detail')
);

router.get('/', 
    // Setup pagination.  
    // This is configured globally for now but it may be possible to set it up on a per api-root or collection basis.
    mangleTaxiiRange,
    range({
        accept: 'items',
        limit: process.env.PAGINATION_LIMIT,
    }),
    collectionsService.getCollections, 
    suggestContentType(), 
    setRenderDetail('Collections')
);

module.exports = router;
