var workbench = {};

(function(){

	var rootUrl = "http://54.148.66.142:8080/";
	var org = "jobsBigData";
	var passcode = "supersearch";
	
	workbench = {
		orgs: ["jobsBigData", "branchG", "dev2", "devVRP", "devVRP2", "core", "demo1"],
		dataUrl: "/workbench/data",
		buildUrl: buildUrl,
		//buildSearchUrl: buildSearchUrl,
		setOrg: function(changedOrg){
			org = changedOrg;
			$(document).trigger("ORG_CHANGE", changedOrg);
		},
		getOrg: function(){
			return org;
		}
	};

	// --------- Public Apis --------- //

	function buildUrl(api, params){

		var url = buildBaseUrl(api);
		var i, param;
		for (i = 0; i < params.length; i++){
			param = params[i];
			url += "&";

			url += param.name + "=";

			// add the value
			if (typeof param.value === "string"){
				url += param.value;
			}else {
				url += JSON.stringify(param.value);
			}
		}
		return url;
	}

	// --------- /Public Apis --------- //


	// return the baseUrl for the endpoint
	function buildBaseUrl(api){

		//for now, the api name is the path of the URL (we can have more info later if needed)
		return rootUrl + api + "?org=" + org + "&passcode=" + passcode;
	}

	// --------- Utils --------- //
	// if val is not an Array, it does make an array with val as the only element
	function ensureArray(val){
		return Array.isArray(val)?val:[val];
	}

	// --------- /Utils --------- //

})();