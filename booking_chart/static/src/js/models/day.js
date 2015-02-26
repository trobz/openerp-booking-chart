openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){

    var Model = Backbone.Model;

    var Day = Model.extend({

        nbHours: function(){
            return _.size(this.get("hours"));
        },

        current_day: function(){
            return this.id === moment().format("YYYY-MM-DD");
        },

        numberOfEmFromStartOfDay: function(){

            var period = this.get('global_period'),
                today = moment().minute(0).second(0),
                today_wd = period.workingDay(today);

            if (period.isWorkingDate(today) && this.get('moment').isSame(today, 'day')){

                var start_today_wd = today.clone().hour(today_wd.start).minute(0).second(0),
                    duration = period.rescDuration(start_today_wd, today);

                return duration / 15;
            }

            return -10; // any number less than 0
        },

        current_hour: function(hour){
            return this.current_day() && moment().format('H') == hour;
        },

        // get size as width for 'calendar-day-container' (exclude the last hour of day)
        nbQuarters: function(){
            return _.size(this.get("quarters")) - 1;
        },

        // get quarter for the current hour
        quartersFor: function(hour){
            return _.filter(this.get("quarters"), function(quarter){
                return quarter.hour === hour;
            });
        }
    });

    booking.models("Day", Day)
});