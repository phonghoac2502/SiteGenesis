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
 * Refund update
 * @param refund
 */
function updateRefund(refund) {
	var refundJSON = generateRefundJSON(refund);
	var refundId = refund.RefundId;
	var svc = RestService.get(RestService.serviceIDs.put);
	var urlPath = StringUtils.format(RestService.servicePaths.refund.customerAddress, refundId);
	var result = svc.call(urlPath, addressJSON);
	return result;
}

function generateRefundJSON(refund) {
	var refundJSON = {
	    "Status": refund.status,
	    "Comment": refund.comment
	}
	return refundJSON;
}


exports.update = updateRefund;