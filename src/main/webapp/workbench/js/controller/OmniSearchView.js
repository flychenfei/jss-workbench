(function(){
	
	brite.registerView("OmniSearchView", {
		parent : ".content",
		emptyParent : true
	},{

		// --------- View Interface Implement--------- //
		create : function() {
			return render("OmniSearchView");
		},

		postDisplay : function() {
			var view = this;

			renderHelperText.call(view);

			brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
				// trigger the first update once the BottomSection is added and initialized.
				triggerURLChangeEvent.call(view);
			});			

			view.$qSearch = view.$el.find(".q_search");			
		},

		events: {
			"keyup; .omniSearchView-form input": function(event){
				var view = this;
				triggerURLChangeEvent.call(view);
				
				// FIXME: should extract the action to its own method
				if (event.keyCode === 13){
					view.$el.find(".btn-exe").click();
				}					
			},

			//change the select
			"change; .omniSearchView-form .only_type": function(event){
				var view = this;
				triggerURLChangeEvent.call(view);
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
			}
		},

		docEvents:{
			"ORG_CHANGE": function(){
				var view = this;
				triggerURLChangeEvent.call(view);
				renderHelperText.call(view);
			}
		}
		
	});

	function buildAPIParams(){
		var view = this;
		// build the default params (hardcoded for now)
		var params = [];

		// --------- build searchValues object --------- //
		var searchValues = {};
		
		var qSearch = view.$qSearch.val();
		if (qSearch){
			searchValues = qSearch;
		}

		params.push({name:"searchValues", value: searchValues});

		// only type
		var onlyType = view.$el.find(".only_type option:selected").val();
		if (onlyType){
			params.push({name:"only_type", value: onlyType});
		}
		// --------- /build searchValues object --------- //
		return params;
	}

	function buildAPIURL(){
		var view = this;
		var apiParams = buildAPIParams.call(view);
		// refresh URL
		var apiUrl = workbench.buildUrl("getOmniComplete",apiParams);
		return apiUrl;
	}

	function triggerURLChangeEvent(){
		var view = this;
		var apiParams = buildAPIParams.call(view);
		view.$el.trigger("API_PARAMS_CHANGE", {api:"getOmniComplete", params:apiParams});
	}

	function renderHelperText(){
		var view = this;
		org = workbench.getOrg();

		// render the helper
		var $apiDoc = $(render("tmpl-"+org+"-ominisearch-helper"));
		var $item = view.$el.find(".form-control.q_search");
		$item.nextAll(".helper-text").remove();
		$item.parent().append($apiDoc);
	}

})();