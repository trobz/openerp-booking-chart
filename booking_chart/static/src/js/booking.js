var debug = null;

/*---------------------------------------------------------
 * booking_chart
 *---------------------------------------------------------*/

openerp.unleashed.module('booking_chart').ready(function(instance, booking, _, Backbone, base) {

    var UnleashedView = base.views('Unleashed');

    instance.web.views.add('booking', 'instance.booking_chart.BookingView');
    instance.booking_chart.BookingView = UnleashedView.extend({
        
        display_name: base._lt('Booking'),
        template: "Booking",
        view_type: 'booking',
        
        Panel: booking.views('Panel'),
        State: booking.models('State'),    
        
        module: booking,
        
        stateConfig: function(){
            this.state.link({
                chart: this.models.chart,
                period: this.models.period,
                calendar: this.views.calendar
            });
        },
            
        start: function(){
            // Language for Booking chart
            if(instance.session.lang) {
            	moment.lang(instance.session.lang);
            }
            // models
            var DateRange = booking.models('DateRange'),
                Chart = booking.models('Chart');
            
            var period = new DateRange(),
                chart = new Chart({ 
                    //id: this.context.booking_chart_id
                    id: this.dataset.context.booking_chart_id
                }, {
                    resource_model: this.dataset.model,
                    period: period 
                });
            
            // views    
            var Pager = base.views('Pager'),
                Buttons = booking.views('Buttons'),
                Toolbar = booking.views('Toolbar'),
                Calendar = booking.views('Calendar'),
                Graph = booking.views('Graph');

            var calendar = new Calendar({
                    model: chart,
                    period: period
                }),
                pager = new Pager({
                    collection: chart.items
                }),
                buttons = new Buttons({
                    model: period
                }),
                toolbar = new Toolbar({
                    model: period
                });
        
            this.models = { period: period, chart: chart };
            this.views = { calendar: calendar, pager: pager, buttons: buttons, toolbar: toolbar };
                    
            return this._super();
        },


        configure: function(data){
            // use arch data to configure the booking chart
            _(data.arch.children).each(function(obj){
                if(obj.tag == 'items'){
                    this.models.chart.items.setOptions(obj.attrs);
                }
            }, this);
        },
        
        ready: function(data){
            this.panel.pager.directShow(this.views.pager);
            this.panel.buttons.directShow(this.views.buttons);
            this.panel.sidebar.directShow(this.views.toolbar);
            this.panel.calendar.directShow(this.views.calendar);
        },
        
        search_disabled: false,
        
        do_action: function(){
            // hack to disable the search the first time when the user
            // go back to the booking chart view
            this.search_disabled = true;
            this._super.apply(this, arguments);
        },
        
        do_search: function(domain, context, group_by){
            if(!this.search_disabled){
                this.models.chart.items.load({
                    filter: domain,
                    group_by: group_by,
                    context: context,
                    persistent: true,
                    reset: true
                });    
            }
            else {
                this.stateChanged();
                this.search_disabled = false;
            }
        } 
    });
});