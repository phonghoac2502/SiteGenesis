'use strict';
/**
* Description of the module and the logic it provides
*
* @module cartridge/scripts/models/SystemModel
*/

function sfdcMappingContactConf(){	
	var sfdcMappingContactConf = {
		"customerNo"                : "Customer_Number__c",
		"birthday"                  : "PersonBirthdate",
		"companyName"               : "Company_Name__c",
		"email"                     : "PersonEmail",  
		"fax"                       : "Fax",
		"firstName"                 : "FirstName",
		"gender"                    : "Gender__c",
		"title"                     : "PersonTitle",
		"lastName"                  : "LastName",
		"phoneBusiness"             : "Phone_Business__c",
		"phoneHome"                 : "PersonHomePhone",
		"phoneMobile"               : "PersonMobilePhone",
		"salutation"                : "Salutation",  
		"ID"       				    : "Ocapi_Customer_Number__c"
	};	
	return sfdcMappingContactConf;
}

function sfdcMappingContactUpdateConf(){	
	var sfdcMappingContactUpdateConf = {
		"customerNo"                : "Customer_Number__c",
		"birthday"                  : "PersonBirthdate",
		"companyName"               : "Company_Name__c",
		"email"                     : "PersonEmail",  
		"fax"                       : "Fax",
		"firstName"                 : "FirstName",
		"gender"                    : "Gender__c",
		"title"                     : "PersonTitle",
		"lastName"                  : "LastName",
		"phoneBusiness"             : "Phone_Business__c",
		"phoneHome"                 : "PersonHomePhone",
		"phoneMobile"               : "PersonMobilePhone",
		"salutation"                : "Salutation"	
	}
	return sfdcMappingContactUpdateConf;
}

function sfdcMappingProduct(){
	var sfdcMappingProduct = {
		"onlineFlag"       : "IsActive",
		"pageURL" 	 	   : "DisplayUrl",
		"ID" 		       : "ExternalId",
		"ProductCode" 	   : "ProductCode", 
		"pageExternalURL"  : "ExternalURL", 
		"shortDescription" : "Description", 		
		"productType"	   : "Family", 
		"name"			   : "Name",
		"SKU" 			   : "StockKeepingUnit",
		"unit"			   : "QuantityUnitOfMeasure"		
	}
	return sfdcMappingProduct;
}

exports.sfdcMappingContactConf 		 = sfdcMappingContactConf;
exports.sfdcMappingContactUpdateConf = sfdcMappingContactUpdateConf;
exports.sfdcMappingProduct 		     = sfdcMappingProduct;