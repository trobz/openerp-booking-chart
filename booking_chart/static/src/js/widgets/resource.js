openerp.unleashed.module('booking_chart').ready(function(instance, booking, _, Backbone, base){
    
    var BaseModel = base.models('BaseModel');
    // don't use the Chart model defined for the booking view, cause it will 
    // will auto retrieve items and resources...
    var ChartModel = BaseModel.extend({ model_name: 'booking.chart' });
    
    /*
     * Resource selector field, specific for booking.resource.resource_id field 
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
            console.log('FieldResourceSelector  init');
        
            // keep a reference to chart_selector field
             this.field_chart_selector = _(field_manager.fields).find(function(field){
                return field instanceof instance.booking_chart.FieldChartSelector
            });
            
            if(!this.field_chart_selector){
                throw new Error('can not found FieldChartSelector in booking chart form fields');
            }
            this.selected_model = false;
            this.debug_index = 0;
        },
        
        /*
         * Override initialize_content, selection is made automatically when a chart is selected
         */
        initialize_content: function() {
            if(!this.get('effective_readonly')){
                //listening to changes on chart field
                this.field_chart_selector.on('chart:selected', this, this.select_model);
            }
            else {
                this.field_chart_selector.off('chart:selected', this, this.select_model);
            }
    
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
                self.trigger('focused')
            }).on('blurred', null, function() {
                self.trigger('blurred')
            });
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
         * Fired when chart widget change.
         * Get the chart model selected has a Backbone.Model and process it in change_model method
         */
        select_model: function(model_id){
            var model = new ChartModel({
                id: model_id
            }); 
            
            var widget = this;
            model.fetch({ context: this.build_context().eval() }).done(function(){
                widget.change_model(model);
            });
        },
        
        /*
         * Change the selected model and refresh the one2many widget by resetting the local value
         */
        change_model: function(chart_model){
            this.set_selected_model(chart_model);
            
            if (this.reference_ready) {
                var value = this.get('value'), 
                    model = this.get_selected_model(), 
                    id = value.length == 2 && model == value[0] ? value[1] : false;
                
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
            // check chart model values
            var model_ref = chart_model.get('resource_model_name');
            if(_.isString(model_ref) && model_ref.length > 0){
                this.selected_model = model_ref;
            }
        },
        
        /*
         * Remove chart widget listener 
         */
        destroy: function(){
            this.field_chart_selector.off('chart:selected', this, this.select_model);
            this._super.apply(this, arguments);
        }
    });

    instance.booking_chart.FieldResourceSelector = FieldResourceSelector;
    instance.web.form.widgets.add('booking_resource_selector', 'instance.booking_chart.FieldResourceSelector');
});
        
