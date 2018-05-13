'use strict';

const
    express = require('express'),
    apiRootsController = require('../../../controllers/apis/api-roots'),
    statusController = require('../../../controllers/apis/status'),
    collectionsController = require('../../../controllers/apis/collections'),
    objectsController = require('../../../controllers/apis/objects');

let router = express.Router();

router.use('/:apiRootId/status/', statusController);
router.use('/:apiRootId/collections/:collectionName/objects', objectsController);
router.use('/:apiRootId/collections/', collectionsController);
router.use('/', apiRootsController);

module.exports = router;