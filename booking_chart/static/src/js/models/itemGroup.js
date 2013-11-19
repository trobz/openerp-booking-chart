openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var Query = base.models('GroupQuery'),
        _super = Query.prototype;
    
    var ItemGroup = Query.extend({
        
        defaults: function(){
            return {
                open: false
            };    
        },
        
        /*
         * Create a group collection based on the parent collection constructor.
         * This collection will be populated with GroupQuery fetch results.
         */
        createCollection: function(){
            var Constructor = this.collection.constructor;
            this.group = new Constructor([], {
                model_name: this.collection.model_name
            });
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

    booking.models('ItemGroup', ItemGroup);

});