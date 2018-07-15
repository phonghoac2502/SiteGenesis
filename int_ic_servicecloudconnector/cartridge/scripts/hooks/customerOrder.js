'use strict';

/**
 * @module hooks/customerOrder
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
const LOGGER = Logger.getLogger('int_ic', 'hooks.customerOrder');

/**
 * Customer order created
 * @param {dw.order.Order} order
 */
function orderCreated(order) {
    Transaction.wrap(function(){
        handleExport(order, 'created');
    });
}

/**
 * Customer order updated
 * @param {dw.order.Order} order
 */
function orderUpdated(order) {
    Transaction.wrap(function(){
        handleExport(order, 'updated');
    });
}

function handleExport(order, status) {
    var sscSyncResponseText;
    var isSyncMode = require('dw/system/Site').current.getCustomPreferenceValue('sscIsAsync') === false;
    try {
        order.custom.sscSyncStatus = status;
        // TODO: need to add rest service to update existing object
        if (isSyncMode && status === 'created') {
            var sccOrderModel = new (require('../models/order'))(order);
            var svc = RestService.get(RestService.serviceIDs.create);
            var result = svc.call(RestService.servicePaths.create.order, sccOrderModel);
            if (result.status === 'OK') {
                if (result.object && !result.object.isError && !result.object.isAuthError){
                    order.custom.sscSyncStatus = 'exported';
                    order.custom.salesforceAccountID = result.object.responseObj.recordId;
                    sscSyncResponseText = order.custom.sscSyncResponseText.slice(0);
                    sscSyncResponseText.push('Successfully Exported');
                    order.custom.sscSyncResponseText = sscSyncResponseText;
                } else {
                    sscSyncResponseText = order.custom.sscSyncResponseText.slice(0);
                    sscSyncResponseText.push(result.object.errorText);
                    order.custom.sscSyncResponseText = sscSyncResponseText;
                }
            } else {
                sscSyncResponseText = order.custom.sscSyncResponseText.slice(0);
                sscSyncResponseText.push(result.msg);
                order.custom.sscSyncResponseText = sscSyncResponseText;
            }
        }
    } catch(e) {
        sscSyncResponseText = customer.profile.custom.sscSyncResponseText.slice(0);
        sscSyncResponseText.push(e.message);
        customer.profile.custom.sscSyncResponseText = sscSyncResponseText;
        LOGGER.error('Error occurred updating order: {0}', e.message);
        throw e;
    }
}

exports.created = orderCreated;
exports.updated = orderUpdated;