'use strict';

/**
 * @type {dw/order/OrderMgr}
 */
var OrderMgr = require('dw/order/OrderMgr');

/**
 * @type {module:services/rest}
 */
var RestService = require('../services/rest');

/**
 * @type {dw.util.StringUtils}
 */
var StringUtils = require('dw/util/StringUtils');

/**
 * @type {dw.system.Status}
 */
var Status = require('dw/system/Status');

/**
 * @type {dw.system.Logger}
 */
var Logger = require('dw/system/Logger');

/**
 * @type {dw.system.Logger}
 */
var LOGGER = Logger.getLogger('int_ic_order', 'order.hook');

/**
 * @type {dw.system.Transaction}
 */
var Transaction = require('dw/system/Transaction');

/**
 * @type {module:models/orderModel}
 */
var OrderModel = require('../models/orderModel');

function getList(customerNo,salesforceOrderId) {
	var sfccOList = OrderMgr.searchOrders('customerNo={0} AND status!={1}', 'creationDate desc', customerNo, dw.order.Order.ORDER_STATUS_REPLACED);			
	var orderJSON = {
			 "customerNo" :  customerNo,
			 "salesforceOrderId" : salesforceOrderId
			};
	var result = RestService.get(RestService.serviceIDs.get).call(StringUtils.format(RestService.servicePaths.get.orderlist, customerNo), orderJSON);		
	var totalOrderList = {};	
	if(result.status == 'OK') {			
		var sfdcOList = sfccConvertOrders(JSON.parse(result.object.responseObj).result);
		totalOrderList = sfdcOList;
		var duplicate = false;
		while(sfccOList.hasNext()){		
			var orderSFCC : Order = sfccOList.next();
			for(var orderSFDC in sfdcOList) {			
				if(orderSFCC["orderNo"] == sfdcOList[orderSFDC]["orderNo"]){
					duplicate = true;
				}
			}					
			if(duplicate == false){			
				totalOrderList.push(orderSFCC);
			}					
		}
		
		totalOrderList.sort(function(order1,order2){
			var date1 : Date = new Date(order1["creationDate"]);
			var date2 : Date = new Date(order2["creationDate"]);
			return date2.valueOf() - date1.valueOf();				
		});
		
		var singleOrder; 
		for(singleOrder in totalOrderList){ totalOrderList[singleOrder].hasOwnProperty("isSFDC")
			if(totalOrderList[singleOrder].hasOwnProperty("isSFDC")) {
				totalOrderList[singleOrder]["creationDate"] = sfccDateFormater(totalOrderList[singleOrder]["creationDate"]);			
			}
		}	
		return totalOrderList;
	}	
	return null;	
}

function getDetail(sfccOrderNo) {
	var result = RestService.get(RestService.serviceIDs.get).call(StringUtils.format(RestService.servicePaths.get.order, sfccOrderNo));
	var sfdcOList;	
	if(result.status == 'OK') {			
		sfdcOList = sfccConvertOrder(JSON.parse(result.object.responseObj).results);		
	}
	return sfdcOList;
}

function sfccConvertOrder(sfccOrder) {
	 
	var order = mappingOrderDetail(sfccOrder);	
	return order;
}

function sfccConvertOrders(sfccOList) {
	var sfccOrders = "[";
    var order = 0;
	for(order in sfccOList){
	 	var orderDetail : String = mappingOrderData(sfccOList[order]);	 	 
		sfccOrders += orderDetail;
	 	if(order < sfccOList.length - 1) {
	 		sfccOrders += ',';
	 	}	 	
	}
	sfccOrders += "]";
	return JSON.parse(sfccOrders);
}

