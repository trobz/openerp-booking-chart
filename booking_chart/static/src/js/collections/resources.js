openerp.unleashed.module('booking_chart', function(booking, _, Backbone){
    
    var Overlap = booking.collections('Overlap'),
        Resource = booking.models('Resource'),
        _super = Overlap.prototype;
    
    var Resources = Overlap.extend({

        model: Resource,
        model_name: 'booking.resource',
        
        item_ids: [],
        
        initialize: function(models, options){
            this.ref = options.ref;
            this.item_ids = [];
            
            this.bind();
        
            _super.initialize.apply(this, arguments);
        },
        
        bind: function(){
        	this.ref.period.on('change', this.update, this);
            this.ref.items.on('sync', this.pagerChange, this);
            this.on('invalid', this.modelError, this);
        },
        
        unbind: function(){
            this.ref.period.off(null, null, this);
            this.ref.items.off(null, null, this);
            this.off(null, null, this);
        },
        
        pagerChange: function(){
            var ids = [];
            this.reset([]);
            this.ref.items.each(function(item){
                ids.push(item.get('id'));
            });
            this.item_ids = ids;
            return this.fetch();
        },
        
        search: function(){
            var period_start = this.ref.period.get('added_start').format('YYYY-MM-DD'),
                period_end = this.ref.period.get('added_end').format('YYYY-MM-DD');
            
            var search = {
                remove: false,
                filter: [
                    [ 'resource_id', 'in', this.item_ids ],
                    [ 'chart.id', '=', this.ref.chart.get('id') ],
                    '&', [ 'date_start', '<=',  period_end ], [ 'date_end', '>=',  period_start ],
                ]
            };
            return search;
        },
        
        modelError: function(model, error, options){
            throw options.validationError;
        }
    });

    booking.collections('Resources', Resources);

});