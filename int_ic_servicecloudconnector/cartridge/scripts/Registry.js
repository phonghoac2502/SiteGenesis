'use strict';

/**
 * Registry.js
 */

/**
 * Cartridge script path
 * @const {string}
 * @private
 */
var path = '/int_ic_servicecloudconnector/cartridge/scripts/';

/**
 * Registry object
 * @type {{authToken: module:int_ic_servicecloudconnector.authToken}}
 * @exports int_ic_servicecloudconnector
 */
var	Registry = {
    /**
     * @returns {module:models/authToken~AuthToken} Instance of AuthToken
     */
    authToken : function () {
        /**
         * @type {module:models/authToken~AuthToken}
         */
        var model = require(path +'models/authToken');
        return new model();
    }
};

module.exports = Registry;