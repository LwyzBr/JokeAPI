// this module parses the passed URL, returning an object that is uniform and easy to use

const jsl = require("svjsl");
const fs = require("fs");

const searchFuzzy = require("./searchFuzzy");
const settings = require("../settings");

/**
 * Parses the passed URL, returning a fancy object
 * @param {String} url
 * @returns {Object}
 */
const parseURL = url => {
    let error = null;

    let pathArr = [];
    let qstrObj = {};

    try 
    {
        let rawPath = url.split("?")[0];
        let rawQstr = url.split("?")[1];


        if(rawPath.includes("/"))
            pathArr = rawPath.split("/");
        else pathArr = [rawQstr];

        pathArr.forEach((pathSection, i) => {
            if(jsl.isEmpty(pathSection))
                pathArr.splice(i, 1);
        });


        let qstrArr = [];
        if(!jsl.isEmpty(rawQstr) && rawQstr.includes("&"))
            qstrArr = rawQstr.split("&");
        else if(!jsl.isEmpty(rawQstr))
            qstrArr = [rawQstr];


        if(qstrArr.length > 0)
            qstrArr.forEach(qstrEntry => {
                if(qstrEntry.includes("="))
                    qstrObj[qstrEntry.split("=")[0]] = qstrEntry.split("=")[1];
            });
        else qstrObj = null;
    }
    catch(err)
    {
        error = err;
    }


    if(!error)
        return {
            initialURL: url,
            pathArray: pathArr,
            queryParams: qstrObj
        }
    else
        return {
            error: error,
            initialURL: url
        }
}

const getFileFormatFromQString = qstrObj => {
    if(!jsl.isEmpty(qstrObj.format))
    {
        let possibleFormats = Object.keys(JSON.parse(fs.readFileSync(settings.jokes.fileFormatsPath).toString()));
        let fuzzySearch = searchFuzzy(possibleFormats, qstrObj.format);
        let requestedFormat = possibleFormats[fuzzySearch[0]];

        switch(requestedFormat)
        {
            case "json":
            case "xml":
            case "yaml":
                return qstrObj.format;
            default:
                return settings.jokes.defaultFileFormat.fileFormat
        }
    }
    else return settings.jokes.defaultFileFormat.fileFormat;
};

/**
 * Returns the MIME type of the provided file format string (example: "json" -> "application/json")
 * @param {String} fileFormatString 
 * @returns {String}
 */
const getMimeTypeFromFileFormatString = fileFormatString => {
    let allFileTypes = JSON.parse(fs.readFileSync(settings.jokes.fileFormatsPath).toString());
    
    if(!jsl.isEmpty(allFileTypes[fileFormatString]))
        return allFileTypes[fileFormatString].mimeType;
    else return settings.jokes.defaultFileFormat.mimeType;
};

module.exports = parseURL;
module.exports.getFileFormatFromQString = getFileFormatFromQString;
module.exports.getMimeTypeFromFileFormatString = getMimeTypeFromFileFormatString;