'use strict';

/**
 * @module hooks/mapping
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
const LOGGER = Logger.getLogger('int_ic', 'test.mapping');
/**
 * @type {dw.customer.CustomerMgr}
 */
const customerMgr = require('dw/customer/CustomerMgr')

/**
 * @type {dw.util.StringUtils}
 */
const StringUtils = require('dw/util/StringUtils');

/**
 * @type {/scripts/models/customerModel}
 */
const CustomerModel = require('../models/customerModel');

/**
 * @type {/scripts/models/systemModelConf}
 */
const SystemModelConf = require('../models/systemModelConf');

/**
 * Customer mapping sobject
 */
function Mapping() {
	var y = 'Start';
	var textA = SystemModelConf.sfdcMappingContactConf();
	var x = 'Ok';
    /**
	Transaction.wrap(function(){
        handleExport(customer, 'created');
    });
//    **/
//	try{
//		//Get Mapping Data
//		var sitePrefs : SitePreferences = dw.system.Site.getCurrent().getPreferences();
//		var contactMappingData = sitePrefs.getCustom()["SFDC_Mapping_Contact"];	
//		var contactJSON = JSON.parse(contactMappingData);
//		
//		//Get Customer Data
//		var customerProfile = customerMgr.getCustomerByCustomerNumber("00007007").getProfile();
//		var customAttribute  = customerProfile.getCustom();	
//		
//		//Get sfdc group attributes // Same as Order
//		customAttribute["sscid"];
//		customAttribute["sscSyncResponseText"][0];		
//		customAttribute["sscSyncStatus"].displayValue;
//		
//		/* Mock using to check object key exist in Object 
//		var inObject = false;
//		var inCustomObject = false;		
//		//Check in object
//		if ("sscid" in customerProfile){
//			inObject = true;
//		}
//		
//		if ("sscid" in customAttribute){
//			inCustomObject = true;
//		}
//		*/
//		
//		//Loop the JSON Object		
//		var object;
//		var JSONResult : Object = {};
//		for(object in contactJSON){
//			if ((object in customerProfile) || (object in customAttribute)) {
//			  //Set default value if the field exist but do not have value
//			  if (!(customerProfile[object]) && !(customerProfile[object])) {
//				  JSONResult[contactJSON[object]] = "";
//			  } else {
//			      JSONResult[contactJSON[object]] = customerProfile[object] ? customerProfile[object] : customAttribute[object];
//			  }
//			}			
//		}				
//		//Convert to JSON
//		var JSONResult = JSON.stringify(JSONResult);
//		var endPoint = "Mapping Data result by JSON success!";
//	} catch (e){
//		LOGGER.error('Mapping Function {0}', e.message);
//	}
}

function updateContact (customer) {
	//Update Data Field - Will update field control on Site Preferences later
	var contactJSON = {                    	        	
    	"FirstName" : customer.getProfile().getFirstName(),
    	"LastName"  : customer.getProfile().getLastName(),
    	"Email"     : customer.getProfile().getEmail()
    };	
	
	var sscid = customer.getProfile().getCustom()["sscid"];
	if (checkContact(sscid)) {
		var svc = RestService.get(RestService.serviceIDs.patch);
		var result = svc.call(StringUtils.format(RestService.servicePaths.update.contact, sscid), contactJSON);
		return result;
	}
	return false;	
}

function checkContact (sscid) {
	try {		
		var svc = RestService.get(RestService.serviceIDs.get);	
		var result = svc.call(StringUtils.format(RestService.servicePaths.get.contact, sscid), '');		
		//Save log if check error
		if (result.errorMessage) {
			LOGGER.error('Error code: {0} - Error Message: {1}', result.error, result.errorMessage);
			return false;
		}		
		return true;
	}catch (e){
		LOGGER.error('getContact Function {0}', e.message);
	}
}

function getMappingData(customer){
	var mappingObj : Object = [customer,"SFDC_Mapping_Contact"];    
	var JSONResult = CustomerModel.call("getMappingData", [customer,"SFDC_Mapping_Contact"]);	
	return JSONResult;
}

function handleExport() {
	LOGGER.error('Mapping custom object with sObject');
}

exports.mapping = Mapping;
exports.update  = updateContact;
exports.ccontact = checkContact;
exports.getmapping = getMappingData;