openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var Model = base.models('BaseModel'),
        _super = Model.prototype;
    
    var Item = Model.extend({
        
        defaults: function(){
            return {
                open: false,
                height: 1
            };    
        },
		
		initialize: function(data, options){
            this.model_name = this.collection.model_name;
        },
        
        toggle: function(){
            this.isOpen() ? this.close() : this.open();
        },

        title: function(){
            var field = this.collection.options.title || 'name';
            return this.get(field);
        },
        
        open: function(){
            this.set({
                open: true
            });    
        },
        
        close: function(){
            this.set({
                open: false
            });    
        },
        
        isOpen: function(){
            return this.get('open');
        }
    });

    booking.models('Item', Item);

});