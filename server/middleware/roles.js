const ConnectRoles = require('connect-roles');

let roles = new ConnectRoles();

// @TODO - abstract these, they may be used elsewhere
roles.use('read objects from collection', (req, action) => {    
    // reliant on apiRootId and collectionName existing in params for now
    if(!req.params.apiRootId || !req.params.collectionName) {
        return;
    }

    if(req.user.readAll) {
        return true;
    } else if(req.user.hasOwnProperty('readApiRoots') && req.user.readApiRoots.includes(req.params.apiRootId)) {
        return true;
    } else if(req.user.hasOwnProperty('readCollections') && req.user.readCollections.includes(req.params.collectionName)) {
        return true;
    }
});

roles.use('write objects to collection', (req, action) => {
    if(!req.params.apiRootId || !req.params.collectionName) {
        return;
    }

    if(req.user.writeAll) {
        return true;
    } else if(req.user.hasOwnProperty('writeApiRoots') && req.user.writeApiRoots.includes(req.params.apiRootId)) {
        return true;
    } else if(req.user.hasOwnProperty('writeCollections') && req.user.writeCollections.includes(req.params.collectionName)) {
        return true;
    }
});


module.exports = roles;