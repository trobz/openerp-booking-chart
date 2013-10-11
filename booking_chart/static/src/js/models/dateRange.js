openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
       
    var current_month = moment().format('YYYY-MM'),
        Period = base.models('Period'),
        _super = Period.prototype;
    
    var DateRange = Period.extend({
        
        defaults: {
            start: moment(current_month),
            end: moment(current_month).add('months', 5),
            added_start: moment(current_month),
            added_end: moment(current_month).add('months', 5),
        },
         
        initialize: function(){
            this.data = {
                details: { previous: null, current: null, diff: null }
            };
            
            _super.initialize.apply(this, arguments);
        },
        
        constructor: function(data, options){
            var format_option = options && options.format ? options.format : {};
                    
            this.options = {
                format: _.extend({
                    year:    'YYYY',
                    month:   'MMMM YYYY',
                    day:     'ddd[<br />]D',
                }, format_option)
            };
            
            Period.apply(this, [data, options]);
        },
        
        setDefaults: function(start, end){
            this._start = start;
            this._end = end;
        },
        
        
        monthsCount: function(){
            return Math.round(this.end().diff(this.start(), 'months', true));
        },
        
        set: function(key, val, options){
            var attrs, attr;
            if ( typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }
            
            if(attrs.start && !('added_start' in attrs)){
                attrs.added_start = moment(attrs.start);
            }
            if(attrs.end && !('added_end' in attrs)){
                attrs.added_end = moment(attrs.end);
            }
        
            return _super.set.apply(this, [attrs, options]);
        },
        
        reset: function(){
            this.set({
                start: this._start,
                end: this._end
            }, {silent: true});
        },
        
        addedFull: function(){
            this.attributes.added_start = moment(this.attributes.start);
            this.attributes.added_end = moment(this.attributes.end);
        },
        
        nextMonth: function(){
            var end = this.end(),
                next_month = moment(end).add('months', 1);
            
            
            this.set({
                end: next_month,
                added_start: end,
                added_end: next_month
            });
            
            this.trigger('next');
        },
        dateRangePicker: function(start, end){
            this.set({
                end: end,
                start: start
            });
            this.trigger('dateRangePicker');
        },

        previousMonth: function(){
            var start = this.start(),
                previous_month = moment(start).subtract('months', 1);
            
            this.set({
                start: previous_month,
                added_start: previous_month,
                added_end: start
            });
            
            this.trigger('previous');
        },
        
        diffFirstMonth: function(){
            return this.diffMonth(this.start().format('YYYY-MM'));    
        },
        
        diffLastMonth: function(){
            return this.diffMonth(moment(this.end()).subtract('days', 1).format('YYYY-MM'));    
        },
        
        diffCurrent: function(){
            return this.diffDays(this.start(), this.end());
        },
        
        diffAdded: function(){
            return this.diffDays(this.get('added_start'), this.get('added_end'));
        },
        
        
        diffMonth: function(month){
            return this.diffDays(moment(month),moment(month).add(1,'months'));
        },
        
        diffDays: function(start, end){
            var diff = Math.ceil(end.diff(start, 'days', true)), 
                current = moment(start),
                format = this.options.format,
                results = { months: []};            
            for(var i = 0 ; i < diff ; i++){
            
                var special = current.day() == 0 || current.day() == 6 ? 'weekend' : '';
                special = moment().format('YYYY-MM-DD') == current.format('YYYY-MM-DD') ? 'today' : special; 

                var month_id = current.format('YYYY-MM'),
                    day = {
                        id: current.format('YYYY-MM-DD'),
                        val: current.format(format.day),
                        day_fullname: current.format('dddd'),
                        day_name: current.format('ddd'),
                        day_number: current.format('D'),
                        special: special
                    };
                
                
                var month = _.find(results.months, function(month){
                    return month.id == month_id; 
                });
                
                if(month){
                    month.days.push(day);
                }
                else {
                    results.months.push({
                        id: month_id,
                        val: current.format(format.month),
                        first_day: current.day(),
                        days: [day] 
                    });
                }
                
                if(special == 'today'){
                    results.months[results.months.length-1].special = 'current';
                    results.months[results.months.length-1].nb_days = Math.round(current.diff(moment(current.format('YYYY-MM')), 'days', true));
                }
                
                current.add('days', 1);
            }

            return results;
        }

    });

    booking.models('DateRange', DateRange);

});