(function(){
	
	brite.registerView("ShortListAndJobView", {
		parent : ".content",
		emptyParent : true
	},{

		// --------- View Interface Implement--------- //
		create : function() {
			return render("ShortListAndJobView");
		},

		postDisplay : function() {
			var view = this;

			view.api = "addToJobOrder";
			var $form = view.$el.find(".shortListAndJobView-form").empty();
			$form.append(render("ShortListAndJobView-items-job"));
			brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
				// trigger the first update once the BottomSection is added and initialized.
				triggerURLChangeEvent.call(view);

			});		
		},
		// --------- /View Interface Implement--------- //

		// --------- Events--------- //
		events: {
			"keyup; .shortListAndJobView-form input": function(event){
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
				var $form = view.$el.find(".shortListAndJobView-form").empty();
				
				if($tab.hasClass("add-job-order")){
					$form.append(render("ShortListAndJobView-items-job"));
					view.api = "addToJobOrder";
					
				}else if($tab.hasClass("add-short-list")){
					$form.append(render("ShortListAndJobView-items-short-list"));
					view.api = "addToShortList";

				}else if($tab.hasClass("create-short-list")){
					$form.append(render("ShortListAndJobView-createShortList"));
					view.api = "createShortList";

				}else{
					$form.append(render("ShortListAndJobView-removeFromShortList"));
					view.api = "removeFromShortList";
				}

				triggerURLChangeEvent.call(view);

				view.$el.find(".bottomSectionCtn").empty();
				brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
					// trigger the first update once the BottomSection is added and initialized.
					triggerURLChangeEvent.call(view);
					
				});
			},


			"click; .btn-exe":function(){
				var view = this;
				var $li = view.$el.find(".nav-tabs li.active");			

				if($li.hasClass("add-job-order")){
					var url = buildAPIURL.call(view, true);
					var items = getValues.call(view, false);
					jQuery.ajax({
						type : "Post",
						url : url,
						data:{
							items: items
						},
						async : true,
						dataType : "json"
					}).success(function(data) {
						view.$el.trigger("DATA_RECEIVED", {data: data});
					});

				}else if($li.hasClass("add-short-list")){
					var url = buildAPIURL.call(view, true);
					var items = getValues.call(view, true);
					jQuery.ajax({
						type : "Post",
						url : url,
						data:{
							items: items
						},
						async : true,
						dataType : "json"
					}).success(function(data) {
						view.$el.trigger("DATA_RECEIVED", {data: data});
					});
				}else if($li.hasClass("remove-short-list")){
					var url = buildAPIURL.call(view, true);
					var items = getRemoveSfids.call(view);
					jQuery.ajax({
						type : "Post",
						url : url,
						data:{
							items: items,
						},
						async : true,
						dataType : "json"
					}).success(function(data) {
						view.$el.trigger("DATA_RECEIVED", {data: data});
					});
				}else if($li.hasClass("create-short-list")){
					var url = buildAPIURL.call(view, true);
					var $group = view.$el.find(".createShortList");
					var sfid = $group.find(".sfid").val();
					var name = $group.find(".name").val();
					jQuery.ajax({
						type : "Post",
						url : url,
						data:{
							sfid: sfid,
							name:name,
						},
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

		if($tab.hasClass("add-job-order")){
			params.push({name:"items" , value: getValues.call(view, false)});
			
		}else if($tab.hasClass("add-short-list")){
			params.push({name:"items" , value: getValues.call(view, true)});

		}else if($tab.hasClass("remove-short-list")){
			var id = view.$el.find(".shortListAndJobView-form .id").val();
			var ids = id.split(",");

			if($.trim(id)){
				params.push({name:"items", value: getRemoveSfids.call(view)});
			}		
		}else if($tab.hasClass("create-short-list")){
			var $group = view.$el.find(".createShortList");
			var sfid = $group.find(".sfid").val();
			var name = $group.find(".name").val();
			if($.trim(sfid)){
				params.push({name:"sfid", value: sfid});
			}
			if($.trim(name)){
				params.push({name:"name", value: name});
			}
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

	function getValues(isShortList){
		var view = this;
		var sfid = view.$el.find(".shortListAndJobView-form .sfid").val().split(",");		
		var candidateSfid = view.$el.find(".shortListAndJobView-form .candidate-sfid").val().split(",");
		var items = [];

		if(isShortList){
			var itemSfid = view.$el.find(".shortListAndJobView-form .shortList-sfid").val().split(",");
		}else{
			var itemSfid = view.$el.find(".shortListAndJobView-form .job-sfid").val().split(",");
		}

		var maxLength = Math.max(sfid.length, candidateSfid.length, itemSfid.length);
		items = [];
		for(var i = 0; i < maxLength; i++){
			var obj = {};
			if($.trim(sfid[i])){
				obj.sfid = sfid[i];
			}
			if($.trim(candidateSfid[i])){
				obj.candidateSfid = candidateSfid[i];
			}
			if($.trim(itemSfid[i])){
				if(isShortList){
					obj.shortListSfid = itemSfid[i];
				}else{
					obj.jobOrderSfid = itemSfid[i];
				}			
			}
			items.push(obj);
		}
		return JSON.stringify(items);
	}

	function getRemoveSfids(){
		var view = this;
		var id = view.$el.find(".shortListAndJobView-form .id").val();
		var ids = id.split(",");
		items = [];
		$.map(ids, function(id){
			var val = $.trim(id);
			var obj = {};
			obj.sfid = val;
			items.push(obj);
		});
		return JSON.stringify(items);
	}
	// --------- /Private Methods --------- //
})();