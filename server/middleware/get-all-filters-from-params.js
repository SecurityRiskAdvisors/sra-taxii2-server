// Discussion - should this remain distinct middleware or does it make sense to call from service, passing
// more implementation details to allow for more flexible filtering?

const getMatchFilterFromParams = function(allowedFilters, matchFilterKey, paramValues) {
    let splitParamVal = paramValues.split(',');
    
    let l = splitParamVal.length;
    let returnVal = {};
    if(l > 1) {
    	returnVal[matchFilterKey] = { '$in' : splitParamVal };    
    } else {
    	returnVal[matchFilterKey] = splitParamVal[0];
    }
    
    return returnVal;
}

const getAllFiltersFromParams = function (allowedFilters = {}, urlParams = {}) {
    
    /*
        /objects/?added_after=2016-02-01T00:00:01.000Z

        ?match[type]=incident,ttp,actor

        ?match[type]=incident&match[version]=2016-01-01T01:01:01.000Z

        ?match[id]=indicator--3600ad1b-fff1-4c98-bcc9-4de3bc2e2ffb,sighting--4600ad1b-fff1-4c58-bcc9-4de3bc5e2ffd

        ?match[version]=last
        (first, all, value)

        {
            added_after: true,
            match: ['id', 'type', 'version']
        }

        Query:
        {
            $and: [
                {"id": { "$in": [ 4, 2, 8 ] }},
                {"version" : "v1"}
            ]
        }
    */

    //{"createdAt" : { $gte : new Date("2012-01-12T20:15:31Z") }}

    return function (req, res, next) {
        const addedAfterKey = 'added_after';
        const matchKey = 'match';
        let andQueries = [];
        for (let queryParam in req.query) {
            if(queryParam.toLowerCase() == addedAfterKey && allowedFilters.hasOwnProperty(addedAfterKey) && allowedFilters[addedAfterKey]) {
                andQueries.push({"createdAt" : { $gt : new Date(req.query[queryParam]) }});
            }
            else if(queryParam.toLowerCase() == matchKey && allowedFilters.hasOwnProperty(matchKey)) {
                // each match[element] is a separate AND condition
                // comma separated vals passed to match[element] are OR conditions
                for(let matchFilterKey in req.query[queryParam]) {
                    if(allowedFilters[matchKey].indexOf(matchFilterKey) > -1) {
                        andQueries.push(getMatchFilterFromParams(allowedFilters, matchFilterKey, req.query[queryParam][matchFilterKey]));
                    }
                }
            }
        }

        for(let dbKey in urlParams) {
            let paramQueryPart = {};
            paramQueryPart[dbKey] = req.params[urlParams[dbKey]];
            andQueries.push(paramQueryPart);
        }

        if(andQueries.length > 1) {
            res.locals.taxiiMongooseFilter = { '$and' : andQueries };   
        } else if(andQueries.length == 1) {
        	res.locals.taxiiMongooseFilter = andQueries[0];
        }
        
        next();
    }
};

module.exports = getAllFiltersFromParams;