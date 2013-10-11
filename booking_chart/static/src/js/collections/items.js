openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var Pager = base.collections('Pager'),
        BaseModel = base.models('BaseModel'),
        _super = Pager.prototype;
    
    var Items = Pager.extend({

        model: BaseModel,
        
        group_by: 'group',
        
        initialize: function(models, options){
            this.ref = options.ref;
            
            this._default_context = [];
            
            this._query = {
                fields: ['name'],
                filter: this._default_context,
                group_by: null
            };
        
            this.prepare();
            
            _super.initialize.apply(this, arguments);
        },  
        
        hasGroup: function(){
            return this.length > 0 && this.at(0).has('group');
        },
        
        prepare: function(){
            var def = $.Deferred()
            this.ready = def.promise();
            
            var self = this, chart = this.ref.chart;
            chart.ready.done(function(){
                self.setContext(chart.get('resource_domain'));
                self.setModel(chart.get('resource_model_name'));
                self.init().done(function(){
                    def.resolve();
                });
            });
        },
        
        bind: function(){},
        
        unbind: function(){},
        
        setModel: function(model_name){
            this.model_name = model_name;
        },
        
        setContext: function(context){
            try {
                this._default_context = JSON.parse(context);
            }
            catch(e){
                throw new Error('"booking.chart.resource_domain" is not a valid JSON string: "' + context + '"');
                this._default_context = [];
            }
            this.updateQuery(this.ref.domain);
        },
        
        updateQuery: function(domain, context, group_by){
            _.extend(this._query, {
                context: context  || [],
                filter: (domain || []).concat(this._default_context),
                group_by: group_by || null       
            });
            return this;
        },
        
        getQuery: function(){
            return this._query;
        },
        
        search: function(){
            var search = _super.search.apply(this, arguments);
            _.extend(search, this.getQuery());
            return search; 
        },

        comparator: function (item) {
            return item.get('name');
        },
        
        getResourceTitle: function(){
        	return this.ref.chart.get('resource_name') || 'Resources';
        }
    });

    booking.collections('Items', Items);

});