'use strict';

/**
 * @module services/rest
 */

/**
 * Service Cloud REST API client
 */

/**
 * @type {dw.system.Logger}
 */
const Logger = require('dw/system/Logger');
/**
 * @type {dw.svc.LocalServiceRegistry}
 */
const LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
/**
 * @type {dw.system.Site}
 */
const Site = require('dw/system/Site');
/**
 * @type {dw.util.StringUtils}
 */
const StringUtils = require('dw/util/StringUtils');

/**
 * @type {module:util/helpers}
 */
const helpers = require('../util/helpers');

/**
 * @type {dw.system.Logger}
 */
const LOGGER = Logger.getLogger('int_ic', 'services.rest');

const serviceIDs = {
    auth: 'ic_servicecloud.rest.auth',
    create: 'ic_servicecloud.rest.create',
    get: 'ic_servicecloud.rest.get',
    query: 'ic_servicecloud.rest.query',
    patch: 'ic_servicecloud.rest.patch'
};

const servicePaths = { 
    get: {        
        order: '/services/apexrest/v1/ICConnector/Order/{0}',
        contact: '/services/apexrest/v1/ICConnector/Customer/{0}',
        orderlist: '/services/apexrest/v1/ICConnector/Customer/{0}/Orders'        	
    },
    create: {        
        order: '/services/apexrest/v1/ICConnector/Order',
        contact: '/services/apexrest/v1/ICConnector/Customer'
    },
    update: {    	
        order: '',
        contact: '/services/apexrest/v1/ICConnector/Customer/{0}'
    }
};

/**
 * Inserts auth token into request header
 * 
 * @param {dw.svc.HTTPService} svc
 * @param {String} urlPath
 * 
 * @throws {Error} Throws error when no valid auth token is available (i.e.- service error, service down)
 */
function setAuthHeader(svc, urlPath) {
    /**
     * @type {module:models/authToken~AuthToken}
     */
    var authToken = require('int_ic_servicecloudconnector').authToken();
    var token = authToken.getValidToken();
    if (empty(token) || !token.access_token) {
        throw new Error('No auth token available!');
    }

    svc.setAuthentication('NONE');
    svc.addHeader('Authorization', 'Bearer ' + token.access_token);
    svc.setURL(StringUtils.format('{0}/{1}', token.instance_url, urlPath));
}

/**
 * Check if 401 due to expired token
 * @param {dw.net.HTTPClient} client
 * @returns {boolean} true if expired auth token
 */
function isValid401(client) {
    var is401 = (client.statusCode === 401);
    var isFailureFromBadToken = false;
    var authResHeader = client.getResponseHeader('WWW-Authenticate');

    if (is401 && authResHeader) {
        isFailureFromBadToken = /^Bearer\s.+?invalid_token/.test(authResHeader);
    }

    return isFailureFromBadToken;
}

/**
 * Check if response type is JSON
 * @param {dw.net.HTTPClient} client
 * @returns {boolean}
 */
function isResponseJSON(client) {
    var contentTypeHeader = client.getResponseHeader('Content-Type');
    return contentTypeHeader && contentTypeHeader.split(';')[0].toLowerCase() === 'application/json';
}

/**
 * Parses response JSON and wraps with an object containing additional helper properties
 * @param {dw.svc.HTTPService} svc
 * @param {dw.net.HTTPClient} client
 * @returns {{responseObj: Object, isError: boolean, isAuthError: boolean, isValidJSON: boolean, errorText: string}}
 */
function parseResponse(svc, client) {
    var isJSON = isResponseJSON(client);
    var parsedBody;

    if (isJSON) {
        parsedBody = helpers.expandJSON(client.text, {});
    } else {
        parsedBody = client.text;
    }

    return {
        isValidJSON: isJSON,
        isError: client.statusCode >= 400,
        isAuthError: isValid401(client),
        responseObj: parsedBody,
        errorText: client.errorText
    };
}

/**
 * Attempt to set to site-specific credential to the given service. If it fails, fallback to the original ID
 *
 * @param  {dw.svc.HTTPService} svc
 * @param  {String} id
 *
 * @return {String}
 */
function setCredentialID(svc, id) {
    var siteID = Site.getCurrent().getID();
    var possibleIDs = [
        id + '-' + siteID,
        id
    ];

    possibleIDs.some(function tryToApplyCredentialID(credentialID) {
        try {
            svc.setCredentialID(credentialID);
            return true;
        } catch (e) {
            return false;
        }
    });
}

