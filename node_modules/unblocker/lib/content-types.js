var contentType = require('content-type');

function shouldProcess(config, data) {
    return config.processContentTypes.indexOf(data.contentType) != -1;
}

function parse(data) {
    try {
        return contentType.parse(data.headers['content-type']);
    } catch (ex) {
        return {
            type: '',
            parameters: {}
        };
    }
}

function setHeader(data) {
    var type = getType(data);
    if (type) {
        data.headers['content-type'] = contentType.format({
            type: getType(data),
            parameters: {
                charset: 'UTF-8'
            }
        });
    }
}

function getType(data) {
    return parse(data).type;
}

function getCharset(data) {
    return parse(data).parameters.charset;
}

module.exports.shouldProcess = shouldProcess;
module.exports.getType = getType;
module.exports.getCharset = getCharset;
module.exports.setHeader = setHeader;
