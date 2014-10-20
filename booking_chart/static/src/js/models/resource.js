openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var BaseModel = base.models('BaseModel'),
        _super = BaseModel.prototype;
    
    var Resource = BaseModel.extend({
        
        model_name: 'booking.resource',

	    /*
	    * TODO:
	    * each time a new resource is created, check the 'start'
	    * and the 'end' of the resource to see whether it reach
	    * the time
	    * */
	    validate: function(attrs){

		    // should validate only when user use hours booking chart
		    if(this.collection.daterange.get('base') === 'hours'){

			    var timezone = this.collection.daterange.get('timezone');

			    var attr_date_start = this.collection.options.attr_date_start,
				    attr_date_end = this.collection.options.attr_date_end;

			    var resc_start = moment(attrs[attr_date_start]),
				    resc_end = moment(attrs[attr_date_end]);

			    // if 'start' and 'end' in the same day, they must be different in hour or minute
			    var current_wd_start = this.workingDay(resc_start),
				    current_wd_end = this.workingDay(resc_end);

			    // if there is no working day defined => throw error to stop
			    if (!current_wd_start || !current_wd_end){
				    throw new Error([
					    "",
					    "+ Resource ID: " + attrs["id"] + " :: " + attrs["name"],
						"- There is no working day defined for:: "
						    + resc_start.format('dddd') + " or "+ resc_end.format('dddd')
				    ].join('\n'));
			    }

				// if the current resource exceed the range => stop this also
				if(parseInt(resc_start.format('HH')) < current_wd_start.start
					|| parseInt(resc_end.format('HH')) > current_wd_end.end + 1) {

					throw new Error([
						"",
						"+ Resource ID: " + attrs["id"] + " :: " + attrs["name"],
						"- Exceeds the start or end of current working date:",
						"  - current timezone: " + timezone,
						"  - Working day starts at: " + current_wd_start.start + ":00 (" + current_wd_start.name +
									   ") ends at: " + current_wd_end.end + ":00 (" + current_wd_end.name + ")",
						"  - Resource starts at: " + resc_start.format('HH:mm') + " ends at: " + resc_end.format('HH:mm')
					].join('\n'));
				}
		    }
	    },

	    /*
	    * TODO:
	    * should convert the current 'start' and 'end' to fixed timezine
	    * configured through the view of the booking chart
	    * */
	    set: function(key, val, options) {

            var attrs, attr;
            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

		    // only with hours booking chart - handle current resource with fixed timezone
		    if (this.collection.daterange.get('base') === 'hours'){

			    // convert to fixed timezone if the resource is not fetched
			    // if we dont handle this case, the resource will get added by timezone
			    // which causes unexpected result on the graph and the validation
				if(!this.get('fixed_timezone')){

					// get fixed configured timezone
				    var fixed_timezone = this.collection.daterange.get('timezone');

				    var attr_date_start = this.collection.options.attr_date_start,
				        attr_date_end = this.collection.options.attr_date_end;

				    if (attrs[attr_date_start] && attrs[attr_date_end]){

					    // get standard input data
						var start = moment(attrs[attr_date_start]),
							end = moment(attrs[attr_date_end]);

					    // convert to fixed GMT timezone
					    var start_gmt = moment(start.zone(fixed_timezone)),
						    end_gmt = moment(end.zone(fixed_timezone));

					    // reset input data
					    attrs[attr_date_start] = moment(start_gmt._d).format('YYYY-MM-DD HH:mm:ss');
					    attrs[attr_date_end] = moment(end_gmt._d).format('YYYY-MM-DD HH:mm:ss');

					    // mark this resource as converted
					    attrs['fixed_timezone'] = true;
				    }
				}
		    }

			return _super.set.apply(this, [attrs, options]);
	    },

	    /*
	    * TODO:
	    * get specific working date to check, usualy the
	    * start attribute of a resource
	    *
	    * @param {object|moment} moment: a moment object
	    * */
	    workingDay: function(moment){
			var working_days = this.collection.daterange.get('working_date'),
				current_days = moment.format('dddd').toLowerCase();

		    return _.find(working_days, function(day){
				return day.name === current_days
		    });
	    },

	    /*
	    * TODO:
	    * generate resource width on the view
	    * -> called by the view template
	    * */
	    resourceWidth: function(){
			if(this.collection.daterange.get('base') === 'hours') {
				return this.duration() * (1 / 15);
			}
		    return this.duration();
	    },

	    /*
	    * TODO:
	    * used to generate format for moment object displayed
	    * on the tooltip of graph view.
	    * */
	    tooltipDateTimeFormat: function(){
			if(this.collection.daterange.get('base') === 'hours'){
				return 'ddd. (Do MMM, YYYY) HH:mm:ss';
			}
		    return 'ddd. Do MMM, YYYY';
	    },

	    /*
	    * TODO:W
	    * used to generate time indicator displayed on the tooltip
	    * possible option would be between
	    *   - Day (for months booking chart)
	    *   - Minute (for Hours booking chart)
	    * */
	    tooltipTimeIndicator: function(){
			if(this.collection.daterange.get('base') === 'hours'){
				return 'minute';
			}
		    return 'day';
	    },

        parse: function(response, options){
            if($.isPlainObject(response)){
                _.each(response, function(value, key){
                    // for reference fields, separate the model and the id
                    if(/_ref/.test(key) && _.isString(value) && /,/.test(value)){
                        var ref = value.split(',');
                        response[key.replace(/_ref/, '_id')] = parseInt(ref[1]);
                        response[key.replace(/_ref/, '_model')] = ref[0];
                    }
                });
            }
            return response;
        },
        
        diff: function(date){
	        if(this.collection.daterange.get('base') === 'hours'){
		        // TODO: remove .add(7,'hours') because of timezone issue
		        var diff = Math.round(moment(this.get('date_start')).diff(date, 'minutes', true));
		        return diff * (1 / 15);
	        }
            return Math.round(moment(this.get('date_start')).diff(date, 'days', true));
        },
        
        duration: function(refresh){
            if(!this.nb_days || refresh){
                this.refreshDiffs();
            }

	        // TODO: instead of amount of days, get amount of minutes of the resource
	        // width for separated resource of an item
			if(this.collection.daterange.get('base') === 'hours'){
				return this.minutes();
			}

            return this.nb_days;
        },
       
        months: function(refresh){
            if(!this.nb_months || refresh){
                this.refreshDiffs();
            }
            return this.nb_months;
        },

	    minutes: function(refresh){
            if(!this.nb_minutes || refresh){
                this.refreshDiffs();
            }
            return this.nb_minutes;
        },
        
        start: function(){
            return moment(this.get('date_start'));
        },
        
        end: function(){
            return moment(this.get('date_end'));
        },
        
        refreshDiffs: function(){

            var start  = this.start(),
                end    = this.end(),

                minutes = Math.round(end.diff(start, 'minutes', true)),
                days   = Math.round(end.diff(start, 'days', true)),
                months = end.diff(start, 'months');

           this.nb_minutes = minutes;
           this.nb_months = months;
           this.nb_days = days;
        }
        
    });

    booking.models('Resource', Resource);
});