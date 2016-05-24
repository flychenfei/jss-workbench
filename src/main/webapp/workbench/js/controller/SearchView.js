(function($) {

	brite.registerView("SearchView", {
		parent : ".content",
		emptyParent : true
	}, {

		// --------- View Interface Implement--------- //
		create : function() {
			return render("SearchView");
		},

		postDisplay : function() {
			var view = this;
			view.searchMode = view.$el.find(".search-mode .radio-inline input:checked").val();

			renderHelperText.call(view);
			brite.display("BottomSection", this.$el.find(".bottomSectionCtn")).done(function(){
				// trigger the first update once the BottomSection is added and initialized.
				triggerURLChangeEvent.call(view);
				
			});

			view.$qSearch = view.$el.find(".q_search");
			view.$skill = view.$el.find(".skill");
			view.$education = view.$el.find(".education");
			view.$location = view.$el.find(".location");
			view.$employer = view.$el.find(".employer");
			view.$userlist = view.$el.find(".userlist");
			view.$geo = view.$el.find(".geo");
			view.$joborders = view.$el.find(".joborders");
			view.$jobTitle = view.$el.find(".jobtitle");
			view.$certifications = view.$el.find(".certifications");
			view.$degrees = view.$el.find(".degrees");
		},
		// --------- /View Interface Implement--------- //

		// --------- Events--------- //
		events: {

			// event for keyup of the search view input
			"keyup; .searchview-form input, .searchView-search-columns-model input": function(event){
				var view = this;
				triggerURLChangeEvent.call(view);

				// FIXME: should extract the action to its own method
				if (event.keyCode === 13){
					view.$el.find(".btn-exe").click();
				}				
			},

			// event for click the execute button
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

			// event for search mode and search columns change
			"change; .search-mode .radio-inline input, .search-columns .checkbox-inline input": function(event){
				var view = this;
				triggerURLChangeEvent.call(view);
			},

			// event for object type/ order by/order type change
			"change; .object-type .radio-inline input, .order-by .radio-inline input, .order-type .radio-inline input": function(event){
				var view = this;
				triggerURLChangeEvent.call(view);
			},

			// event for change geo type, change of match type
			"change; .geo-type": function(event){
				var view = this;
				var geoType = view.$el.find(".geo-type option:selected").text();

				var $geoValueGroup = view.$el.find(".geo-value-group").empty();
				if(geoType == "match"){
					$geoValueGroup.append(render("SearchView-geo-match"));

				}else{
					$geoValueGroup.append(render("SearchView-geo-value"));
					var $geoValue = view.$el.find(".geo-value-group .geo-value input");
					if(geoType == "city"){
						$geoValue.removeClass("geo-city geo-state geo-country geo-zip geo-latlong geo-any").addClass("geo-city");

					}else if(geoType == "state"){
						$geoValue.removeClass("geo-city geo-state geo-country geo-zip geo-latlong geo-any").addClass("geo-state");

					}else if(geoType == "country"){
						$geoValue.removeClass("geo-city geo-state geo-country geo-zip geo-latlong geo-any").addClass("geo-country");

					}else if(geoType == "zip"){
						$geoValue.removeClass("geo-city geo-state geo-country geo-zip geo-latlong geo-any").addClass("geo-zip");

					}else if(geoType == "latlong"){
						$geoValue.removeClass("geo-city geo-state geo-country geo-zip geo-latlong geo-any").addClass("geo-latlong");

					}else if(geoType == "any"){
						$geoValue.removeClass("geo-city geo-state geo-country geo-zip geo-latlong geo-any").addClass("geo-any");
					}
				}
				renderHelperText.call(view);
				triggerURLChangeEvent.call(view);
			},

			// event for select geo op checkbox
			"change; input[name='geoOp']":function(){
				var view = this;
				triggerURLChangeEvent.call(view);
			},

			// event for change company/skill Operator
			"change; .operator-group .operator-value ":function(event){
				var view = this;
				triggerURLChangeEvent.call(view);
			},

			// event for change time
			"change; .time": function(event){
				var view = this;
				var employer = view.$el.find(".employer").val();
				var jobTitle = view.$el.find(".jobtitle").val();
				if($.trim(employer) || $.trim(jobTitle)){
					triggerURLChangeEvent.call(view);
				}				
			}
		},
		// --------- Events--------- //

		// --------- docEvents--------- //
		docEvents:{
			"ORG_CHANGE": function(){
				var view = this;
				
				triggerURLChangeEvent.call(view);
				renderHelperText.call(view);
			}
		}
		// --------- docEvents--------- //

	});

	// --------- Private Methods --------- //
	function buildAPIParams(){
		var view = this;
		//get search mode and if search mode change
		var searchMode = view.$el.find(".search-mode .radio-inline input:checked").val();
		var searchModeChange = view.searchMode == searchMode ? false : true;
		if(searchModeChange){
			view.searchMode = searchMode;
		}

		//get search columns
		var searchColumns = [];
		view.$el.find(".search-columns .checkbox-inline input:checked").each(function(idx, input){
			var $input = $(input);
			searchColumns.push($input.val());
		});

		//get object type
		var objectType = view.$el.find(".object-type .radio-inline input:checked").val();
		
		//get operator
		var skillsOperator = view.$el.find(".skills-con .operator-group .operator-value option:selected").val();
		var educationsOperator = view.$el.find(".educations-con .operator-group .operator-value option:selected").val();
		var locationsOperator = view.$el.find(".locations-con .operator-group .operator-value option:selected").val();
		var companiesOperator = view.$el.find(".companies-con .operator-group .operator-value option:selected").val();
		var userlistsOperator = view.$el.find(".userlists-con .operator-group .operator-value option:selected").val();
		var titlesOperator = view.$el.find(".titles-con .operator-group .operator-value option:selected").val();
		var stagesOperator = view.$el.find(".stages-con .operator-group .operator-value option:selected").val();
		var certificationsOperator = view.$el.find(".certifications-con .operator-group .operator-value option:selected").val();
		var degreesOperator = view.$el.find(".degrees-con .operator-group .operator-value option:selected").val();
		var majorsOperator = view.$el.find(".majors-con .operator-group .operator-value option:selected").val();

		// build the default params
		var params = [{name:"searchMode", value: searchMode},
						{name: "searchColumns", value: searchColumns.join(",")},
						{name: "skillsOperator", value: skillsOperator},
						{name: "educationsOperator", value: educationsOperator},
						{name: "locationsOperator", value: locationsOperator},
						{name: "companiesOperator", value: companiesOperator},
						{name: "userlistsOperator", value: userlistsOperator},
						{name: "titlesOperator", value: titlesOperator},
						{name: "stagesOperator", value: stagesOperator},
						{name: "certificationsOperator", value: certificationsOperator},
						{name: "majorsOperator", value: majorsOperator},
						{name: "degreesOperator", value: degreesOperator},
						{name: "searchModeChange", value: searchModeChange}];


		//get value of returnOnly
		var returnOnly = view.$el.find(".returnOnly").val();
		if(returnOnly){
			params.push({name: "returnOnly", value: returnOnly});
		}
		
		//get offset/limit
		var offset = view.$el.find(".offset").val();
		var limit = view.$el.find(".limit").val();
		if(offset && limit){
			params.push({name: "offset", value: offset},
						{name: "limit", value: limit});
		}

		//get orderBy and orderType
		var orderBy = view.$el.find(".order-by .radio-inline input:checked").val();
		var orderType = view.$el.find(".order-type .radio-inline input:checked").val();
		if(orderBy){
			params.push({name: "orderBy", value: orderBy});
		}
		if(orderType){
			params.push({name: "orderType", value: orderType});
		}
		
		// --------- build searchValues object --------- //
		var searchValues = {q_objectType: objectType, "q_status": "all"};
		
		var qSearch = view.$qSearch.val();
		if (qSearch){
			searchValues.q_search = qSearch;
		}

		// get value of skills
		var skill = view.$skill.val();
		if (skill){
			var skills = checkValuesOfInput.call(view, skill, null, true);
			searchValues.q_skills = skills;
		}

		// get value of education
		var education = view.$el.find(".education").val();
		var major = view.$el.find(".major").val();
		var degree = view.$el.find(".degree").val();
		if(education || major || degree){

			var educations = education.split(",");
			var majors = major.split(",");
			var degrees = degree.split(",");
			items = [];
			var maxLength = Math.max(educations.length, majors.length, degrees.length);
			// get object of zip, city, state, country
			for(var i = 0; i < maxLength; i++){
				var obj = {};
				if($.trim(educations[i])){
					obj.name = educations[i];
				}
				if($.trim(majors[i])){
					obj.major = majors[i];
				}
				if($.trim(degrees[i])){
					obj.degree = degrees[i];
				}
				items.push(obj);
				
			}

			if(education && !(major || degree)){
				items = checkValuesOfInput.call(view, education, null, false);
			}

			searchValues.q_educations = items;			
		}
		
		// get value of employers 
		var employer = view.$employer.val();
		var time = view.$el.find(".employer-time-group .time").val();

		if (employer){

			var employers = checkValuesOfInput.call(view, employer, time, false);
			searchValues.q_companies = employers;
		}

		// get value of locations
		var location = view.$location.val();
		if (location){
			var locations = [];
			var locationIds = location.split(",");

			locations = $.map(locationIds, function(locationId){
				var val = $.trim(locationId);

				if(/^((#!)|(!#))/.test(val)){
					return {"sfid":val.substring(2), "op": "not", "locationid": "", "latitude":0, "longitude":0};	
				}else{
					if(/^!/.test(val)){
						return {"name":val.substring(1), "op": "not", "locationid": "", "latitude":0, "longitude":0};
					}else if(/^#/.test(val)){
						return {"sfid": val.substring(1), "locationid": "", "latitude":0, "longitude":0};
					}

					if(isNaN(val * 1)){
						return {"name":val, "locationid": "", "latitude":0, "longitude":0};
					}
				} 			
				return {"locationid": val, "latitude":0, "longitude":0};
			});

			searchValues.q_locations = locations;
		}

		// get value of userlist
		var userlist = view.$userlist.val();
		if (userlist){

			var userlists = checkValuesOfInput.call(view, userlist, null, false);
			searchValues.q_userlists = userlists;
		}	

		// get value of geo		
		var geoType = view.$el.find(".geo-type").val();
		var radius = view.$el.find(".radius").val();

		// type of latlong
		if(geoType == "latlong"){
			var geo = view.$el.find(".geo").val();
			var geoItems = geo.split(",");
			if (geo){
				var geos = {"type":geoType, "value":{"lat":$.trim(geoItems[0]),"long":$.trim(geoItems[1])}};

				if($.trim(radius)){
					geos.radius = radius;
				}
				searchValues.q_geos = [geos];	
			}
		// type of match
		}else if(geoType == "match"){
			var geos = [];
			var $matchGroup = view.$el.find(".match-group");
			var zip = $matchGroup.find(".match-zip").val();
			var city = $matchGroup.find(".match-city").val();
			var state = $matchGroup.find(".match-state").val();
			var country = $matchGroup.find(".match-country").val();
			var $op = $matchGroup.find("input");
			var op = $op.is(":checked");
			var zips = zip.split(",");
			var cities = city.split(",");
			var states = state.split(",");
			var countries = country.split(",");
			var radius = radius.split(",");
			var maxLength = Math.max(zips.length, cities.length, states.length, countries.length,radius.length);

			// get object of zip, city, state, country
			for(var i = 0; i < maxLength; i++){
				var obj = {"type":geoType};

				var hasCon = false;
				if($.trim(zips[i])){
					obj.zip = zips[i];
					hasCon = true;
				}
				if($.trim(cities[i])){
					obj.city = cities[i];
					hasCon = true;
				}
				if($.trim(states[i])){
					obj.state = states[i];
					hasCon = true;
				}
				if($.trim(countries[i])){
					obj.country = countries[i];
					hasCon = true;
				}
				
				if(hasCon){
					if(op){
						obj.op = "not";
					}
					geos.push(obj);

					if($.trim(radius[i])){
						obj.radius = radius[i];
					}
				}
			}
			searchValues.q_geos = geos;
			
		}else{
			var geo = view.$el.find(".geo").val();
			var geoItems = geo.split(",");
			var geos = [];
			var radius = radius.split(",");
			var maxLength = Math.max(geoItems.length, radius.length);

			if (geo){
				for(var i = 0; i < maxLength; i++){
					var obj = {"type":geoType};

					var val = $.trim(geoItems[i]);
					if(val){
						if(/^((#!)|(!#))/.test(val)){
							obj.sfid = val.substring(2);
							obj.op = "not";
						}else{
							if(/^!/.test(val)){
								obj.sfid = val.substring(1);
								obj.op = "not";
							}else if(/^#/.test(val)){
								obj.sfid = val.substring(1);
							}else{
								obj.value = val;			
							}
						} 

						if($.trim(radius[i])){
							obj.radius = radius[i];
						}

						geos.push(obj);
					}
					
				}

				searchValues.q_geos = geos;		
			}
		}
	

		// get value of Joborders
		var joborder = view.$joborders.val();
		if (joborder){

			var joborders = checkValuesOfInput.call(view, joborder, null, false);
			searchValues.q_joborders = joborders;
		}

		// get value of job title
		var jobTitle = view.$jobTitle.val();
		var time = view.$el.find(".title-time-group .time").val();
		if($.trim(jobTitle)){

			var titles = checkValuesOfInput.call(view, jobTitle, time, false);
			searchValues.q_titles = titles;
		}

		// get value of activities
		var $activities = view.$el.find(".activities");
		var beforeDate = $activities.find(".before-date").val();
		var afterDate = $activities.find(".after-date").val();
		if (beforeDate || afterDate){
			
			var date = getValueofDate.call(view, beforeDate, afterDate);

			searchValues.q_activities = [date];
		}

		// get value of modified
		var $modified = view.$el.find(".modified");
		var beforeDate = $modified.find(".before-date").val();
		var afterDate = $modified.find(".after-date").val();
		if (beforeDate || afterDate){
			

			var date = getValueofDate.call(view, beforeDate, afterDate);
			
			searchValues.q_modifieds = [date];
		}		

		//get value of stages
		var stage = view.$el.find(".stages").val();
		if (stage){
			var stages = checkValuesOfInput.call(view, stage, null, false);
			searchValues.q_stages = stages;
		}

		//get value of certifications
		var certification = view.$el.find(".certifications").val();
		if(certification){
			var certifications = checkValuesOfInput.call(view, certification, null, false);
			searchValues.q_certifications = certifications;
		}

		//get value of degrees
		var degree = view.$el.find(".degrees").val();
		if(degree){
			var degrees = checkValuesOfInput.call(view, degree, null, false);
			searchValues.q_degrees = degrees;
		}

		//get value of degrees
		var major = view.$el.find(".majors").val();
		if(major){
			var majors = checkValuesOfInput.call(view, major, null, false);
			searchValues.q_majors = majors;
		}
		
		params.push({name:"searchValues", value: searchValues});
		// --------- /build searchValues object --------- //
		return params;
	}

	function buildAPIURL(){
		var view = this;
		var apiParams = buildAPIParams.call(view);
		// refresh URL
		var apiUrl = workbench.buildUrl("search",apiParams);
		return apiUrl;
	}

	function triggerURLChangeEvent(){
		var view = this;
		var apiParams = buildAPIParams.call(view);
		view.$el.trigger("API_PARAMS_CHANGE", {api:"search", params:apiParams});
	}

	function renderHelperText(){
		var view = this;
		org = workbench.getOrg();

		var columns = ["skill", "education", "employer", 
						"location", "userlist", "joborders", 
						"jobtitle", "degree", "major", 
						"before-date", "after-date", "stages", 
						"degrees", "certifications", "majors"];
		var $geo = view.$el.find(".geo-group");
		var template = org;

		// show geo when org change to branchG/dev2
		if (org == "branchG" || org == "dev2" || org == "devVRP" || org == "devVRP2" || org == "core" || org == "demo1"){
			columns.push("geo-city", "geo-state", "geo-country", "geo-zip", "geo-latlong","geo-any", "geo-type");
			$geo.removeClass("hide");
		}else{
			$geo.addClass("hide");
		}

		// render the helper
		for(var i = 0; i < columns.length; i++){
			var $apiDoc = $(render("tmpl-"+template+"-" +columns[i]+ "-helper"));
			var $item = view.$el.find(".form-control." +columns[i]);
			$item.nextAll(".helper-text").remove();
			$item.parent().append($apiDoc);
		}
	}

	function checkValuesOfInput(values, time, name){
		var valuesItems = values.split(",");

		return $.map(valuesItems, function(valuesItem){
			var val = $.trim(valuesItem);

			obj = {};
			if(time){
				obj.time = time;
			}
			// prefix with ! and #
			if(/^((#!)|(!#))/.test(val)){
				obj.sfid = val.substring(2);
				obj.op = "not";
				if(name){
					obj.name = "";
				}
				return obj;
			}else{
				// prefix with !
				if(/^!/.test(val)){
					obj.name = val.substring(1);
					obj.op = "not";
					return obj;
				// prefix with #
				}else if(/^#/.test(val)){
					obj.sfid = val.substring(1);
					if(name){
						obj.name = ""
					}
					
					return obj;
				}

				if(isNaN(val * 1)){
					obj.name = val;
					return obj;
				}
			} 
			obj.groupedid = val;
			if(name){
				obj.name = "";
			}
			
			return obj;
		});
	}

	function getValueofDate(beforeDate, afterDate){
		var obj = {}
		if(beforeDate){
			obj.before = beforeDate;
		}
		if(afterDate){
			obj.after = afterDate;
		}
		if(/^!/.test(beforeDate) && /^!/.test(afterDate)){
			obj.before = beforeDate.substring(1);
			obj.after = afterDate.substring(1);
			obj.op = "not";
		}else if(/^!/.test(beforeDate)){
			obj.before = beforeDate.substring(1);
			obj.op = "not";

		}else if(/^!/.test(afterDate)){
			obj.after = afterDate.substring(1);
			obj.op = "not";
		}
		return obj;
	}

	// --------- Private Methods --------- //
})(jQuery);
