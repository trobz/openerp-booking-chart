openerp.unleashed.module('booking_chart').ready(function(instance, booking, _, Backbone, base){
    
    
    var BaseModel = base.models('BaseModel');
    // don't use the Chart model defined for the booking view, cause it will 
    // will auto retrieve items and resources...
    var ChartModel = BaseModel.extend({ model_name: 'booking.chart' });
    
    var FieldChartSelector = instance.web.form.FieldMany2One.extend({
        
        /*
         * Fire event when the chart field value change
         */
        reinit_value: function(val) {
            this._super(val);
            
            if(val){
                var model = new ChartModel({
                    id: val
                }); 
                
                var widget = this;
                model.fetch({ context: this.build_context().eval() }).done(function(){
                    widget.trigger('chart:selected', model);
                });    
            }
            else {
                this.trigger('chart:selected', val);
            }
            
        }
    });

    instance.booking_chart.FieldChartSelector = FieldChartSelector;
    instance.web.form.widgets.add('booking_chart_selector', 'instance.booking_chart.FieldChartSelector');
});