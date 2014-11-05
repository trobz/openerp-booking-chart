openerp.unleashed.module('booking_chart', function(booking, _, Backbone){
    
    var Month = booking.models('Month');
    
    var Collection = Backbone.Collection;

    /*
     * `model` should not be specified for this collection because
     * there are 2 models to use : Month or Day - which would be changed
     * depending on type of DateRange (hours|days)
     */
    var Timelapses = Collection.extend({

        comparator: 'id',

        has: function(id){
            return this.get(id) instanceof Backbone.Model;
        },

        size: function(){
            // get total quarters size for all days
            var quater_size = this.reduce(function(memo, model){ return memo + _.size(model.get("quarters")); }, 0);

            // to exclude the last hour from day
            var hour_size = _.size(this.models);

            // total quarters in days excluding the last hour from each day
            return quater_size - hour_size;
        }
    });

    booking.collections('Timelapses', Timelapses);
});