function mappingOrderData(order){ 
	var sfccOrder = {
        	"orderNo" : order.Order_External_ID__c,
			"creationDate": order.Order_Date__c, //sfccDateFormater(order.Order_Date__c),
			"status" :	convertOrderStatus(order.External_Order_Status__c),
			"shipments" : [{
				"shippingAddress" : {
					"firstName" : order.Ship_to_First_Name__c,
					"lastName"	: order.Ship_to_Last_Name__c,
					"fullName"	: order.Ship_to_Last_Name__c + " " +order.Ship_to_First_Name__c
				},
				"productLineItems" : [    
                 ]			
			}],
			"custom" : [{
				"salesforceOrderId" : order.salesforceOrderId
			}],
			"customer" : [{
				"profile" : [{
					"custom" : [{
						"salesforceAccountID"	: order.AccountId__c
					}]
				}]
			}],
			"totalGrossPrice" : dw.util.Currency.getCurrency(order.CurrencyIsoCode).symbol + order.Total_Gross_Price__c,
			"isSFDC"		  : order.isSFDC
     	}
	
	for(var i = 0; i < order.Order_Products__c.length ; i++){
		var product = {
            	"productName" : order.Order_Products__c[i].Product_Name__c            	            	            
        	}		
		sfccOrder["shipments"][0]["productLineItems"].push(product);
	}
	return JSON.stringify(sfccOrder);	
}

function mappingOrderDetail(order){
	var sfccOrder = {
        	"orderNo" : order.Order_External_ID__c,
			"creationDate": sfccDateFormater(order.Order_Date__c),
			"status" :	convertOrderStatus(order.External_Order_Status__c),		
			"createdBy" : order.Agent__c,
			"currencyCode" : order.CurrencyIsoCode,
			"customerEmail" : order.Email__c,
			"confirmationStatus" : convertConfirmationStatus(order.External_Confirmation_Status__c),
			"paymentStatus" : convertPaymentStatus(order.paymentStatus), 
			"MerchandizeTotalNetPrice" : order.Merchandize_Net_Price__c,
			"MerchandizeTotalTax" : order.Merchandize_Tax__c,
			"MerchandizeTotalGrossPrice" : order.Merchandize_Gross_Price__c,
			"AdjustedMerchandizeTotalNetPrice" : order.Adjusted_Merchandize_Net_Price__c,
            "AdjustedMerchandizeTotalTax" : order.Adjusted_Merchandize_Tax__c,
            "AdjustedMerchandizeTotalGrossPrice" : order.Adjusted_Shipping_Gross_Price__c,
            "ShippingTotalGrossPrice" : order.Shipping_Gross_Price__c,
            "ShippingTotalNetPrice" : order.Shipping_Net_Price__c,
            "ShippingTotalTax" : order.Shipping_Tax__c,                 
            "AdjustedShippingTotalNetPrice" : order.Adjusted_Shipping_Net_Price__c,             
            "TotalTax" : order.Total_Tax__c,                
            "TotalNetPrice" : order.Total_Net_Price__c,                 
            "AdjustedShippingTotalTax" : order.Adjusted_Shipping_Tax__c,                  
            "TotalGrossPrice" : order.Total_Gross_Price__c,      
            "paymentTransaction"          : [              
		    ],
		    "shipments" : [{
		          "shippingAddress" : {
		                "firstName" : order.Ship_to_First_Name__c,
		                "lastName"  : order.Ship_to_Last_Name__c,
		                "fullName"  : order.Ship_to_Last_Name__c + " " +order.Ship_to_First_Name__c,
		                "address1"  : order.Ship_to_Address_1__c,
		                "address2"  : order.Ship_to_Address_2__c,
		                "city"            : order.Ship_to_City__c,
		                "postalCode"      : order.Ship_to_PostalCode__c,
		                "stateCode"       : order.Ship_to_State_Code__c,
		                "countryCode"     : order.Ship_to_Country_Code__c,
		                "phone"                 : order.Ship_to_Phone__c,
		                "shippingMethodID"      : order.Shipping_Method__c                            
		          },
		          "shippingMethodID"      : order.Shipping_Method__c,
		          "productLineItems" : [    
		          ]                  
		    }],
		    "custom" : [{
		          "salesforceOrderId" : order.salesforceOrderId
		    }],
		    "customer" : [{
		          "profile" : [{
		                "custom" : [{
		                      "salesforceAccountID"   : order.AccountId__c
		                }]
		          }]
		    }],
		    "billingAddress" : {
		          "firstName"  : order.Bill_To_First_Name__c,
		          "lastName"   : order.Bill_To_Last_Name__c,
		          "address1"   : order.Bill_To_Address_1__c,
		          "address2"   : order.Bill_To_Address_2__c,
		          "city"             : order.Bill_To_City__c,
		          "postalCode" : order.Bill_To_Postal_Code__c,
		          "stateCode"  : order.Bill_To_State__c,
		          "countryCode": order.Bill_To_Country__c,
		          "phone"            : order.Bill_to_Phone__c
		    },                                  
		    "totalGrossPrice" : order.Total_Gross_Price__c,
		    "custom1"		  : order.Custom_field_1__c,
		    "isSFDC"          : order.isSFDC       
     	}	
	
		for(var i = 0; i < order.Payment__c.length ; i++){
			var payment = {
	            	"type"                  : order.Payment__c[i].External_transaction_type__c,
	                "transactionID"   :order.Payment__c[i].External_transaction_id__c,
	                "amount"          : order.Payment__c[i].Amount__c,
	                "paymentInstruments" : [{
	                      "paymentMethod"   : {
	                            "name"      			: order.Payment__c[i].Payment_Type__c	                            
	                      },
	                      "custom1"						: order.Payment__c[i].Custom_field_1__c, //The payment card information will be hold here
	                      "creditCardHolder"		    : "Mock Demo Name",
                          "creditCardType"		        : "Visa",
                          "maskedCreditCardNumber"		: "1111",
                          "creditCardExpirationMonth"	: "12",
                          "creditCardExpirationYear"	: "2012"                          
	                }],                             
	                "paymentProcessor" : {
	                      "ID"        : order.Payment__c[i].External_processor_id__c
	                }
	            }	
			sfccOrder["paymentTransaction"].push(payment);
		}
	
	return sfccOrder;
}

