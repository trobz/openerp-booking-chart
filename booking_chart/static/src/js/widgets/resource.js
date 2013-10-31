openerp.unleashed.module('booking_chart').ready(function(instance, booking, _, Backbone, base){
    
    /*
     * Resource selector field, specific for booking.resource.resource_ref field 
     * No model selector displayed, Auto select reference model based on the chart selected.
     */
    var FieldResourceSelector = instance.web.form.FieldReference.extend({

        /*
         * Override init.
         * Get a reference to the chart field widget at initialization.
         * Listen to changes on this field to update the resource list.
         */        
        init:function(field_manager, node){ 
            this._super(field_manager, node);
        
            // keep a reference to chart_selector field
            this.field_chart_selector = _(field_manager.fields).find(function(field){
                return field instanceof instance.booking_chart.FieldChartSelector;
            });
            
            if(!this.field_chart_selector){
                throw new Error('can not found FieldChartSelector in booking chart form fields');
            }
        
            this.reference_ready = false;
            this.selected_model = false;
            this.field_chart_selector.on('chart:selected', this, this.change_model);
        },
        
        
        /*
         * Override initialize_content, selection is made automatically when a chart is selected
         */
        initialize_content: function() {
            this.reference_ready = false;
            
            var self = this;
            var fm = new instance.web.form.DefaultFieldManager(this);
            this.fm = fm;
            fm.extend_field_desc({
                "m2o" : {
                    relation : null,
                    type : "many2one",
                },
            });
            
            this.m2o = new instance.web.form.FieldMany2One(fm, {
                attrs : {
                    name : 'm2o',
                    modifiers : JSON.stringify({
                        readonly : this.get('effective_readonly')
                    }),
                }
            });
            
            this.m2o._debug = "ResourceWidget" + (this.debug_index++);
            this.m2o.on("change:value", this, this.data_changed);
            this.m2o.appendTo(this.$(".oe_form_view_reference_m2o"));
            this.m2o.on('focused', null, function() {
                self.trigger('focused');
            }).on('blurred', null, function() {
                self.trigger('blurred');
            });
            
            this.reference_ready = true;
        },
        
        /*
         * Override render, just render the many2one field (selection field removed)
         */
        render_value: function() {
            var value = this.get('value'), has_value = !!value[0],
                text = !has_value ? base._lt('Please, select a Booking Chart first.') : '';
            
            this.$('.oe_form_view_reference_selection').text(text);
            
            this.reference_ready = false;
            this.m2o.field.relation = value[0];
            this.m2o.set_value(value[1]);
            this.m2o.$el.toggle(has_value);
            this.reference_ready = true;
        },
        
        /*
         * Override data_changed, set the model from the selected chart instead of the selection
         */
        data_changed: function() {
            if (this.reference_ready) {
                this.internal_set_value([this.get_selected_model(), this.m2o.get_value()]);
            }
        },
        
        /*
         * Change the selected model and refresh the one2many widget by resetting the local value
         */
        change_model: function(chart_model){
            this.set_selected_model(chart_model);
            
            if (this.reference_ready) {
                var id = false, model = false;
                if(chart_model){
                    var value = this.get('value');
                    model = this.get_selected_model(), 
                    id = value.length == 2 && model == value[0] ? value[1] : false;
                }
                this.internal_set_value([model, id]);
                this.render_value();    
            }
        },
        
        /*
         * Get the selected value, in a specific property if possible, or from the value defined
         * by the inherited FieldReference widget
         */
        get_selected_model: function(){
            var value = this.get('value');
            return this.selected_model ?  this.selected_model : (_.isArray(value) ? value[0] : false);
        },
        
        /*
         * Check model validity and set a selected model property on widget
         */
        set_selected_model: function(chart_model){
            this.selected_model = chart_model ? chart_model.get('resource_model_name') : false;
        },
        
        /*
         * Remove chart widget listener 
         */
        destroy: function(){
            this.field_chart_selector.off('chart:selected', this, this.change_model);
            this._super.apply(this, arguments);
        }
    });

    instance.booking_chart.FieldResourceSelector = FieldResourceSelector;
    instance.web.form.widgets.add('booking_resource_selector', 'instance.booking_chart.FieldResourceSelector');
});
        
