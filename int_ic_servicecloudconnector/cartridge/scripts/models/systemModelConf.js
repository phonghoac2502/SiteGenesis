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

function sfdcMappingAddressCreateConf(){
	var sfdcMappingContactConf = {
			"State"             : "State__c",
			"PostalCode"        : "PostalCode__c",
			"LastNameKatakana"  : "Last_Name_Katakana__c",
			"LastName"          : "Last_Name__c",  
			"IsDefault"         : "Is_Default__c",
			"FirstNameKatakana" : "First_Name_Katakana__c",
			"FirstName"         : "First_Name__c",
			"Country"           : "Country__c",
			"City"              : "City__c",
			"AddressBookName"   : "External_Address_Name__c",
			"Address1"          : "Address_1__c",
			"Address2"          : "Address_2__c",
			"Address3"			: "Address_3__c"
		};	
		return sfdcMappingContactConf;
}

exports.sfdcMappingContactConf 		 = sfdcMappingContactConf;
exports.sfdcMappingContactUpdateConf = sfdcMappingContactUpdateConf;