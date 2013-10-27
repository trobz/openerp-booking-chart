openerp.unleashed.module('booking_chart',function(booking, _, Backbone, base){
 
    var Panel = base.views('Panel'),
        _super = Panel.prototype;

    var BookingPanel = Panel.extend({
        
        regions: {
            calendar: '.booking-calendar',
            graph: '.booking-graph'
        }
        
    });

    booking.views('Panel', BookingPanel);

});