'use strict';

/**
 * @module hooks/customer
 * Modify by PhuocPN
 */

/**
 * @type {dw.system.Transaction}
 */
const Transaction = require('dw/system/Transaction');
/**
 * @type {dw.system.Logger}
 */
const Logger = require('dw/system/Logger');

/**
 * @type {module:services/rest}
 */
const RestService = require('../services/rest');
/**
 * @type {dw.system.Logger}
 */
const LOGGER = Logger.getLogger('int_ic', 'icscc.contact');

/**
 * @type {/scripts/models/customerModel}
 */
const CustomerModel = require('../models/customerModel');

/**
 * @type {dw.util.StringUtils}
 */
const StringUtils = require('dw/util/StringUtils');

/**
 * Customer contact created
 * @param {dw.customer.Customer} customer
 */
function accountCreated(customer) {
    Transaction.wrap(function(){
        handleExport(customer, 'created');
    });
}

/**
 * Customer account updated
 * @param {dw.customer.Customer} customer
 */
function updateContact (customer, data) { 	
	var contactJSON = data ? data : CustomerModel.call("getMappingData", [customer,"sfdcMappingContactUpdateConf"]);	
	var salesforceAccountID = customer.getProfile().getCustom()["salesforceAccountID"];
	var customerNo = customer.getProfile().getCustomerNo();
	var svc = RestService.get(RestService.serviceIDs.patch); 
	var result = svc.call(StringUtils.format(RestService.servicePaths.update.contact, customerNo), contactJSON);		
	return result;
}

/**
 * Customer account check
 * @param {dw.customer.Customer} customer
 */
function checkContact (salesforceAccountID) {
	try {		
		var svc = RestService.get(RestService.serviceIDs.get);	
		var result = svc.call(StringUtils.format(RestService.servicePaths.get.contact, salesforceAccountID), '');				
		if (result.errorMessage) {
			LOGGER.error('Error code: {0} - Error Message: {1}', result.error, result.errorMessage);
			return false;
		}		
		return true;
	}catch (e){
		LOGGER.error('getContact Function {0}', e.message);
	}
}

function handleExport(customer, status) {
    var sscSyncResponseText;
    var isSyncMode = require('dw/system/Site').current.getCustomPreferenceValue('sscIsAsync') === false;
    try {
        customer.profile.custom.sscSyncStatus = status; 
        if (isSyncMode && status === 'created') {        	
        	var sccContactModel = CustomerModel.call("getMappingData", [customer, "sfdcMappingContactConf"]);        	
            var svc = RestService.get(RestService.serviceIDs.create);            
            var result = svc.call(RestService.servicePaths.create.contact, sccContactModel);            
            if (result.status === 'OK') {
                if (result.object && !result.object.isError && !result.object.isAuthError) {
                    customer.profile.custom.sscSyncStatus = 'exported';
                    customer.profile.custom.salesforceAccountID = result.object.responseObj.ID;
                    sscSyncResponseText = customer.profile.custom.sscSyncResponseText.slice(0);
                    sscSyncResponseText.push('Successfully Exported');
                    customer.profile.custom.sscSyncResponseText = sscSyncResponseText;
                } else {
                    sscSyncResponseText = customer.profile.custom.sscSyncResponseText.slice(0);
                    sscSyncResponseText.push(result.object.errorText);
                    customer.profile.custom.sscSyncResponseText = sscSyncResponseText;
                }
            } else {
                sscSyncResponseText = customer.profile.custom.sscSyncResponseText.slice(0);
                sscSyncResponseText.push(result.msg);
                customer.profile.custom.sscSyncResponseText = sscSyncResponseText;
                //LOGGER.error('Error when create object: {0}', result.msg);                
            }
        }        
    } catch (e) {
        sscSyncResponseText = customer.profile.custom.sscSyncResponseText.slice(0);
        sscSyncResponseText.push(e.message);
        customer.profile.custom.sscSyncResponseText = sscSyncResponseText;
        LOGGER.error('Error occurred updating customer: {0}', e.message);        
    }
    return true;
}

exports.created  = accountCreated;
exports.updated  = updateContact;
exports.ccontact = checkContact;