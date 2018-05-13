const verror = require('verror');

/*
    '400': 
        {
            "title": "Error condition XYZ",
            "description": "This error is caused when the application tries to access data...",
            "error_id": "1234",
            "error_code": "581234",
            "http_status": "409",
            "external_details": "http://example.com/ticketnumber1/errorid-1234",
            "details": {
              "somekey1": "somevalue",
              "somekey2": "some other value"
            }
        },
*/

const baseErrors = {
    400: {
        title: "Bad Request",
        description: "The server cannot or will not process the request due to an apparent client error (e.g., malformed request syntax, size too large, invalid request message framing, or deceptive request routing)",
        http_status: 400,
    },
    401: {
        title: "Unauthorized",
        description: "Authentication is required and has failed or has not been provided.",
        http_status: 401,
    },
    403: {
        title: "Forbidden",
        description: "The request was valid, but user may not have the necessary permissions for this resource.",
        http_status: 403,
    },
    404: {
        title: "Not Found",
        description: "The requested resource could not be found.",
        http_status: 404,
    },
    405: {
        title: "Method Not Allowed",
        description: "That request method is not supported for this resource.",
        http_status: 405,
    },
    406: {
        title: "Not Acceptable",
        description: "The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.",
        http_status: 406,
    },
    413: {
        title: "Payload Too Large",
        description: "The request is larger than the server is willing or able to process.",
        http_status: 413,
    },
    416: {
        title: "Range Not Satisfiable",
        description: "The client has asked for a portion of a resource, but the server cannot supply that portion.",
        http_status: 416,
    },
    500: {
        title: "Internal Server Error",
        description: "An unexpected internal application error has occurred.",
        http_status: 500,
    },
}
  
const buildError = (base, err = null, detail = {}) => {
    // @TODO - check baseErrors hasOwnProperty base for dev errors

    console.log(err);
    let options = {};
    options.info = Object.assign(detail, baseErrors[base]);
    if(err != null) {
        options.cause = err;
    }

    return new verror(options, options.info.title);
}

module.exports = buildError;