'use strict';

const
    express = require('express'),
    discoveryService = require('../../../services/discovery'),
    setRenderDetail = require('../../../middleware/set-render-detail'),
    suggestContentType = require('../../../middleware/suggest-content-type');

let router = express.Router();

router.get('/', discoveryService.getDiscoveryData, suggestContentType(), setRenderDetail('Taxii Discovery'));

module.exports = router;