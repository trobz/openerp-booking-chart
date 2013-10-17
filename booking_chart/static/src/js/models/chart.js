openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var BaseModel = base.models('BaseModel'),
        _super = BaseModel.prototype;
    
    var Chart = BaseModel.extend({
        
        model_name: 'booking.chart',
        
        initialize: function(model, options){
            if(!(options && options.context)){
                throw new Error('the chart model can not be initialized without a context passed in options.');
            }
            if(!(options && options.ref.ir_models)){
                throw new Error('the chart model can not be initialized without the "ir.model" Collection passed in options.');
            }
            
            this.context = options.context;
            this.ref = options.ref;
            
            this.prepare();
                
            _super.initialize.apply(this, arguments);
        },
        
        prepare: function(){
            var def = $.Deferred()
            this.ready = def.promise();
        
            var self = this;
            this.getChartId(this.context['booking_chart_xml_id'])
            .done(function(result){
            
                self.loadChart(result.res_id)
                .done(function(){
            
                    self.getModelName();
                    def.resolve();
                });
            });
        },
        
        getChartId: function(model_data_name){
            return this.getModelData(model_data_name)
                       .done(function(result){if(!(result && result.res_id)){ throw new Error('no "booking.chart" in "ir.model.data" found with name = "' + booking_chart_xml_id + '".'); }})
                       .fail(function(){throw new Error('can not get a model "booking.chart" with booking_chart_xml_id = "' + booking_chart_xml_id + '".')});
        },
        
        getModelData: function(model_data_name){
            return this.sync(
                'read', 
                {
                    model_name: 'ir.model.data'
                }, 
                {
                    type: 'first', 
                    filter: [
                        ['model', '=', 'booking.chart'], 
                        ['name', '=', model_data_name ]
                    ],
                }
            );
        },
        
        loadChart: function(chart_id){
            var self = this;
            
            this.set('id', chart_id);
            
            return this.fetch()
                       .done(function(){ 
                           if(self.length <= 0) { 
                               throw new Error('not chart found with id:' + chart_id); 
                           } 
                       })
                       .fail(function(error){
                           if(error && error.data && error.data.fault_code){
                               throw new Error(error.data.fault_code);
                           }
                           else {
                               throw new Error('can not get the chart with id:' + chart_id); 
                           }  
                       });
        },
        
        getModelName: function(){
            var self = this;
            this.ref.ir_models.ready.done(function(){
                var model = self.get('resource_model'),
                    ir_model = self.ref.ir_models.get(model.length > 0 ? model[0] : null);
                    
                if(!ir_model){
                    throw new Error('can not get the "ir.model" with id:' + (model.length > 0 ? model[0] : model));
                }   
                
                self.set('resource_model_name', ir_model.get('model'));
            });
        }
    });

    booking.models('Chart', Chart);

});