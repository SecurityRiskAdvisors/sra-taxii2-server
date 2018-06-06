const buildError = require('../errors')

const getPaginatedTaxiiRequest = async (req, res, next, PaginateModel, mongooseQuery = {}, paginationParams = {}, dataTransformFn = null) => {
    let envPaginationLimit = parseInt(process.env.PAGINATION_LIMIT);
    let paginationLimit = isNaN(req.range.last) || isNaN(req.range.first) || (req.range.last-req.range.first > (envPaginationLimit - 1)) ?  
        envPaginationLimit - 1 : (req.range.last-req.range.first);

    try {
        let paginatedQueryResult = await PaginateModel.paginate(mongooseQuery,
            // pagination details
            Object.assign(paginationParams, {
                lean: true,
                offset: req.range.first,
                limit: paginationLimit
            })
        );
        if(paginatedQueryResult.offset > paginatedQueryResult.total) {
            res.removeHeader("Content-Range");
            return res.status(416).send();
        }

        res.range({
            first: paginatedQueryResult.offset,
            last: paginatedQueryResult.docs.length + paginatedQueryResult.offset,
            length: paginatedQueryResult.total
          });
        
        let data = (typeof(dataTransformFn) === 'function') ? dataTransformFn(req, paginatedQueryResult.docs) : paginatedQueryResult.docs;
        
        return data;
    } 
    catch (err) {
        next(buildError(500,err));
    }
}

module.exports = getPaginatedTaxiiRequest;