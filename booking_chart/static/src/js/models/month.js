openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    /*
     * Small helper to get moment info
     */
    var Day = function(moment, options){
        this.options = options;
        this.moment = moment;
    };
    
    Day.prototype = {
        
        value: function(){
            return this.format(options.format || 'ddd[<br />]D');
        },
        
        format: function(format){
            return this.moment.format(format);
        },
        
        special: function(){
            var special = [];
            if(this.options.current && this.today()){
                special.push('today');
            }
            if(this.weekend()){
                special.push('weekend');
            }    
            return special.join(' ');
        },
        
        today: function(){
            return this.moment.isSame(moment(), 'day');
        },
        
        weekend: function(){
            var day = this.moment.day();
            return day == 0 || day == 6;
        }
    };
    
    
    var Model = Backbone.Model,
        _superModel = Model.prototype;
    
    /*
     * Days sub collection
     */    
    
    var Month = Model.extend({

        value: function(){
            return this.get('moment').format(
                this.get('format').month || 'MMMM YYYY'
            );
        },
        
        days: function(){
            return _(this.get('days')).map(function(day){
                return new Day(day.moment, { 
                    format: this.get('format').day, 
                    current: this.current() 
                });
            }, this);
        },
        
        nbDays: function(){
            return this.get('days').length;
        },
        
        weekday: function(){
            if(!this.has('weekday')){
                this.set('weekday', this.get('moment').day());
            }
            return this.get('weekday');
        },
            
        numberOfDaysFromToday: function(){
            return Math.floor(moment().diff(this.get('moment'), 'days', true));
        },
        
        current: function(){
            if(!this.has('current')){
                this.set('current', this.get('moment').isSame(moment(), 'month'));
            }
            return this.get('current');
        }
    });

    booking.models('Month', Month);
});