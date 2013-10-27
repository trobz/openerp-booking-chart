openerp.unleashed.module('booking_chart', function (booking, _, Backbone, base) {

    var View = Backbone.Marionette.View,
        _super = View.prototype;

    var Controls = View.extend({
        template: 'Booking.Calendar.controls',
        
        events: {
            'click a' : 'zoom'
        },
        
        ui: {
            current: 'li.active a'
        },
        
        zoom: function(e){
            e.preventDefault();
            this.bindUIElements();
            
            var $zoom = $(e.currentTarget);
                
            this.ui.current.parent().removeClass('active');
            $zoom.parent().addClass('active');
            
            this.model.zoom($zoom.attr('level'));
        },
        
        render: function(){
            this.$el.empty().html(
                base.render(this.template)
            );
            return this;
        }
    });
    
    booking.views('Controls', Controls); 
});