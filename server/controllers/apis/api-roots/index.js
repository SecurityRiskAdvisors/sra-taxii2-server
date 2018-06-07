'use strict';

const
    express = require('express'),
    apiRootService = require('../../../services/api-roots'),
    setRenderDetail = require('../../../middleware/set-render-detail'),
    suggestContentType = require('../../../middleware/suggest-content-type');

let router = express.Router();

//router.get('/', apiRootService.getApiRoots, suggestContentType(), setRenderDetail('API Roots'));
router.get('/:apiRootId', apiRootService.getApiRootById, suggestContentType(), setRenderDetail('API Root Detail'));

module.exports = router;
