openerp.unleashed.module('booking_chart').ready(function(instance){
    
    var FieldChartSelector = instance.web.form.FieldMany2One.extend({
        
        /*
         * Fire event when the chart field value change
         */
        reinit_value: function(val) {
            this._super(val);
            this.trigger('chart:selected', val);
        }
    });

    instance.booking_chart.FieldChartSelector = FieldChartSelector;
    instance.web.form.widgets.add('booking_chart_selector', 'instance.booking_chart.FieldChartSelector');
});