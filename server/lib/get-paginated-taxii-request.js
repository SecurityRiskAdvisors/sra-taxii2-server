const config = require('../../configs');
const buildError = require('../errors')

const getPaginatedTaxiiRequest = async (req, res, next, PaginateModel, mongooseQuery = {}, paginationParams = {}, dataTransformFn = null) => {
    let paginationLimit = (req.range.last-req.range.first > config.paginationLimit-1) ?  
        config.paginationLimit-1 : (req.range.last-req.range.first);

    try {
        let collectionsResult = await PaginateModel.paginate(mongooseQuery,
            // pagination details
            Object.assign(paginationParams, {
                lean: true,
                offset: req.range.first,
                limit: paginationLimit
            })
        );
        if(collectionsResult.offset > collectionsResult.total) {
            res.removeHeader("Content-Range");
            return res.status(416).send();
        }

        res.range({
            first: collectionsResult.offset,
            last: collectionsResult.docs.length + collectionsResult.offset,
            length: collectionsResult.total
          });
        
        let data = (typeof(dataTransformFn) === 'function') ? dataTransformFn(req, collectionsResult.docs) : collectionsResult.docs;
        
        return data;
    } 
    catch (err) {
        next(buildError(500,err));
    }
}

module.exports = getPaginatedTaxiiRequest;