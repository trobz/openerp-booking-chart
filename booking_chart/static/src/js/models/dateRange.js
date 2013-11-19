openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
       
    var current_month = moment().format('YYYY-MM'),
        Months = booking.collections('Months');
        
    var Period = base.models('Period'),
        _super = Period.prototype;
    
    
    var status = function(period){
        console.log('period: from %s to %s, added from %s to %s', 
                    period.get('start').format('YYYY-MM-DD'),
                    period.get('end').format('YYYY-MM-DD'),
                    period.get('added_start').format('YYYY-MM-DD'),
                    period.get('added_end').format('YYYY-MM-DD'));
    };
    
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
                }, format_option)
            };
        
            this.months = new Months();
            
            Period.apply(this, [model, options]);
        },
        
        initialize: function(model, options){
            this.on('next previous', this.diffAdded, this);
        },
        
        zoom: function(size){
        
            // load additional months, to have enough month to display
            if(size == 'xs'){
                this.reachMonthCount(6);
            }
            if(size == 's'){
                this.reachMonthCount(4);
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
            this.set('scroll', diff);
            // should not have to send an event from here, but it make life easier :)
            this.trigger('scroll:today', diff, true);
        },
        
        hasToday: function(){
            return this.has(moment());
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
            
            // force moment to date attributes
            _(attrs).each(function(val, name){
                if(/start|end/.test(name) && !moment.isMoment(val)){
                    attrs[name] = moment(val);
                    if(!attrs[name].isValid()){
                        throw new Error(name + ' is not a correct moment attibute for the period');
                    }
                }
            });
            
            // force dates to be start|end of months
            if(moment.isMoment(attrs.start)){
                attrs.start.startOf('month');
            }
            if(moment.isMoment(attrs.added_start)){
                attrs.added_start.startOf('month');
            }
            if(moment.isMoment(attrs.end)){
                attrs.end.endOf('month');
            }
            if(moment.isMoment(attrs.added_end)){
                attrs.added_end.endOf('month');
            }
            
            // auto set added_start / added_end if not in attributes
            if(attrs.start && !attrs.added_start){
                attrs.added_start = moment(attrs.start);
            }
            if(attrs.end && !attrs.added_end){
                attrs.added_end = moment(attrs.end);
            }
        
            var ret = _super.set.apply(this, [attrs, options]);
            
            // caculate the current diff when both start and end are set (init the daterange)
            if(attrs.start && attrs.end){
                this.diffCurrent();
            }
        
            return ret;
        },
        
        reset: function(attributes){
            this.set(attributes);
            this.trigger('reset');
        },
        
        addedFull: function(){
            this.attributes.added_start = moment(this.attributes.start);
            this.attributes.added_end = moment(this.attributes.end);
        },

        reachMonthCount: function(number){
            var count = this.monthsCount();
            if(number - count > 0){
                this.nextMonth(number - count);
            }
        },
                
        nextMonth: function(nb){
            nb = nb || 1;
                    
            var end_plus = moment(this.end()).add('months', 1),
                next_month = moment(end_plus).add('months', nb - 1),
                next_start = moment(end_plus).startOf('month'),
                next_end = moment(next_month).endOf('month');
            
            this.set({
                end: next_end,
                added_start: next_start,
                added_end: next_end
            });
            
            this.trigger('next');   
        
        },
        
        previousMonth: function(nb){
            nb = nb || 1;
            
            var start_minus = moment(this.start()).subtract('months', 1),
                previous_month = moment(start_minus).subtract('months', nb - 1),
                previous_start = moment(previous_month).startOf('month'),
                previous_end = moment(start_minus).endOf('month');
            
            this.set({
                start: previous_start,
                added_start: previous_start,
                added_end: previous_end
            });
            
            this.trigger('previous');
        },

        numberDaysFromToday: function(){
            return Math.round(Math.abs(this.start().diff(moment(), 'days', true)));
        },
        
        diffCurrent: function(){
            this.months.reset();
            this.diffDays(this.start(), this.end());
        },
        
        diffAdded: function(){
            this.diffDays(this.get('added_start'), this.get('added_end'));
        },
        
        diffDays: function(start, end){
            console.time('[DateRange][diffDays]');
            
            var format = this.options.format,
                month_iterator = start.twix(end).iterate('months'),
                month_current, months = [], month, month_id,
                day_current, day_last, day_iterator;
            
            //console.log('diffDays from %s to %s', start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
            
            while(month_iterator.hasNext()){
                month_current = month_iterator.next();
                month_id = month_current.format('YYYY-MM');
                
                if(!this.months.has(month_id)){
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
                    //console.log('process month %s, from %s', month_id, day_current.format('YYYY-MM-DD'), day_last.format('YYYY-MM-DD'));
                    months.push(month);
                }
                else {
                    console.log('month %s already added', month_id);
                }
            }
                        
            this.months.add(months);
            console.timeEnd('[DateRange][diffDays]');
        }

    });

    booking.models('DateRange', DateRange);

});