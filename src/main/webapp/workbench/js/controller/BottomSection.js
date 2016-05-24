(function(){
	var perfNamesMatch = {
		// searchDao
		"SearchDao.search": true,
		"SearchDao.buildSearchStatements": true, 
		"SearchLogDao.addSearchLog": true,
		"SearchDao.executeSearch": true,
		// omnisearch
		"SearchDao.getOmniComplete": true,		
		// AutoComplete
		"SearchDao.simpleAutoComplete": true};	

	brite.registerView("BottomSection",{

		create: function(){
			return render("BottomSection");
		},

		postDisplay: function(){
			var view = this;
			view.$apiurlCtn = view.$el.find(".apiurl-ctn");
			view.$paramsCtn = view.$el.find(".params-ctn");

			// response elements
			view.$resultOutput = view.$el.find(".form-group .result");
			view.$allOutput = view.$el.find(".form-group .all");
			view.$perfOutput = view.$el.find(".form-group .perf");
			view.$perfbarCtn = view.$el.find(".perfbar-ctn");	
		},

		events: {
			"click; .result .nav-tabs li": function(event){
				var view = this;
				var $li = $(event.currentTarget);
				var $nav = $li.closest(".nav");
				$nav.find("li").removeClass("active");
				$li.addClass("active");

				// show/hide the result content
				var $result = view.$el.find(".result");
				var $all =$result.find(".all-con");
				var $resultC =$result.find(".result-con");
				var $perf = $result.find(".perf-con");
				if($li.hasClass("all")){
					$resultC.addClass("hide");
					$perf.addClass("hide");
					$all.removeClass("hide");
			
				}else if($li.hasClass("perf")){
					$all.addClass("hide");
					$resultC.addClass("hide");
					$perf.removeClass("hide");

				}else{
					$all.addClass("hide");
					$perf.addClass("hide");
					$resultC.removeClass("hide");
				}
			}
		},

		docEvents: {
			"DATA_RECEIVED": function(event, extra){
				var view = this;
				var data = extra.data;
				if(typeof data.perf != "undefined"){
					// 
					view.$resultOutput.val(JSON.stringify(data.result, null, 2));				
					view.$allOutput.val(JSON.stringify(data, null, 4));
					view.$perfOutput.val(JSON.stringify(data.perf, null, 4));

					var perfs = [];
					perfs.push({name: "Total", time: data.perf.req.duration});
					gatherPerf(data.perf.req.subs, perfNamesMatch, perfs);
					view.$perfbarCtn.html(render("BottomSection-perfbar", {perfs: perfs}));	
				}
					
			}, 

			"API_PARAMS_CHANGE": function(event, extra){
				var view = this;

				var params = extra.params; 

				// refresh params-ctn section
				var i, param, html = "", paramItem; 
				view.$paramsCtn.empty();
				for (i = 0; i < params.length; i++){
					param = params[i];
					paramItem = {name: param.name};
					if (typeof param.value === "string"){
						paramItem.value = param.value;
					}else{
						paramItem.value = JSON.stringify(param.value);
					}
					html += render("BottomSection-paramItem",paramItem);
				}
				view.$paramsCtn.html(html);

				// refresh URL
				var apiUrl = workbench.buildUrl(extra.api,params);
				html = render("BottomSection-apiUrl", {url: apiUrl});
				view.$apiurlCtn.html(html);
			}
		}
			

	});


	function gatherPerf(subs, match, store){
		$.each(subs, function(key, val){
			if (match[key]){
				store.push({name: key,
										time: val.duration,
										start: val.start});
			}
			if (val.subs){
				gatherPerf(val.subs, match, store);
			}
		});
	}
})();