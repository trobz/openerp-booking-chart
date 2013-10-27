openerp.unleashed.module('booking_chart', function(booking, _, Backbone){
    
    var Month = booking.models('Month');
    
    var Collection = Backbone.Collection,
        _super = Collection.prototype;
    
    var Months = Collection.extend({
        
        model: Month,
        
        comparator: 'id',
        
        has: function(id){
            return this.get(id) instanceof Backbone.Model;
        }
    });

    booking.collections('Months', Months);

});