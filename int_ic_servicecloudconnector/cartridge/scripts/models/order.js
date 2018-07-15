'use strict';

/**
 * @module models/order
 */

/**
 * Order class
 * @param {dw.order.Order} [order] Order object
 * @constructor
 * @alias module:models/order~Order
 */
function Order(order) {
    if (empty(order)) {
        throw new Error('order object is empty. Order requires an order object to continue.');
    }

    /**
     * @type {string} The object type represented in Service Cloud
     */
    this.type = 'Order';

    /**
     * @type {dw.order.Order}
     */
    this.order = order;

    /**
     * @type {dw.customer.Profile}
     */
    this.profile = !empty(order.customer) ? (!empty(order.customer.profile) ? order.customer.profile : {}) : {};
}

/**
 * @alias module:models/order~Order#prototype
 */
Order.prototype = {
    /**
     * Builds up a formatted object for JSON.stringify()
     * @returns {Object}
     */
    toJSON: function() {
        var toJSON = {
            order_no: this.order.orderNo,
            status: "Draft",
            order_total: this.order.totalGrossPrice.value,
            scc_sync_status: "Created"
        };

        if (this.order.customer.authenticated && this.profile.custom) {
            toJSON.crmcontact_id = this.profile.custom.sscid;
        }

        return toJSON;
    }
};

module.exports = Order;
