openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var BaseModel = base.models('BaseModel'),
        _super = BaseModel.prototype;
    
    var Chart = BaseModel.extend({
        
        model_name: 'booking.chart',
        
        initialize: function(model, options){
            if(!model.id){
                throw new Error('the chart model can not be initialized without an id, check your action if you the booking_chart_id is set in your context.');
            }
            
            var Resources = booking.collections('Resources'),
                Items = booking.collections('Items');
            
            this.fetch().done(_.bind(this.loaded, this));
            
            this.period = options.period;
            
            this.items = new Items([], {
                model_name: options.resource_model
            });
            
            this.resources = new Resources([], {
                chart: this,
                
                items: this.items,
                period: this.period,
                
                attr_date_start: 'date_start',
                attr_date_end: 'date_end',
                attr_group_by: 'resource_ref',
            });
            
            _super.initialize.apply(this, arguments);
        },
        
        loaded: function(){
            this.items.title(this.get('resource_name'));
            this.items.domain(this.get('resource_domain'));
        }
    });

    booking.models('Chart', Chart);

});