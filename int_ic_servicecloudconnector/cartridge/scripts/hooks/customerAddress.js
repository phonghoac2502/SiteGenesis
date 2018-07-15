'use strict';

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
const LOGGER = Logger.getLogger('int_ic', 'icscc.address');

/**
 * @type {dw.util.StringUtils}
 */
const StringUtils = require('dw/util/StringUtils');


/**
 * Create Customer Address
 * @param {dw.customer.CustomerAddress} customerAddress
 * @param {dw.customer.Customer} customer
 */
function createCustomerAddress(customerAddress, customer) {
	var addressJSON = generateCustomerAddressJSONForCreate(customerAddress);
	var customerNo = customer.getProfile().getCustomerNo();
	var svc = RestService.get(RestService.serviceIDs.create);
	var urlPath = StringUtils.format(RestService.servicePaths.create.customerAddress, customerNo);
	var result = svc.call(urlPath, addressJSON);
	return result;
}

/**
 * Customer adress updated
 * @param {dw.customer.CustomerAddress} customerAddress
 * @param {dw.customer.Customer} customer
 */
function updateCustomerAddress(customerAddress, customer) {
	var addressJSON = generateCustomerAddressJSONForUpdate(customerAddress);
	var customerNo = customer.getProfile().getCustomerNo();
	var addressId = customerAddress.getID();
	var svc = RestService.get(RestService.serviceIDs.put);
	var urlPath = StringUtils.format(RestService.servicePaths.update.customerAddress, customerNo, addressId);
	var result = svc.call(urlPath, addressJSON);
	return result;
}

/**
 * Customer adress updated
 * @param {dw.customer.CustomerAddress} customerAddress
 * @param {dw.customer.Customer} customer
 */
function setDefaultAddress(customerAddress, customer) {
	var addressDefaultJSON = {
	    "IsDefault": true
	}
	var customerNo = customer.getProfile().getCustomerNo();
	var addressId = customerAddress.getID();
	var svc = RestService.get(RestService.serviceIDs.patch);
	var urlPath = StringUtils.format(RestService.servicePaths.update.customerAddress, customerNo, addressId);
	var result = svc.call(urlPath, addressDefaultJSON);
	return result;
}

/**
 * Customer adress updated
 * @param {dw.customer.CustomerAddress} addressID
 * @param {dw.customer.Customer} customer
 */

function removeCustomerAddress(addressID, customer) {
	var customerNo = customer.getProfile().getCustomerNo();
	var urlPath = StringUtils.format(RestService.servicePaths.remove.customerAddress, customerNo, addressID);
	var svc = RestService.get(RestService.serviceIDs.remove);
	var result = svc.call(urlPath);
	return result;
}

function generateCustomerAddressJSONForUpdate(customerAddress) {
	var addressJSON = {
	    "State": customerAddress.stateCode,
	    "PostalCode": customerAddress.postalCode,
	    "LastNameKatakana": customerAddress.custom.lastNameKana,
	    "LastName": customerAddress.lastName,
	    "FirstNameKatakana": customerAddress.custom.firstNameKana,
	    "FirstName": customerAddress.firstName,
	    "Country": customerAddress.countryCode.value.toString().toUpperCase(),
	    "City": customerAddress.city,
	    "Address1": customerAddress.address1,
	    "Address2": customerAddress.address2,
	    "Address3": customerAddress.custom.address3
	}
	return addressJSON;
}

function generateCustomerAddressJSONForCreate(customerAddress) {
	var addressJSON = {
	    "State": customerAddress.stateCode,
	    "PostalCode": customerAddress.postalCode,
	    "LastNameKatakana": customerAddress.custom.lastNameKana,
	    "LastName": customerAddress.lastName,
	    "FirstNameKatakana": customerAddress.custom.firstNameKana,
	    "FirstName": customerAddress.firstName,
	    "Country": customerAddress.countryCode.value.toString().toUpperCase(),
	    "City": customerAddress.city,
	    "Address1": customerAddress.address1,
	    "Address2": customerAddress.address2,
	    "Address3": customerAddress.custom.address3,
	    "ExternalAddressName": customerAddress.getID()
	}
	return addressJSON;
}


exports.updated = updateCustomerAddress;
exports.setDefaultAddress = setDefaultAddress;
exports.created = createCustomerAddress;
exports.removed = removeCustomerAddress;