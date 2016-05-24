(function(){

	brite.registerView("AutoCompleteView", {
		parent : ".content",
		emptyParent : true
	},{

		// --------- View Interface Implement--------- //
		create : function(){
			return render("AutoCompleteView");
		},

		postDisplay : function() {
			var view = this;

			renderHelperText.call(view);

			brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
				// trigger the first update once the BottomSection is added and initialized.
				triggerURLChangeEvent.call(view);
			});

			view.$qSearch = view.$el.find(".q_search");	
			view.$geo = view.$el.find(".geo");		
		},

		events: {
			"keyup; .autoCompleteView-form input": function(event){
				var view = this;
				triggerURLChangeEvent.call(view);

				// FIXME: should extract the action to its own method
				if (event.keyCode === 13){
					view.$el.find(".btn-exe").click();
				}				
			},

			"click; .btn-exe":function(){
				var view = this;

				var url = buildAPIURL.call(view);
				jQuery.ajax({
					type : "Get",
					url : url,
					async : true,
					dataType : "json"
				}).success(function(data) {
					view.$el.trigger("DATA_RECEIVED", {data: data});
				});
			},

			"change; .search-columns .radio-inline input": function(event){
				var view = this;
				if(view.$qSearch.val()){
					triggerURLChangeEvent.call(view);
				}
			},

			"change; .geo-type": function(event){
				var view = this;
				if(view.$geo.val()){
					triggerURLChangeEvent.call(view);
				}
			}
		},

		docEvents:{
			"ORG_CHANGE": function(){
				var view = this;
				renderHelperText.call(view);
				triggerURLChangeEvent.call(view);
			}
		}
		
	});

	function buildAPIParams(){
		var view = this;
		var params = [];
		var searchType = view.$el.find(".search-columns .radio-inline input:checked").val();
	
		// --------- build searchValues object --------- //
		var searchValues = {"q_objectType":"All","q_status":"All","q_customFields":[]};

		// search values of geo
		var geo = view.$geo.val();
		var geoType = view.$el.find(".geo-type option:selected").text();
		if (geo){
			searchValues.q_geo = {"type":geoType, "value": geo};
		}

		params.push({name:"searchValues", value: searchValues});
		params.push({name:"isPostalCodeSearch", value: false});

		if(searchType){
			params.push({name:"type", value: searchType});
		}
		params.push({name:"queryString", value:view.$qSearch.val()});
		// --------- /build searchValues object --------- //
		return params;
	}

	function buildAPIURL(){
		var view = this;
		var apiParams = buildAPIParams.call(view);
		// refresh URL
		var apiUrl = workbench.buildUrl("getAutoCompleteData", apiParams);
		return apiUrl;
	}

	function triggerURLChangeEvent(){
		var view = this;
		var apiParams = buildAPIParams.call(view);
		view.$el.trigger("API_PARAMS_CHANGE", {api:"getAutoCompleteData", params:apiParams});
	}

	function renderHelperText(){
		var view = this;
		org = workbench.getOrg();

		// render the helper
		var $apiDoc = $(render("tmpl-"+org+"-autocomplete-helper"));
		var $item = view.$el.find(".form-control.q_search");
		$item.nextAll(".helper-text").remove();
		$item.parent().append($apiDoc);
	}

})();