const http = require("http");
const convertFileFormat = require("../src/fileFormatConverter");
const httpServer = require("../src/httpServer");
const parseURL = require("../src/parseURL");
const jsl = require("svjsl");
const parseJokes = require("../src/parseJokes");
const settings = require("../settings");

jsl.unused(http);


const meta = {
    "name": "Info",
    "desc": `Returns some information on ${settings.info.name}`,
    "usage": {
        "method": "GET",
        "url": `${settings.info.docsURL}/info`,
        "supportedParams": [
            "format"
        ]
    }
};

/**
 * Calls this endpoint
 * @param {http.IncomingMessage} req The HTTP server request
 * @param {http.ServerResponse} res The HTTP server response
 * @param {Array<String>} url URL path array gotten from the URL parser module
 * @param {Object} params URL query params gotten from the URL parser module
 * @param {String} format The file format to respond with
 */
const call = (req, res, url, params, format) => {
    jsl.unused([req, url, params]);

    let errFromRegistry = require("." + settings.errors.errorRegistryIncludePath)["100"];
    let responseText = {};
    if(format != "xml")
    {
        responseText = {
            "error": true,
            "internalError": true,
            "code": 100,
            "message": errFromRegistry.errorMessage,
            "causedBy": errFromRegistry.causedBy,
            "timestamp": new Date().getTime()
        };
    }
    else if(format == "xml")
    {
        responseText = {
            "error": true,
            "internalError": true,
            "code": 100,
            "message": errFromRegistry.errorMessage,
            "causedBy": {"cause": errFromRegistry.causedBy},
            "timestamp": new Date().getTime()
        };
    }

    let totalJokesCount = (!jsl.isEmpty(parseJokes.jokeCount) ? parseJokes.jokeCount : 0);

    if(format != "xml")
    {
        responseText = convertFileFormat.auto(format, {
            "error": false,
            "version": settings.info.version,
            "jokes":
            {
                "totalCount": totalJokesCount,
                "categories": [settings.jokes.possible.anyCategoryName, ...settings.jokes.possible.categories],
                "flags": settings.jokes.possible.flags,
                "types": settings.jokes.possible.types,
                "submissionURL": settings.jokes.jokeSubmissionURL,
                "idRange": [ 0, --totalJokesCount ]
            },
            "formats": settings.jokes.possible.formats,
            "info": settings.info.infoMsg,
            "timestamp": new Date().getTime()
        });
    }
    else if(format == "xml")
    {
        responseText = convertFileFormat.auto(format, {
            "error": false,
            "version": settings.info.version,
            "jokes":
            {
                "totalCount": totalJokesCount,
                "categories": {"category": [settings.jokes.possible.anyCategoryName, ...settings.jokes.possible.categories]},
                "flags": {"flag": settings.jokes.possible.flags},
                "types": {"type": settings.jokes.possible.types},
                "submissionURL": settings.jokes.jokeSubmissionURL,
                "idRange": [ 0, --totalJokesCount ]
            },
            "formats": {"format": settings.jokes.possible.formats},
            "info": settings.info.infoMsg,
            "timestamp": new Date().getTime()
        });
    }

    httpServer.pipeString(res, responseText, parseURL.getMimeTypeFromFileFormatString(format));
};

module.exports = { meta, call };
