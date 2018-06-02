const mongoose = require('mongoose');
const config = require('../configs');
const fs = require('fs');

let models = [];
let conns = {};
const path = __dirname + '/../models/cross-database-schemas';

// Minor overkill right now, but we can't decide if we want the server to store everything in one collection
// or we want to split things up into a defined schema

// see discussion: https://stackoverflow.com/questions/29585234/using-and-reusing-multiple-mongoose-database-connections-on-express-js/29663284
// trying to avoid modifying the mongoose object

// collection model will be in the taxii connection/model which doesn't need this factory
const modelFactory = (apiRoot, collection) => {
    // if the connection is cached on the array, reuse it
    if (conns.hasOwnProperty(apiRoot) && conns[apiRoot].hasOwnProperty(collection)) {
        console.log('reusing connection', apiRoot, ':', collection, '...');
    } else {
        console.log('creating new connection to', apiRoot, ' for collection ', collection, ' using ', config.connectionString + apiRoot, ' ...');
        if(!conns.hasOwnProperty(apiRoot))
        {
            conns[apiRoot] = {};
        }
        conns[apiRoot][collection] = mongoose.createConnection(config.connectionString + apiRoot);
    }

    if(models.hasOwnProperty(apiRoot) && models[apiRoot].hasOwnProperty(collection)) {
        console.log('reusing models');
    } else {
        let instanceModels = [];
        let schemas = fs.readdirSync(path);
        console.log('registering models');
        if(!models.hasOwnProperty(apiRoot))
        {
            models[apiRoot] = {};
        }
        schemas.forEach(function(schema) {
            var model = schema.split('.').shift();
            instanceModels[model] = conns[apiRoot][collection].model(model, require([path, schema].join('/')), collection);
        });
        models[apiRoot][collection] = instanceModels;
    }
    return models[apiRoot][collection];
}

module.exports = modelFactory;