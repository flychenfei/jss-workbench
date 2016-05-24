(function(){
	
	brite.registerView("ComplianceView", {
		parent : ".content",
		emptyParent : true
	},{

		// --------- View Interface Implement--------- //
		create : function() {
			return render("ComplianceView");
		},

		postDisplay : function() {
			var view = this;

			view.api = "getComplianceMode";
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
			"keyup; .complianceView-form input": function(event){
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

				// render the input of get/set
				var $form = view.$el.find(".complianceView-form").empty();
				
				if($tab.hasClass("set-mode")){			
					$form.append(render("ComplianceView-items-set"));	
					view.api = "setComplianceMode";

				}else{
					view.api = "getComplianceMode";
				}

				triggerURLChangeEvent.call(view);

				view.$el.find(".bottomSectionCtn").empty();
				brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
					// trigger the first update once the BottomSection is added and initialized.
					triggerURLChangeEvent.call(view);

					// hide the text input and aip params when custom fields tab
					checktabs.call(view);
					
				});
			},

			"change; .complianceView-form .mode": function(){
				var view = this;
				triggerURLChangeEvent.call(view);
			},

			"click; .btn-exe":function(){
				var view = this;
				var $li = view.$el.find(".nav-tabs li.active");
				var mode = view.$el.find(".complianceView-form .mode").val();

				if($li.hasClass("set-mode")){
					var url = buildAPIURL.call(view, true);
					jQuery.ajax({
						type : "Post",
						url : url,
						data:{
							complianceMode: mode
						},
						async : true,
						dataType : "json"
					}).success(function(data) {
						view.$el.trigger("DATA_RECEIVED", {data: data});
					});

				}else{
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
			}
		},
		// --------- /Events--------- //

		// --------- docEvents--------- //
		docEvents:{
			"ORG_CHANGE": function(){
				var view = this;
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
		var mode = view.$el.find(".complianceView-form .mode").val();

		var params = [];

		if($tab.hasClass("set-mode")){
			params.push({name:"complianceMode", value: mode});
		}

		return params;	
	}

	function buildAPIURL(post){
		var view = this;
		var apiParams = post ? {} : buildAPIParams.call(view);
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
		if($tab.hasClass("get-mode")){
			view.$el.find(".lable-input").addClass("hide");
			view.$el.find(".BottomSection .api-params").addClass("hide");
		}else{
			view.$el.find(".lable-input").removeClass("hide");
			view.$el.find(".BottomSection .api-params").removeClass("hide");
		}
	}
	// --------- /Private Methods --------- //
})();