var serviceConfigs = {};
serviceConfigs[serviceIDs.auth] = {
    /**
     * Create request for service authentication
     * @param {dw.svc.HTTPService} svc
     * @throws {Error} Throws error when service credentials are missing
     */
    createRequest: function (svc /*, params*/) {
        setCredentialID(svc, svc.getCredentialID() || svc.getConfiguration().getID());

        Logger.debug('SC Connector credential ID: {0}', svc.getCredentialID());

        var svcCredential = svc.getConfiguration().getCredential();
        if (empty(svcCredential.getUser()) || empty(svcCredential.getPassword())) {
            throw new Error('Service configuration requires valid client ID (Service username) and secret (Service password)');
        }

        svc.setAuthentication('NONE');
        svc.addHeader('Content-Type', 'application/x-www-form-urlencoded');
        svc.setRequestMethod('POST');
        svc.addParam('client_id', svcCredential.getUser());
        svc.addParam('client_secret', svcCredential.getPassword());

        /* TODO: unsure if this logic is necessary (from original code)
        var finalizeOAuthLoginResult = session.custom.finalizeOAuthLoginResult;
        if (!adminToken && finalizeOAuthLoginResult && finalizeOAuthLoginResult.accessTokenResponse && finalizeOAuthLoginResult.userInfoResponse) {
            jsonResp.access_token = finalizeOAuthLoginResult.accessTokenResponse.getAccessToken();
            jsonResp.instance_url = JSON.parse(finalizeOAuthLoginResult.userInfoResponse.userInfo).urls.custom_domain;
            return jsonResp;
        }
         */
    },
    /**
     * @param {dw.svc.HTTPService} svc
     * @param {dw.net.HTTPClient} client
     * @returns {Object}
     */
    parseResponse: function (svc, client) {
        var responseObj;

        try {
            responseObj = helpers.expandJSON(client.text, {});
            if (responseObj && responseObj.access_token) {
                var tempExpire = 3600000; // expire in 1 hr in ms
                var responseDate = new Date(responseObj.issued_at * 1);

                // Set the millisecond timestamp values
                responseObj.issued = responseDate.valueOf();
                responseObj.expires = responseDate.valueOf() + (tempExpire);
            }
        } catch (e) {
            responseObj = client.text;
            Logger.error('Unable to Authenticate: {0}', responseObj);
        }

        return responseObj;
    },
    mockCall: function (/*svc*/) {
        var obj = {
            id: 'https://login.salesforce.com/id/00Dx0000000BV7z/005x00000012Q9P',
            issued_at: Date.now(), // Unix timestamp is in seconds, not milliseconds
            instance_url: 'https://sampleinstanceurl.salesforce.com/',
            signature: '0CmxinZir53Yex7nE0TD+zMpvIWYGb/bdJh6XfOH6EQ=',
            access_token: '00Dx0000000BV7z!AR8AQAxo9UfVkh8AlV0Gomt9Czx9LjHnSSpwBMmbRcgKFmxOtvxjTrKW19ye6PE3Ds1eQz3z8jr3W7_VbWmEu4Q8TVGSTHxs'
        };
        return {
            statusCode: 200,
            statusMessage: 'Success',
            text: JSON.stringify(obj)
        };
    }
};

serviceConfigs[serviceIDs.create] = {
    /**
     * Create an object
     * @param {dw.svc.HTTPService} svc
     * @param {String} urlPath
     * @param {Object} modelObject A model instance to be sent to Service Cloud
     * 
     * @returns {string} Request body
     */
    createRequest: function (svc, urlPath, modelObject) {
        setAuthHeader(svc, urlPath);
        svc.setRequestMethod('POST');
        svc.addHeader('Content-Type', 'application/json');
        return JSON.stringify(modelObject);
    },
    parseResponse: parseResponse,
    mockCall: function (/*svc, requestBody*/) {
        var obj = {
        };
        return {
            statusCode: 202,
            statusMessage: 'Accepted',
            text: JSON.stringify(obj)
        };
    }
};

serviceConfigs[serviceIDs.query] = {
    /**
     * Query records
     * @param {dw.svc.HTTPService} svc
     * @param {String} urlPath
     * @param {string} query A query to be sent to Service Cloud
     * @todo Support query builder: https://github.com/jsforce/jsforce/blob/master/lib/soql-builder.js
     */
    createRequest: function (svc, urlPath, query) {
        query = encodeURIComponent(query).replace(/%20/g, '+');

        setAuthHeader(svc, urlPath);
        svc.setURL(format('{0}query/?q={1}', svc.getURL(), query));
        svc.addHeader('Content-Type', 'application/json');
        svc.setRequestMethod('GET');
    },
    parseResponse: parseResponse,
    mockCall: function (/*svc, requestBody*/) {
        var obj = {
        };
        return {
            statusCode: 200,
            statusMessage: 'Success',
            text: JSON.stringify(obj)
        };
    }
};

serviceConfigs[serviceIDs.get] = {
    /**
     * Query records
     * @param {dw.svc.HTTPService} svc
     * @param {String} urlPath
     */
    createRequest: function (svc, urlPath) {
        setAuthHeader(svc, urlPath);
        svc.addHeader('Content-Type', 'application/json');
        svc.setRequestMethod('GET');          
    },
    parseResponse: parseResponse,
    mockCall: function (/*svc, requestBody*/) {
        var obj = {
        };
        return {
            statusCode: 200,
            statusMessage: 'Success',
            text: JSON.stringify(obj)
        };
    }
};

serviceConfigs[serviceIDs.patch] = {
	/**
     * Query records
     * @param {dw.svc.HTTPService} svc
     * @param {String} urlPath
     */
	createRequest: function (svc, urlPath, modelObject) {
        setAuthHeader(svc, urlPath);
        svc.setRequestMethod('PATCH');
        svc.addHeader('Content-Type', 'application/json');
        return JSON.stringify(modelObject);
    },
    parseResponse: parseResponse,
    mockCall: function (/*svc, requestBody*/) {
        var obj = {
        };
        return {
            statusCode: 200,
            statusMessage: 'Success',
            text: JSON.stringify(obj)
        };
    }
}

module.exports = {
    serviceIDs: serviceIDs,
    servicePaths: servicePaths,

    get: function get(serviceID) {
        if (!serviceID in serviceIDs) {
            throw new Error(format('Service ID "{0}" does not exists in the rest context.', serviceID));
        }

        return LocalServiceRegistry.createService(serviceID, serviceConfigs[serviceID]);
    }
};
