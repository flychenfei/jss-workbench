(function(){
	
	brite.registerView("MainView",{

		create: function(){
			return render("MainView");
		}, 

		postDisplay: function(){
			var view = this;
			renderOrgs.call(view);
			var section = getSection.call(view);
			showView.call(view, section);
		}, 

		events: { 
			"click; .do-logoff": function(){
				app.doGet("/logoff").done(function(){
					window.location.reload();
				});
			},
			
			"click; .org-dropdown .dropdown-toggle": function(e){
				var view = this;
				var $dropdown = $(e.currentTarget).closest(".org-dropdown");
				$dropdown.toggleClass("open");
			},

			"click; .org-dropdown .dropdown-menu li": function(e){
				var view = this;
				var $li = $(e.currentTarget);
				var $dropdown = $li.closest(".org-dropdown");
				changeOrg.call(view, $li.attr("data-org"));
				$dropdown.removeClass("open");
			}
		},

		docEvents: {
			"USER_REFRESHED": function(event){
				var view = this;
				view.$navHeader.dxPush(app.user);
			},

			"click":function(event){
				var view = this;
				var $target = $(event.target);
				if($target.closest(".org-dropdown").size() == 0 && view.$el.find(".dropdown-menu:visible").size() > 0){
					view.$el.find(".org-dropdown").removeClass("open");
				}
			}
		},
		winEvents:{
			"hashchange":function(){
				var view = this;
				var hash = getSection.call(view);
				showView.call(view, hash);
			}
		}	
	});

	function getSection(){
		var view = this;
		var hash = window.location.hash;
		if(hash.startsWith("#") > -1){
			hash = hash.substring(1);
		}

		var $nav = view.$el.find(".nav.navbar-nav");
		$nav.find("li").removeClass("active");
		$nav.find("li a[href='#"+hash+"']").closest("li").addClass("active");
		return hash;
	}

	function showView(section){
		var view = this;
		if(section == "omnisearch"){
			brite.display("OmniSearchView");
		}else if(section == "autocomplete"){
			brite.display("AutoCompleteView");
		}else if(section == "savedsearch"){
			brite.display("SavedSearchView");
		}else if(section == "customfields"){
			brite.display("CustomFieldsView");
		}else if(section == "shortListAndJob"){
			brite.display("ShortListAndJobView");
		}else if(section == "compliance"){
			brite.display("ComplianceView");
		}else{
			brite.display("SearchView");
		}
	}

	function renderOrgs(){
		var view = this;
		var orgs = workbench.orgs;
		var $dropdown = view.$el.find(".org-dropdown");
		$dropdown.find(".dropdown-menu").empty().append(render("MainView-dropdowns", {items: orgs}));
		var defaultOrg = $dropdown.find(".dropdown-menu li:first").attr("data-org");
		$dropdown.find(".dropdown-toggle .dropdown-text").html(defaultOrg);
	}

	function changeOrg(org){
		var view = this;
		var $dropdown = view.$el.find(".org-dropdown");
		$dropdown.find(".dropdown-toggle .dropdown-text").html(org);
		workbench.setOrg(org);
	}

})();
