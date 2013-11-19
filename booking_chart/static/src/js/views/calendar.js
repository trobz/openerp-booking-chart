openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){

    var Layout = Backbone.Marionette.Layout,
        _super = Layout.prototype;
        
    var Calendar = Layout.extend({
        
        regionType: base.views('Region'),
        
        template: 'Booking.Calendar',
        
        regions: {
            items: '.booking-chart-items',
            months: '.booking-chart-months',
            controls: '.booking-chart-controls' 
        },
        
        ui: {
            items: '.booking-chart-items',
            months: '.booking-chart-months', 
            controls: '.booking-chart-controls', 
        },
        
        initialize: function(options){
            
            this.collection = this.model.items;
            
            var Items = booking.views('Items'),
                Months = booking.views('Months'),
                Controls = booking.views('Controls'),
                Graph = booking.views('Graph');
            
            this.period = options.period;
            
            this.views = {
                items: new Items({
                    collection: this.collection
                }),
                months: new Months({
                    model: this.period,
                    items: this.collection
                }),
                graph: new Graph({
                    collection: this.model.resources,
                    items: this.collection,
                    period: this.period
                }),
                controls: new Controls({
                    model: this.period
                })
            };
        },
        
        onShow: function(){
            // graph view share the months view DOM element, force graph view closing when months is closed     
            this.listenTo(this.months, 'close', _.bind(this.views.graph.close, this.views.graph));
        },
        
        onRender: function(){
            // force defaults of bootstrap tooltip
            _.extend($.fn.tooltip.Constructor.DEFAULTS, {
                container: '.tooltip-container',
                placement: 'bottom',
                html: true,
                delay: 500
            }); 
            
            this.items.directShow(this.views.items);
            this.months.directShow(this.views.months);
            this.controls.directShow(this.views.controls);
            
            // the graph view is mixed with the months view (share the same DOM Element) and 
            // display his items inside...
            this.views.graph.setElement(this.views.months.$el);
            this.views.graph.render();
        }
    });     

    booking.views('Calendar', Calendar);

});