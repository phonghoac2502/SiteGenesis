'use strict';

/**
 * @module hooks/case
 */

/**
 * @type {dw.system.Logger}
 */
const Logger = require('dw/system/Logger');
/**
 * @type {dw.util.StringUtils}
 */
const StringUtils = require('dw/util/StringUtils');
/**
 * @type {dw.system.Transaction}
 */
const Transaction = require('dw/system/Transaction');

/**
 * @type {module:services/rest}
 */
const RestService = require('../services/rest');
/**
 * @type {dw.system.Logger}
 */
const LOGGER = Logger.getLogger('int_ic', 'hooks.case');

/**
 * Customer case created
 * @param caseObj
 */
function caseCreated(caseObj) {
	handleExport(caseObj, 'created');
}

/**
 * Customer case updated
 * @param caseObj
 */
function caseUpdated(caseObj) {
	handleExport(caseObj, 'updated');
}

/**
 * Get customer case by Salesforce service cloud case id
 * @param scccaseId - Salesforce service cloud case id
 */
function getCase(scccaseId) {
    try {
        var svc = RestService.get(RestService.serviceIDs.get);
        return svc.call(StringUtils.format(RestService.servicePaths.get.case, scccaseId), sccCaseModel);
    } catch (e) {
        LOGGER.error('Error occurred while getting the case {0}: {1}', scccaseId, e.message);
        throw e;
    }
}

/**
 * Get all customer cases by Salesforce service cloud contact id
 * @param scccaseId - Salesforce service cloud contact id
 */
function getAllCases(scccontactid) {
    try {
        var svc = RestService.get(RestService.serviceIDs.get);
        return svc.call(StringUtils.format(RestService.servicePaths.get.case, scccontactid), sccCaseModel);
    } catch (e) {
        LOGGER.error('Error occurred while getting all cases for the contact id {0}: {1}', scccontactid, e.message);
        throw e;
    }
}

function handleExport(caseObj, status) {
    try {
        if (['created', 'updated'].indexOf(status) > -1) {
            var sccCaseModel = new (require('../models/case'))(caseObj);
            var svc = RestService.get(RestService.serviceIDs.create);
            return svc.call(RestService.servicePaths.create.case, sccCaseModel);
        }
    } catch (e) {
        LOGGER.error('Error occurred while creating case: {0}', e.message);
        throw e;
    }
}

exports.created = caseCreated;
exports.updated = caseUpdated;
exports.get = getCase;
exports.getAll = getAllCases;
