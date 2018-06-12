const buildError = require('../errors')

// the taxii 2.0 spec can be tricky with pagination. 
//  See below how total is 1 more than the last item, presents oddly to client due to zeroed index

/*
For example:

    If the Range header contains "items 10-49", 
        "10" represents the first item requested; 
        and "49" represents the last item requested.

    if the Content-Range header contains "items 10-49/500", 
        "10" represents the first object in the response; 
        "49" represents the last object in the response; 
        and "500" represents the total number of items available.

    All items values MUST be:

    a non-negative integer
    zero indexed (i.e., the first object is object "0")
*/
const getPaginatedTaxiiRequest = async (req, res, next, PaginateModel, mongooseQuery = {}, paginationParams = {}, dataTransformFn = null) => {
    let envPaginationLimit = parseInt(process.env.PAGINATION_LIMIT);
    let paginationLimit = isNaN(req.range.last) || isNaN(req.range.first) || (req.range.last-req.range.first > (envPaginationLimit - 1)) ?  
        envPaginationLimit : (req.range.last-req.range.first) + 1;
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

        let last = paginatedQueryResult.docs.length -1 + paginatedQueryResult.offset
        res.range({
            first: paginatedQueryResult.offset,
            last: last,
            length: paginatedQueryResult.total
          });
        
        let data = (typeof(dataTransformFn) === 'function') ? dataTransformFn(req, paginatedQueryResult.docs) : paginatedQueryResult.docs;
        
        if(last < paginatedQueryResult.total-1) {
            res.status(206);
        }
        return data;
    } 
    catch (err) {
        next(buildError(500,err));
    }
}

module.exports = getPaginatedTaxiiRequest;