function sfccDateFormater(sfdcDate) {
	var date = new Date(sfdcDate);	
	var newDate : String = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getYear();
	return date;
}

function convertOrderStatus(status){
	var numStatus;
	switch (status) {
	case "OPEN" 	: numStatus = 4;
				  	  break;
	case "CANCELLED": numStatus = 6;
	  			  	  break;
	case "COMPLETED": numStatus = 5;
  	  				  break;
	case "CREATED" 	: numStatus = 0;
  	  				  break;
	case "FAILED" 	: numStatus = 8;
  	  				  break;
	case "NEW"	 	: numStatus = 3;
  	  				  break;
	case "REPLACED"	: numStatus = 7;
					  break;		
	default		: numStatus = null;
    			  break;
	}
	return numStatus;
}

function convertConfirmationStatus(status){
	var numStatus;
	switch (status) {
		case "CONFIRMED"	: numStatus = 2;
					  	  	  break;
		case "NOTCONFIRMED" : numStatus = 0;
		  			  	  	  break;
		default		: numStatus = null;
        			  break;
	}
	return numStatus;
}

function convertPaymentStatus(status){
	var numStatus;
	switch (status) {
		case "NOTPAID"	: numStatus = 0;
					   	  break;
		case "PAID" 	: numStatus = 2;
		  			  	  break;
		case "PARTPAID" : numStatus = 1;
  	  	  			  	  break;
		default		: numStatus = null;
        			  break;
	}
	return numStatus;
}

function afterPATCH(order : Order, orderInput : Order){
	order.custom.sfdcOrderStatus = 'Cancellation completed';
	return new Status(Status.OK);
}

function exportedOrder(order : Order){	
	var orderJSON = OrderModel.call("getOrderMappingData", order);
	var result = RestService.get(RestService.serviceIDs.create).call(RestService.servicePaths.create.order, JSON.parse(orderJSON));		
	if(result.status == 'OK') {
		Transaction.wrap(function(){
			order.setExportStatus(1);
			order.custom.salesforceOrderId = result.object.responseObj.salesforceOrderId; 
			order.custom.sfdcOrderStatus   = 'EXPORTED';
		});  	    
	} else {
		LOGGER('Cant create Order: {0} - Messenger: {1}',order.orderNo,result);		
	}	
}
exports.getlist = getList;
exports.getdetail = getDetail;
exports.exported = exportedOrder;
exports.afterPATCH = afterPATCH;
