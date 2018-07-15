'use strict';

/**
 * @module models/customerModel
 * Modify by PhuocPN
 * Mapping with Contact sobject on SFDC
 */

/**
 * @type {dw.system.Logger}
 */
const Logger = require('dw/system/Logger');

/**
 * @type {/scripts/models/systemModelConf}
 */
const SystemModelConf = require('../models/systemModelConf');

/**
 * Get Mapping Data from Site Preferences
 * @param {dw.customer.Customer} [customer] Customer object
 * @param {dw.customer.Profile} [profile] Profile object
 * @constructor
 * @alias module:models/contact~Contact
 */

function getMappingData(mappingObj){
	/**
	 * Get Custom Object 
	 */
	var customer = mappingObj[0];
	var type = mappingObj[1];
	
	if (empty(customer) || empty(customer.profile)) {
        throw new Error('Contact requires a registered customer profile to continue.');
    }
	
	/**
     * Dynamic Profile with JSON config from Custocm References
     */	
	var customerProfile = customer.getProfile();
    var customAttribute = customerProfile.getCustom();	
    
    /**
     * Get Mapping Data
     */	
	var contactJSON;
	if(type == 'sfdcMappingContactConf') {
		contactJSON = SystemModelConf.sfdcMappingContactConf();
	}else{
		contactJSON = SystemModelConf.sfdcMappingContactUpdateConf();
	}	
	
	/**
	 * Create the JSON Object for Contact attribute
	 */		
	var object;	
	var JSONResult : Object = {};			
	for(object in contactJSON){		
		if ((object in customerProfile) || (object in customAttribute)) {			
		  if (object == "gender") { 
			 if (!customerProfile.hasOwnProperty(object) && customerProfile[object] != null) {
			   JSONResult[contactJSON[object]] = customerProfile[object].value;
			 }
		  } else {
			  if(object == "birthday"){
				  if (customerProfile[object] != null) {
					JSONResult["PersonBirthdate"] = sfccDateFormater(customerProfile[object]);
				  } else {
					  JSONResult["PersonBirthdate"] = "";  
				  }
			  } else {				  
				  JSONResult[contactJSON[object]] = !customerProfile.hasOwnProperty(object) ? customerProfile[object] : customAttribute[object];
				  if(object == 'firstName') {
					  JSONResult["FirstName"] = "Account";  
				  }
				  if(object == 'lastName') {
					  JSONResult["LastName"] = "ASCIS";
				  }
			  }
		  }
		}		
		if (object in customer) {
			JSONResult[contactJSON[object]] = customer[object];		
		}
	}		
	return JSONResult;	
}

function sfccDateFormater(sfdcDate) {
	var date = new Date(sfdcDate);	
	var newDate : String = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getYear(); 
	return newDate;
}

module.exports = getMappingData;
