openerp.unleashed.module('booking_chart', function (booking, _, Backbone, base) {

    var View = Backbone.Marionette.ItemView,
        _super = View.prototype;

    var Buttons = View.extend({

        template: 'Booking.Buttons',

        events: {
            'click .btn_freeze': 'toggleFreeze',
            'click .btn_today': 'today'
        },
        
        modelEvents: {
            'change:frozen': 'updateFrozenState',
            'change:start change:end': 'updateTodayState'
        },
        
        ui: {
            freeze: '.btn_freeze',
            today:  '.btn_today'
        },

        onRender: function () {
            this.updateFrozenState();
            this.updateTodayState();
            
        },
                
        updateTodayState: function(){
            if(this.model.hasToday()){
                this.ui.today.removeAttr('disabled');
            }
            else {
                this.ui.today.attr('disabled', 'disabled');
            }
        },

        updateFrozenState: function() {
            if(this.model.isFrozen()) {
                this.ui.freeze.addClass('active').text('Unfreeze');
            } 
            else {
                this.ui.freeze.removeClass('active').text('Freeze');
            }
        },
        
        today: function(){
            this.model.scrollToday();
        },

        toggleFreeze: function(){
            if(this.model.isFrozen()) {
                this.model.unfreeze();
            }
            else {
                this.model.freeze();
            }
        }
    });

    booking.views('Buttons', Buttons);
});
