(function(){
	
	brite.registerView("CustomFieldsView", {
		parent : ".content",
		emptyParent : true
	},{

		// --------- View Interface Implement--------- //
		create : function() {
			return render("CustomFieldsView");
		},

		postDisplay : function() {
			var view = this;

			view.api = "getCustomFields";
			brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
				// trigger the first update once the BottomSection is added and initialized.
				triggerURLChangeEvent.call(view);

				// hide the text input and aip params when custom fields tab
				checktabs.call(view);
			});		
		},
		// --------- /View Interface Implement--------- //

		// --------- Events--------- //
		events: {
			"keyup; .customFieldsView-form input": function(event){
				var view = this;
				triggerURLChangeEvent.call(view);
				
				// FIXME: should extract the action to its own method
				if (event.keyCode === 13){
					view.$el.find(".btn-exe").click();
				}					
			},

			// event for change sub tab
			"click; .nav-tabs li": function(event){
				var view = this;
				var $tab = $(event.currentTarget);
				if($tab.hasClass("active")){
					return;
				}

				var $nav = $tab.closest(".nav");
				$nav.find("li").removeClass("active");
				$tab.addClass("active");

				// render the input of list/delete/save
				var $form = view.$el.find(".customFieldsView-form").empty();
				
				if($tab.hasClass("custom-filter-ac")){			
					$form.append(render("CustomFieldsView-items"));	
					view.api = "getCustomFilterAutoCompleteData";
				}else if($tab.hasClass("custom-field-ac")){
					$form.append(render("CustomFieldsView-items"));
					view.api = "getCustomFieldAutoCompleteData";				
					
				}else{
					view.api = "getCustomFields";
				}
				renderHelperText.call(view);
				triggerURLChangeEvent.call(view);

				view.$el.find(".bottomSectionCtn").empty();
				brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
					// trigger the first update once the BottomSection is added and initialized.
					triggerURLChangeEvent.call(view);

					// hide the text input and aip params when custom fields tab
					checktabs.call(view);
					
				});
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
		// --------- /Events--------- //

		// --------- docEvents--------- //
		docEvents:{
			"ORG_CHANGE": function(){
				var view = this;
				renderHelperText.call(view);
				triggerURLChangeEvent.call(view);
			}
		}
		// --------- /docEvents--------- //
	});
	// --------- Private Methods --------- //
	function buildAPIParams(){
		var view = this;
		var params = [];
		var $tab = view.$el.find(".customfields li.active");
		if(!$tab.hasClass("custom-fields")){

			// get field name
			var fieldName = view.$el.find(".field-name").val();
					
			params.push({name: "fieldName", value: fieldName});

			var qSearch = view.$el.find(".q_search").val();
			if(qSearch){
				params.push({name:"searchText", value: qSearch});
			}

		}
		return params;
		
		
	}

	function buildAPIURL(){
		var view = this;
		var apiParams = buildAPIParams.call(view);
		// refresh URL
		var apiUrl = workbench.buildUrl(view.api,apiParams);
		return apiUrl;
	}

	function triggerURLChangeEvent(){
		var view = this;
		var apiParams = buildAPIParams.call(view);
		view.$el.trigger("API_PARAMS_CHANGE", {api:view.api, params:apiParams});
	}

	function checktabs(){
		var view = this;
		var $tab = view.$el.find(".customfields li.active");
		if($tab.hasClass("custom-fields")){
			view.$el.find(".lable-input").addClass("hide");
			view.$el.find(".BottomSection .api-params").addClass("hide");
		}else{
			view.$el.find(".lable-input").removeClass("hide");
			view.$el.find(".BottomSection .api-params").removeClass("hide");
		}
	}

	function renderHelperText(){
		var view = this;
		org = workbench.getOrg();

		var columns = ["field-name", "q_search"];
		var template = org;

		// render the helper
		for(var i = 0; i < columns.length; i++){
			var $apiDoc = $(render("tmpl-"+template+"-" +columns[i]+ "-helper"));
			var $item = view.$el.find(".form-control." +columns[i]);
			$item.nextAll(".helper-text").remove();
			$item.parent().append($apiDoc);
		}
	}
	// --------- /Private Methods --------- //
})();