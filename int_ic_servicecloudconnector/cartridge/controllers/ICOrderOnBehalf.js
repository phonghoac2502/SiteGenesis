/**
* Description of the Controller and the logic it provides
*
* @module  controllers/ICServicecloud
*/

'use strict';
const AgentUserMgr = require("dw/customer/AgentUserMgr");
const CustomerMgr = require("dw/customer/CustomerMgr");
const StringUtils = require("dw/util/StringUtils"); 
const URLUtils = require('dw/web/URLUtils');
var guard = require('*/cartridge/scripts/guard');
// HINT: do not put all require statements at the top of the file
// unless you really need them for all functions

/**
* Description of the function
*
* @return {String} The string 'myFunction'
*/
var access = function(){	
	if(request.getHttpHeaders().hasOwnProperty("authorization")) {		
		var hostname = request.getHttpParameterMap()["hostname"].value;
		var serviceCloudHostname : String = dw.system.Site.getCurrent().getPreferences().getCustom()["serviceCloudHostname"];
		var hostnames = serviceCloudHostname.split(",");
		if(hostname && (hostnames.indexOf(hostname) == 1)){
			var base64decoded : String = StringUtils.decodeBase64(request.getHttpHeaders()["authorization"].substr(6), "UTF-8");	
	        var userName : String = base64decoded.split(":")[0];
	        var password : String = base64decoded.split(":")[1];
			
			var customerNo;
			if(request.getHttpParameterMap().hasOwnProperty("CustomerNo")) {
				customerNo = request.getHttpParameterMap()["CustomerNo"];
			}else{
				response.getWriter().println('{"SFCCAuthen":"false","SFCCMeg":"Can not find customer"}');
			}
			AgentUserMgr.loginAgentUser(userName, password);
			var customer = CustomerMgr.getCustomerByCustomerNumber(customerNo);	
			if(!customer) {
				response.getWriter().println('{"SFCCAuthen":"false","SFCCMeg":"Customer do not exist on SFCC"}');	
				return false;
			}
			
			var loginStatus = AgentUserMgr.loginOnBehalfOfCustomer(customer);
			response.getWriter().println('{"CustomerNo":"' + customerNo + '","Authenticated":"true","Message":"'+ "loginStatus" +'","Token":"' + request.getHttpHeaders()["authorization"].substr(6) +'"}');
			return true;
		} else {
			response.getWriter().println('{"SFCCAuthen":"false","SFCCMeg":"Hostname incorrect"}');	
			return false;
		}
	}
		
	response.getWriter().println('{"SFCCAuthen":"false","SFCCMeg":"Authorization Error"}');	
	response.redirect(URLUtils.https('Home-Show'));
	return false;
}

var loginOnBehalf = function(){
	if(request.getHttpParameterMap()["SFCCAuthen"] == "true" && request.getHttpParameterMap()["method"]== 'POST') {
		AgentUserMgr.loginAgentUser(request.getHttpParameterMap()["SFCCUsername"],request.getHttpParameterMap()["SFCCPassword"]);
		var customer = CustomerMgr.getCustomerByCustomerNumber(request.getHttpParameterMap()["SFCCcustomerNo"]);
		AgentUserMgr.loginOnBehalfOfCustomer(customer);
		response.redirect(URLUtils.https('Home-Show'));
		return true;
	}		
	//Debug
	//response.getWriter().println('loginOnBehalf Success!');
	return false;
}
exports.Access = guard.ensure(['post'], access);
exports.LoginOnBehalf = guard.ensure(['get'], loginOnBehalf);

