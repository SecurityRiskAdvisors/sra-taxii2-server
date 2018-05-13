'use strict';

const mockResponse = {
        "id": "2d086da7-4bdc-4f91-900e-d77486753710",
        "status": "pending",
        "request_url": "https://example.com/api1/collections/91a7b528-80eb-42ed-a74dc6fbd5a26116/objects",
        "request_timestamp": "2016-11-02T12:34:34.12345Z",
        "total_objects": 4,
        "success_count": 1,
        "successes": [
            "indicator--c410e480-e42b-47d1-9476-85307c12bcbf"
        ],
        "failure_count": 1,
        "failures": [
            {
                "id": "malware--664fa29d-bf65-4f28-a667-bdb76f29ec98",
                "message": "Unable to process object"
            }
        ],
        "pending_count": 2,
        "pendings": [
            "indicator--252c7c11-daf2-42bd-843b-be65edca9f61",
            "relationship--045585ad-a22f-4333-af33-bfd503a683b5"
        ]
    };


const getStatusById = (req, res, next) => {
    let id = req.params.id || 0,
        result = {};

    res.data = mockResponse;

    // @TODO - remove these, endpoint not implemented yet
    //res.data["statusId"] = req.params.statusId;
    //res.data["apiRootId"] = req.params.apiRootId;
    next();
}

module.exports = {
    getStatusById: getStatusById
};
