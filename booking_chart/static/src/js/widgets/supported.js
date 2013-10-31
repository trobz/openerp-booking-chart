openerp.unleashed.module('booking_chart').ready(function(instance, booking, _, Backbone, base){
    
    /*
     * Reference selector field, specific for booking.resource.supported_model_ids field 
     * Only Supported models will be displayed in the selection.
     */
    var FieldSupportedModelsSelector = instance.web.form.FieldReference.extend({

        /*
         * Override init.
         * Get a reference to the chart field widget at initialization.
         * Listen to changes on this field to update the reference widget.
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
            this.supported_models = false;
            this.field_chart_selector.on('chart:selected', this, this.change_model);
        },
        
        /*
         * Override initialize_content, Change selection values after init
         */
        initialize_content: function(){
            this.reference_ready = false;
            this._super.apply(this, arguments);
            this.set_selection_values();
            this.render_selection();
            this.reference_ready = true;
         },        
        
        /*
         * Refresh the selection at rendering
         */
        render_value: function() {
            this._super.apply(this, arguments);
        },
        
        /*
         * Change the supported model and refresh all sub widgets
         */
        change_model: function(chart_model){
            if(this.reference_ready){
                this.set_supported_models(chart_model);        
                if (!this.get('effective_readonly')) {
                    this.set_selection_values();        
                    this.render_selection();
                    this.internal_set_value([false, false]);
                    this.render_value();
                }   
            }
        },
        
        render_selection: function(){
            
            if(!this.get('effective_readonly') && this.get_supported_models().length == 0){
                this.selection.$('select').hide();
                if(this.selection.$('.warn-message').length == 0){
                    this.selection.$el.prepend($('<span class="warn-message">').text(
                        base._lt('Please, select a Booking Chart first.')
                    ));
                }
            }
            else {
                this.selection.$('select').show();
                this.selection.$('.warn-message').remove();
                this.selection.renderElement();
                this.selection.render_value();
            }
        },
        
        /*
         * Reset selection values
         */
        set_selection_values: function(){
            this.selection.values = _(this.get_supported_models()).chain()
                .reject(function (v) { return v[0] === false && v[1] === ''; })
                .unshift([false, ''])
                .value();
        },
        
        /*
         * Get supported models from property or field manager
         */
        get_supported_models: function(){
            return this.supported_models || [];
        },
        
        /*
         * Set supported models based on chart model
         */
        set_supported_models: function(chart_model){
            this.supported_models = chart_model ? chart_model.get('supported_models') : false;
        },
        
        /*
         * Remove chart widget listener 
         */
        destroy: function(){
            this.field_chart_selector.off('chart:selected', this, this.change_model);
            this._super.apply(this, arguments);
        }
    });

    instance.booking_chart.FieldSupportedModelsSelector = FieldSupportedModelsSelector;
    instance.web.form.widgets.add('booking_supported_models_selector', 'instance.booking_chart.FieldSupportedModelsSelector');
});
        
