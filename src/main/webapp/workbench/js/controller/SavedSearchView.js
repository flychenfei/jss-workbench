(function(){
	
	brite.registerView("SavedSearchView", {
		parent : ".content",
		emptyParent : true
	},{

		// --------- View Interface Implement--------- //
		create : function() {
			return render("SavedSearchView");
		},

		postDisplay : function() {
			var view = this;
			view.api = "listSavedSearches";

			brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
				// trigger the first update once the BottomSection is added and initialized.
				triggerURLChangeEvent.call(view);
				
			});

		},
		// --------- /View Interface Implement--------- //

		// --------- Events--------- //
		events: {
			// event for keyup of the search view input
			"keyup; .savedSearchView-form input": function(event){
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
				var $form = view.$el.find(".savedSearchView-form").empty();
				if($tab.hasClass("save")){
					$form.append(render("SavedSearchView-saveSavedSearches"));
					view.api = "saveSavedSearches";
					view.$el.find(".option-none").addClass("hide");

				}else if($tab.hasClass("delete")){
					$form.append(render("SavedSearchView-deleteSavedSearches"));
					view.api = "deleteSavedSearches";
					
				}else{
					$form.append(render("SavedSearchView-listSavedSearches"));
					view.api = "listSavedSearches";
					view.$el.find(".option-none").removeClass("hide");
				}
				triggerURLChangeEvent.call(view);

				view.$el.find(".bottomSectionCtn").empty();
				brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
					// trigger the first update once the BottomSection is added and initialized.
					triggerURLChangeEvent.call(view);
					
				});
			},

			"change; .scope": function(event){
				view = this;
				var scope = view.$el.find(".scope option:selected").val();
				var $user = view.$el.find(".user-group");
				var $tab = view.$el.find(".savedSearch li.active");
				if($tab.hasClass("list")){
					if(scope == "private"){
						$user.removeClass("hide");
					}else{
						$user.addClass("hide");
					}
				}
				 
				triggerURLChangeEvent.call(view);
			},

			// event for click the execute button
			"click; .btn-exe":function(){
				var view = this;
				var $li = view.$el.find(".nav-tabs li.active");

				var id = view.$el.find(".savedSearchView-form .id").val();
				var name = view.$el.find(".savedSearchView-form .name").val();
				var user = view.$el.find(".savedSearchView-form .user").val();
				var scope = view.$el.find(".savedSearchView-form .scope").val();

				if($li.hasClass("save")){
					var url = buildAPIURL.call(view, true);
					var data = {
						name: name,
						user: user,
						scope: scope,
						content: JSON.stringify({})
					};
					jQuery.ajax({
						type : "Post",
						url : url,
						data: data,
						async : true,
						dataType : "json"
					}).success(function(data) {
						view.$el.trigger("DATA_RECEIVED", {data: data});
					});

				}else if($li.hasClass("delete")){
					var url = buildAPIURL.call(view, true);			
					jQuery.ajax({
						type : "Post",
						url : url,
						data:{
							id: id
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

			},

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

		var $tab = view.$el.find(".savedSearch li.active");
		var name = view.$el.find(".savedSearchView-form .name").val();
		var scope = view.$el.find(".savedSearchView-form .scope option:selected").val();
		var user = view.$el.find(".savedSearchView-form .user").val();
		var id = view.$el.find(".savedSearchView-form .id").val();
		var params = [];

		if($tab.hasClass("save")){
			params = [{name:"name", value: name}, {name:"user", value: user}];

			if(scope != "none"){
				params.push({name:"scope", value: scope});
			}
		}else if($tab.hasClass("delete")){
			params = [{name:"id", value: id}];
		}else{
			if(scope != "none"){
				params.push({name:"scope", value: scope});
			}
			if(scope == "private"){
				params.push({name:"user", value: user});
			}
		}
		return params;
	}

	function triggerURLChangeEvent(){
		var view = this;
		var apiParams = buildAPIParams.call(view);
		view.$el.trigger("API_PARAMS_CHANGE", {api:view.api, params:apiParams});
	}

	function buildAPIURL(post){
		var view = this;

		var apiParams = post ? {} : buildAPIParams.call(view);
		// refresh URL
		var apiUrl = workbench.buildUrl(view.api,apiParams);
		return apiUrl;
	}
	// --------- /Private Methods --------- //

})();