'use strict';

const
    express = require('express'),
    statusService = require('../../../services/status'),
    setRenderDetail = require('../../../middleware/set-render-detail'),
    suggestContentType = require('../../../middleware/suggest-content-type');

// Merge params must be true if we want access to the api root ID and stuff
let router = express.Router({mergeParams: true});

router.get('/:statusId', statusService.getStatusById, suggestContentType(), setRenderDetail('Status Detail'));

module.exports = router;
