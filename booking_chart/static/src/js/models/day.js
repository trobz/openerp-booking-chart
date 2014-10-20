openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){

    var Model = Backbone.Model;

    var Day = Model.extend({

        nbHours: function(){
            return _.size(this.get("hours"));
        },

        // TODO: get size as width for 'calendar-day-container' (exclude the last hour of day)
        nbQuarters: function(){
            return _.size(this.get("quarters")) - 1;
        },

        // TODO: get quarter for the current hour
        quartersFor: function(hour){
            return _.filter(this.get("quarters"), function(quarter){
                return quarter.hour === hour;
            });
        }
    });

    booking.models("Day", Day)
});