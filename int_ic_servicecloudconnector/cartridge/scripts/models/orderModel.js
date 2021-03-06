
function getOrderMappingData(order : Order){
	var orderJSON = '{';
  	 orderJSON += '"Order_External_ID__c" : "' + order.orderNo + '",';
  	 orderJSON += '"Order_Date__c" : "' + order.creationDate + '",';
  	 orderJSON += '"Agent__c" : "' + order.getCreatedBy() + '",';
  	 orderJSON += '"CurrencyIsoCode" : "' + order.currencyCode + '",';
  	 orderJSON += '"salesforceOrderId" : "' + order.custom.salesforceOrderId + '",';
  	 orderJSON += '"AccountNumber" : "' + order.customerNo + '",';
  	 orderJSON += '"AccountId__c" : "' + (order.customer.profile ? (order.customer.profile.custom.salesforceAccountID ? order.customer.profile.custom.salesforceAccountID : "") : "") + '",'; //undifined
  	 orderJSON += '"Email__c" : "' + order.customerEmail + '",';
  	 orderJSON += '"Bill_To_First_Name__c" : "' + order.billingAddress.firstName + '",';
  	 orderJSON += '"Bill_To_Last_Name__c" : "' + order.billingAddress.lastName + '",';
  	 orderJSON += '"Bill_To_Address_1__c" : "' + order.billingAddress.address1 + '",';
  	 orderJSON += '"Bill_To_Address_2__c" : "' + order.billingAddress.address2 + '",';
  	 orderJSON += '"Bill_To_City__c" : "' + order.billingAddress.city + '",';
  	 orderJSON += '"Bill_To_Postal_Code__c" : "' + order.billingAddress.postalCode + '",';
  	 orderJSON += '"Bill_To_State__c" : "' + order.billingAddress.stateCode + '",';
  	 orderJSON += '"Bill_To_Country__c" : "' + order.billingAddress.countryCode.displayValue + '",';
  	 orderJSON += '"Bill_to_Phone__c" : "' + order.billingAddress.phone + '",';
  	 orderJSON += '"External_Order_Status__c" : "' + order.status.displayValue + '",';
  	 orderJSON += '"External_Confirmation_Status__c" : "' + order.confirmationStatus.displayValue + '",';
  	 orderJSON += '"External_Payment_Status__c" : "' + order.paymentStatus.displayValue + '",';
  	 orderJSON += '"Merchandize_Net_Price__c" : ' + order.getMerchandizeTotalNetPrice() + ',';
  	 orderJSON += '"Merchandize_Tax__c" : ' + order.getMerchandizeTotalTax() + ',';
  	 orderJSON += '"Merchandize_Gross_Price__c" : ' + order.getMerchandizeTotalGrossPrice() + ',';
  	 orderJSON += '"Adjusted_Merchandize_Net_Price__c" : ' + order.getAdjustedMerchandizeTotalNetPrice() + ',';
  	 orderJSON += '"Adjusted_Merchandize_Tax__c" : ' + order.getAdjustedMerchandizeTotalTax() + ',';
  	 orderJSON += '"Adjusted_Shipping_Gross_Price__c" : ' + order.getAdjustedShippingTotalGrossPrice() + ',';
  	 orderJSON += '"Shipping_Net_Price__c" : ' + order.getShippingTotalNetPrice() + ',';
  	 orderJSON += '"Shipping_Tax__c" : ' + order.getShippingTotalTax() + ',';
  	 orderJSON += '"Shipping_Gross_Price__c" : ' + order.getShippingTotalGrossPrice() + ',';
  	 orderJSON += '"Adjusted_Merchandize_GrossPrice__c" : ' + order.getAdjustedMerchandizeTotalGrossPrice() + ','; 
  	 orderJSON += '"Adjusted_Shipping_Net_Price__c" : ' + order.getAdjustedShippingTotalNetPrice() + ',';
  	 orderJSON += '"Adjusted_Shipping_Tax__c" : ' + order.getAdjustedShippingTotalTax() + ',';
  	 orderJSON += '"Total_Net_Price__c" : ' + order.getTotalNetPrice() + ',';
  	 orderJSON += '"Total_Tax__c" : ' + order.getTotalTax() + ',';
  	 orderJSON += '"Total_Gross_Price__c" : ' + order.getTotalGrossPrice() + ',';   	   	 
  	 orderJSON += '"Ship_to_First_Name__c" : "' + order.shipments[0].shippingAddress.firstName + '",';			//Shipment
  	 orderJSON += '"Ship_to_Last_Name__c" : "' + order.shipments[0].shippingAddress.lastName + '",';
  	 orderJSON += '"Ship_to_Address_1__c" : "' + order.shipments[0].shippingAddress.address1 + '",';
  	 orderJSON += '"Ship_to_Address_2__c" : "' + order.shipments[0].shippingAddress.address2 + '",';
  	 orderJSON += '"Ship_to_City__c" : "' + order.shipments[0].shippingAddress.city + '",';
  	 orderJSON += '"Ship_to_PostalCode__c" : "' + order.shipments[0].shippingAddress.postalCode + '",';
  	 orderJSON += '"Ship_to_State_Code__c" : "' + order.shipments[0].shippingAddress.stateCode + '",';
  	 orderJSON += '"Ship_to_Country_Code__c" : "' + order.shipments[0].shippingAddress.countryCode.displayValue + '",';
  	 orderJSON += '"Ship_to_Phone__c" : "' + order.shipments[0].shippingAddress.phone + '",';
  	 orderJSON += '"Shipping_Method__c" : "' + order.shipments[0].shippingMethod.displayName + '",';   	 
  	 var n;																									//Product
  	 orderJSON += '"Order_Products__c": [';
  	 var numProduct = order.productLineItems.length;
  	 for(n = 0; n < order.productLineItems.length; n++){
  	 	if(order.productLineItems[n].bundledProductLineItems != null) {
  	 		numProduct += order.productLineItems[n].bundledProductLineItems.length;
  	 	}   	 	
  	 	if(order.productLineItems[n].optionModel != null) {
  	 		numProduct += order.productLineItems[n].optionModel.getOptions().length;
  	 	}
  	 } 
  	 for(n = 0; n < numProduct; n++){
  	 	orderJSON += '{';
  	 	orderJSON += '"Position__c" : ' + order.allProductLineItems[n].position + ',';
  	 	orderJSON += '"Product_SKU__c" : "' + order.allProductLineItems[n].productID + '",';
  	 	orderJSON += '"Product_Name__c" : "' + order.allProductLineItems[n].productName.toString().replace('"', '\\"') + '",';
  	 	orderJSON += '"Ordered_Quantity__c" : ' + order.allProductLineItems[n].quantityValue + ',';
  	 	orderJSON += '"Base_Price__c" : ' + order.allProductLineItems[n].adjustedPrice.value + ',';
  	 	orderJSON += '"Gross_Price__c" : ' + order.allProductLineItems[n].adjustedGrossPrice.value + ',';
  	 	orderJSON += '"Net_Price__c" : ' + order.allProductLineItems[n].adjustedNetPrice.value + ',';
  	 	orderJSON += '"Tax__c" : ' + order.allProductLineItems[n].adjustedTax.value + ',';
  	 	orderJSON += '"TaxRate__c" : ' + order.allProductLineItems[n].taxRate + ',';  
  	 	var productDiscountBasePrice = 0;
		var productDiscountNetPrice = 0;
		var productDiscountGrossPrice = 0;
		var productTaxPrice = 0;
		var productCampaignIDs = "";
		var productCouponIDs = "";
		var productPromotionIDs = ""; 	 	  
  	 	if(order.allProductLineItems[n].getPriceAdjustments().empty === false) {   	 		
  	 		var pa;
			for(pa in order.allProductLineItems[n].getPriceAdjustments()){
				productDiscountBasePrice += order.allProductLineItems[n].getPriceAdjustments()[pa].getBasePrice();
				productDiscountNetPrice += order.allProductLineItems[n].getPriceAdjustments()[pa].getNetPrice();
				productDiscountGrossPrice += order.allProductLineItems[n].getPriceAdjustments()[pa].getGrossPrice();
				productCampaignIDs += order.allProductLineItems[n].getPriceAdjustments()[pa].getCampaignID() + ';';
				productPromotionIDs += order.allProductLineItems[n].getPriceAdjustments()[pa].getPromotionID()  + ';';
				productTaxPrice += order.allProductLineItems[n].getPriceAdjustments()[pa].getTax();
				if(order.allProductLineItems[n].getPriceAdjustments()[pa].getCouponLineItem() != null){
					productCouponIDs += order.allProductLineItems[n].getPriceAdjustments()[pa].getCouponLineItem().couponCode  + ';';
				}			
			}
		}
  	 	orderJSON += '"Product_Promotions__c" : "' + productPromotionIDs + '",';
  	 	orderJSON += '"Product_Campaign__c" : "' + productCampaignIDs + '",';
  	 	orderJSON += '"Product_Coupons__c" : "' + productCouponIDs + '",';
  	 	orderJSON += '"Product_Discount_Base_Price__c" : ' + productDiscountBasePrice + ',';
  	 	orderJSON += '"Product_Discount_Net_Price__c" : ' + productDiscountNetPrice + ',';
  	 	orderJSON += '"Product_Discount_Tax__c" : ' + productTaxPrice + ',';
  	 	orderJSON += '"Product_Discount_Gross_Price__c" : ' + productDiscountGrossPrice;
  	 	if(n == numProduct - 1 ){
  	 	   orderJSON +=	'}';
  	 	} else {
  	 	   orderJSON +=	'},';
  	 	}   	    	 	
  	 }   
  	 orderJSON += '],'; 
  	 orderJSON += '"Payment__c": [';
  	 for(n = 0; n < order.paymentInstruments.length; n++){																		
	  	orderJSON += '{'; 
	  	orderJSON += '"Payment_Type__c" : "' + dw.order.PaymentMgr.getPaymentMethod(order.paymentInstruments[n].paymentMethod).name + '",';
	  	orderJSON += '"Amount__c" : ' + order.paymentInstruments[n].paymentTransaction.amount.value + ',';
	  	orderJSON += '"External_processor_id__c" : "' + order.paymentInstruments[n].paymentTransaction.paymentProcessor.ID + '",';
	  	orderJSON += '"External_transaction_id__c" : "' + order.paymentInstruments[n].paymentTransaction.transactionID + '",';
	  	orderJSON += '"External_transaction_type__c" : "' + order.paymentInstruments[n].paymentTransaction.type.value + '",';
	  	orderJSON += '"Custom_field_1__c" : "' + 'creditCardNumber' + order.paymentInstruments[n].creditCardNumber + '; creditCardHolder' + order.paymentInstruments[n].creditCardHolder + '; creditCartToken' + order.paymentInstruments[n].creditCardToken + '; creationDate' + order.paymentInstruments[n].creationDate + "; creditCardExpirationMonth" + order.paymentInstruments[n].creditCardExpirationMonth + '; creditCardExpirationYear' + order.paymentInstruments[n].creditCardExpirationYear + '; creditCardIssueNumber' + order.paymentInstruments[n].creditCardIssueNumber + '; creditCardType' + order.paymentInstruments[n].creditCardType + '",';
	  	orderJSON += '"Custom_field_2__c" : "' + '' + '",';
	  	orderJSON += '"Custom_field_3__c" : "' + '' + '",';
	  	orderJSON += '"Status__c" : "' + order.paymentStatus.displayValue + '"';
  	 	if(n == order.paymentInstruments.length - 1 ){
  	 	   orderJSON +=	'}';
  	 	} else {
  	 	   orderJSON +=	'},';
  	 	} 
  	 }
  	orderJSON += ']}';
	return orderJSON;	
}

module.exports = getOrderMappingData;