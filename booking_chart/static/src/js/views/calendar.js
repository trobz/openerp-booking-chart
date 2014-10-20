openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){

    var Layout = Backbone.Marionette.Layout,
        _super = Layout.prototype;

    var Items = booking.views('Items'),
        Timelapses = booking.views('Timelapses'),
        Controls = booking.views('Controls'),
        Graph = booking.views('Graph');
        
    var Calendar = Layout.extend({
        
        regionType: base.views('Region'),
        
        template: 'Booking.Calendar',
        
        regions: {
            items: '.booking-chart-items',
            timelapses: '.booking-chart-timelapses',
            controls: '.booking-chart-controls' 
        },

        ui: {
            items: '.booking-chart-items',
            timelapses: '.booking-chart-timelapses',
            controls: '.booking-chart-controls'
        },
        
        initialize: function(options){

            // model = chart (override the collection)
            this.collection = this.model.items;

            this.period = options.period;

            this.views = {
                items: new Items({
                    collection: this.collection
                }),
                timelapses: new Timelapses({
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
            // graph view share the months view DOM element, force graph view closing when timelapses is closed
            this.listenTo(this.timelapses, 'close', _.bind(this.views.graph.close, this.views.graph));
        },
        
        onRender: function(){

            // force defaults of bootstrap tooltip
            _.extend($.fn.tooltip.Constructor.DEFAULTS, {
                container: '.tooltip-container',
                placement: 'bottom',
                html: true,
                delay: 500
            }); 

            // show the following views
            this.items.directShow(this.views.items);
            this.timelapses.directShow(this.views.timelapses);
            this.controls.directShow(this.views.controls);
            
            // the graph view is mixed with the months view (share the
            // same DOM Element) and display his items inside...
            this.views.graph.setElement(this.views.timelapses.$el);
            this.views.graph.render();
        }
    });     

    booking.views('Calendar', Calendar);
});