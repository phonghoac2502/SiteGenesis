/**
* Description of the module and the logic it provides
*
* @module cartridge/scripts/product/ExportProductsSFDC
*/

'use strict';

// HINT: do not put all require statements at the top of the file
// unless you really need them for all functions

/**
* Description of the function
*
* @return {String} The string 'myFunction'
*/
// var myFunction = function(){
//     return 'myFunction';
// }

/* Exports of the modules */
///**
//* @see {@link module:cartridge/scripts/product/ExportProductsSFDC~MyFunction} */
//exports.MyFunction = myFunction;

/**
 * @type {module:services/rest}
 */
var RestService = require('../services/rest');

/**
 * @type {/scripts/models/customerModel}
 */
var SystemModel = require('../models/systemModelConf');
var StringUtils = require('dw/util/StringUtils');
var System = require('dw/system/System');
var Site = require('dw/system/Site');
var URLUtils = require('dw/web/URLUtils');

importPackage( dw.io );
importPackage( dw.catalog );

function execute( args : PipelineDictionary ) : Number
{		   
   var productIter : SeekableIterator = ProductMgr.queryAllSiteProducts();
   if(productIter.count > 0){   	   
	   var timestamp : String = StringUtils.formatCalendar(System.getCalendar(), "yyyyMMddHHmmss");
	   var siteID = Site.getCurrent().getID();		
	   var folder : File = new File(File.IMPEX + '/src/' + 'Product');
	   if(!folder.exists() && !folder.mkdirs()){
	   	throw new Error('Could not create folder '+Product);
	   }         	   
	   var file : File = new File(File.IMPEX + '/src/Product/ProductList_' + siteID + '_' + timestamp + '.csv');	   
	   var headerNeeded=false;
	   if (!file.exists()) {
	     headerNeeded=true;
	   }
	   var encoding = 'UTF-8';
	   var writer : FileWriter = new FileWriter(file,encoding,true);
	   var header='ProductCode,Name,Description,StockKeepingUnit__c,StyleID__c,GlobalID__c,Color__c,Size__c,DisplayURL__c,OnlineFrom__c,OnlineTo__c,Product_External_Id__c\r\n';
	   if(headerNeeded){
	   	writer.write(header);
	   }
	   
	   var productItem : Product;	   	  
	   while(productIter.hasNext()){
		   	productItem = productIter.next();
		   	var DataLine = productItem["ID"] + ',' + productItem["name"] + ',' + productItem["shortDescription"] + ',' + getSKU(productItem) + ',' + productItem.getCustom()["styleNumber"] + ',' + productItem.getCustom()["globalArticleId"] + ',' + productItem.getCustom()["color"] + ',' + productItem.getCustom()["size"] + ',' + getProductDisplayURL(productItem) + ',' + dateFommater(productItem["onlineFrom"]) + ',' + dateFommater(productItem["onlineTo"]) + ',' + productItem["ID"]; 
		   	writer.writeLine(DataLine);
		   	writer.flush();	   		   	
	    } 	   
   }
   writer.close();
   return PIPELET_NEXT;
}

function getProductDisplayURL(product : Product){
 return System.getInstanceHostname()  + URLUtils.url("Product-Show","pid",product.ID);
}

function getSKU(product : Product){	
	if(product.getUPC()){
		return product.getUPC();
	}	
	if(product.getEAN()){
		return product.getEAN(); 
	}	
	return null;
}

function dateFommater(date : Date) {
	if(date){
		return (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getYear();
	}
	return "";
}
