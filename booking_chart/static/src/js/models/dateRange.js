openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){

    // Timelapses collection will store collection of Month or Day
    // model depending on the 'base' of DateRange (defined in view)
    var Timelapses = booking.collections('Timelapses');

    var Month = booking.models('Month');
    var Day = booking.models("Day");

    var Period = base.models('Period'),
        _super = Period.prototype;

    var DateRange = Period.extend({
        
        defaults: {
            frozen: false,
            size: 'm',
            scroll: 0
        },

        constructor: function(model, options){
            var format_option = options && options.format ? options.format : {};
                    
            this.options = {
                format: _.extend({
                    year:    'YYYY',
                    month:   'MMMM YYYY',
                    day:     'ddd[<br />]D',
                    hour:    'HH',
                    minute:  'mm'
                }, format_option)
            };
        
            this.timelapses = new Timelapses();
            
            Period.apply(this, [model, options]);
        },
        
        initialize: function(model, options){
            this.on('next previous', this.diffAdded, this);
        },
        
        zoom: function(size){
        
            // load additional months, to have enough month to display
	        // icase using hours booking chart, load addition days instead
            if(size == 'xs'){
                this.reachTimelapseCount(6);
            }
            if(size == 's'){
                this.reachTimelapseCount(4);
            }
            
            this.set({
                size: size
            });
        },
        
        freeze: function(){
            this.set({
                frozen: true
            });
        },
        
        unfreeze: function(){
            this.set({
                frozen: false
            });
        },
        
        isFrozen: function(){
            return this.get('frozen');
        },
        
        scrollToday: function(){
            var diff = Math.round(moment().subtract(7, 'days').diff(this.start(), 'days', true));

	        if(this.get('base') === 'hours'){

		        var current = moment().format('YYYY-MM-DD');

		        diff = this.timelapses.reduce(function(incr, model){
			        if(model.id < current) {
				        return incr + _.size(model.get('quarters')) - 1;
			        }
			        return incr;
		        },  0);
	        }

            this.set('scroll', diff);
            // should not have to send an event from here, but it make life easier :)
            this.trigger('scroll:today', diff, true);
        },
        
        hasToday: function(){
            return this.get('start').twix(this.get('end')).contains(moment());
        },
        
        set: function(key, val, options){

            var attrs;
            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            // TODO:: skip setting if show dates from toolbar
            if (!_.result(options, "skip_set")) {

                if (this.get("base") === "hours") {
                    // force dates to be start|end of months
                    if (moment.isMoment(attrs.start)) {
                        attrs.start.startOf('day');
                    }
                    if (moment.isMoment(attrs.added_start)) {
                        attrs.added_start.startOf('day');
                    }
                    if (moment.isMoment(attrs.end)) {
                        attrs.end.endOf('day');
                    }
                    if (moment.isMoment(attrs.added_end)) {
                        attrs.added_end.endOf('day');
                    }
                }
                else {
                    // force dates to be start|end of months
                    if (moment.isMoment(attrs.start)) {
                        attrs.start.startOf('month');
                    }
                    if (moment.isMoment(attrs.added_start)) {
                        attrs.added_start.startOf('month');
                    }
                    if (moment.isMoment(attrs.end)) {
                        attrs.end.endOf('month');
                    }
                    if (moment.isMoment(attrs.added_end)) {
                        attrs.added_end.endOf('month');
                    }
                }

                // auto set added_start / added_end if not in attributes
                if (attrs.start && !attrs.added_start) {
                    attrs.added_start = moment(attrs.start);
                }
                if (attrs.end && !attrs.added_end) {
                    attrs.added_end = moment(attrs.end);
                }
            }

            // manually set added start and added end for the query 'search'
	        else {
	            if (moment.isMoment(attrs.start)) {
                    attrs.added_start = attrs.start.clone();
                }
                if (moment.isMoment(attrs.end)) {
                    attrs.added_end = attrs.end.clone();
                }
            }

	        _super.set.apply(this, [attrs, options]);

            // caculate the current diff when both start and end are set (init the daterange)
            if (attrs.start && attrs.end) {
                this.diffCurrent();
            }
        
            return this;
        },
        
        reset: function(attributes, options){
            this.set(attributes, options);
            this.trigger('reset');
        },

        // width for all resources displayed on the chart
        duration: function(){

            if(this.get('base') == 'hours'){
                // = day(s) * hours
                return this.timelapses.size();
            }
            else {
                // use default duration from 'period'
                return _super.duration.call(this);
            }
        },
        
        addedFull: function(){
            this.attributes.added_start = moment(this.attributes.start);
            this.attributes.added_end = moment(this.attributes.end);
        },

        timelapsesCount: function(){
	        // load day or month depending on the base of global period
	        var df = this.get(base) === 'hours' ? 'days' : 'months';

            return Math.round(this.end().diff(this.start(), df, true));
        },

        reachTimelapseCount: function(number){
            var count = this.timelapsesCount();
            if(number - count > 0){
                this.nextTimelapse(number - count);
            }
        },

        isWorkingDate: function(moment){
            var working_date = this.get("working_date");
            var day_name = moment.format('dddd').toLowerCase();

            var exist = _.find(working_date, function(date){
                return date.name === day_name
            });

            return exist != null;
        },

        nextTimelapse: function(nb){
            nb = nb || 1;

            if(this.get('base') === 'hours'){

                // start with one more day
                var end_plus = moment(this.end()).add('days', 1),
                    next_day = moment(end_plus).add('days', nb - 1),
                    next_start = moment(end_plus).startOf('day'),
                    next_end = moment(next_day).endOf('day');

                // exclude non-working date
                while(true){
                    if (this.isWorkingDate(next_day)) break;
                    end_plus = end_plus.add('days', 1);
                    next_day = moment(end_plus).add('days', nb - 1);
                    next_start = moment(end_plus).startOf('day');
                    next_end = moment(next_day).endOf('day');
                }
            }
            else {
                // start with one more month
                var end_plus = moment(this.end()).add('months', 1),
                    next_month = moment(end_plus).add('months', nb - 1),
                    next_start = moment(end_plus).startOf('month'),
                    next_end = moment(next_month).endOf('month');
            }

            this.set({
                end: next_end,
                added_start: next_start,
                added_end: next_end
            });

            this.trigger('next');
        },

        previousTimelapse: function(nb){
            nb = nb || 1;

            if(this.get('base') === 'hours'){

                var start_minus = moment(this.start()).subtract('day', 1),
                    previous_day = moment(start_minus).subtract('day', nb - 1),
                    previous_start = moment(previous_day).startOf('day'),
                    previous_end = moment(start_minus).endOf('day');

                while(true){
                    if (this.isWorkingDate(previous_day)) break;
                    start_minus = moment(start_minus).subtract('day', 1);
                    previous_day = moment(start_minus).subtract('day', nb - 1);
                    previous_start = moment(previous_day).startOf('day');
                    previous_end = moment(start_minus).endOf('day');
                }
            }
            else {
                var start_minus = moment(this.start()).subtract('months', 1),
                    previous_month = moment(start_minus).subtract('months', nb - 1),
                    previous_start = moment(previous_month).startOf('month'),
                    previous_end = moment(start_minus).endOf('month');
            }

            this.set({
                start: previous_start,
                added_start: previous_start,
                added_end: previous_end
            });
            
            this.trigger('previous');
        },
        
        diffCurrent: function(){
            this.timelapses.reset();
            this.diffTime(this.start(), this.end());
        },

        diffAdded: function(){
            this.diffTime(this.get('added_start'), this.get('added_end'));
        },

        diffTime: function(start, end){
            console.time('[DateRange][diffTime]');

            // if user uses months/days booking chart
            if(!this.get("base") || this.get("base") === "days"){

                var format = this.options.format,
                month_iterator = start.twix(end).iterate('months'),
                month_current, months = [], month, month_id,
                day_current, day_last, day_iterator;

                while(month_iterator.hasNext()){
                    month_current = month_iterator.next();
                    month_id = month_current.format('YYYY-MM');

                    if(!this.timelapses.has(month_id)){
                        month = {
                            id: month_id,
                            format: format,
                            moment: month_current,
                            days: []
                        };

                        day_current = moment(month_current);
                        day_last = moment(day_current).endOf('month');
                        day_iterator = day_current.twix(day_last).iterate('days');

                        while(day_iterator.hasNext()){
                            day_current = day_iterator.next();
                            month.days.push({
                                moment: day_current
                            });
                        }
                        months.push(new Month(month)); // TODO: use 'Month' model
                    }
                    else {
                        console.log('month %s already added', month_id);
                    }
                }
                this.timelapses.add(months); // TODO: timelapses now is a collection of 'Month' model
            }

            // if user uses days/hours booking chart
            else {

                var format = this.options.format,
                    day_iterator = start.twix(end).iterate('days'),
                    day_current, days = [], day, day_id, day_name;

                while(day_iterator.hasNext()){
                    day_current = day_iterator.next();
                    day_id = day_current.format('YYYY-MM-DD');
                    day_name = day_current.format('dddd').toLowerCase();

                    var working_date = this.get("working_date");

                    // if current day is working day > get 'start' and 'end'
                    var target = _.find(working_date, function(_date){
                        return _date.name === day_name
                    });

                    if(target){

                        if(!this.timelapses.has(day_id)){

	                        // should include one more hour to exclude at the end
	                        // from 09:00 -> 22:00 => hours = [09, ...., 23]
	                        // generate quarter from 09 to 22 (including 22) but stop at 23
							var hours = _.range(target.start, target.end + 1),
								quarters = this.quartersFor(hours);

                            day = {
                                id: day_id,
                                format: format,
                                moment: day_current,
                                hours: hours,
                                quarters: quarters
                            };

                            days.push(new Day(day)); // TODO: use 'Day' model
                        }
                        else {
                            console.log('day %s already added', day_id);
                        }
                    }
                }
                this.timelapses.add(days); // TODO: timelapse now contain only collection of days
            }

            console.timeEnd('[DateRange][diffTime]');
        },

	    /*
	    * get quarters for list of hours
	    * @param {Array} hours: array of hours to get quarters
	    **/
        quartersFor: function(hours){
            var quarters = [],
                incr = hours[0];

            _.each(hours, function(hour){

                while(true){
                    // ex: 09 < 21
                    if(incr <= hours[hours.length - 1]){
                        if (incr !== hour + 1){
                            quarters.push({
                                hour: hour,
                                quarter: (incr !== hour + 1) ? (incr - hour) * 60 : hour
                            });
                            incr += 0.25;
                        }
                        else {
                            incr = hour + 1; break;
                        }
                    }
                    else {
                        break;
                    }
                }
            });
            return quarters;
        }
    });

    booking.models('DateRange', DateRange);
});