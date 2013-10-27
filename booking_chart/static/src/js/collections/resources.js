openerp.unleashed.module('booking_chart', function(booking, _, Backbone){
    
    var Overlap = booking.collections('Overlap'),
        Resource = booking.models('Resource'),
        _super = Overlap.prototype;
    
    
    var Group = Overlap.extend({
        label: function(){
            var title = [];
            this.each(function(model){
                title.push(model.get("name"));
            });
            return title.join(', ');
        }
    });
    
    
    var Resources = Overlap.extend({

        groupCollection: Group,
        
        model: Resource,
        model_name: 'booking.resource',
        
        item_ids: [],
        
        initialize: function(models, options){
            _super.initialize.apply(this, arguments);
        
            this.daterange = options.period;
            this.chart = options.chart;
            this.items = options.items;
            
            this.bind();
        },
        
        bind: function(){
        	this.listenTo(this.daterange, 'change:added_start change:added_end reset', this.fetch);
            this.listenTo(this.items, 'sync', this.loadPage);
            this.listenTo(this.items, 'group:sync', this.loadGroup);
            this.listenTo(this, 'invalid', this.modelError);
            this.listenTo(this, 'reset sync', this.updateItemsHeight);
        },
        
        unbind: function(){
            this.stopListening();
        },
        
        updateItemsHeight: function(){
            _(this.groupLengths()).each(function(height, item_id){
                var item = this.items.getInGroup(item_id);
                if(item) {
                    item.set('height', height);
                }
            }, this);
        },
                
        loadPage: function(){
            var ids = [];
            
            this.reset();
            this.daterange.addedFull();
            
            this.items.each(function(item){
                ids.push(item.get('id'));
            });
            
            this.item_ids = ids;
            return this.fetch();
        },
        
        loadGroup: function(query, group){
            var ids = [];
            
            this.daterange.addedFull();
            
            group.each(function(item){
                ids.push(item.get('id'));    
            });
                
            this.item_ids = ids.concat(this.item_ids);
            return this.fetch();
        },
        
        search: function(){
            var period_start = this.daterange.get('added_start').format('YYYY-MM-DD'),
                period_end = this.daterange.get('added_end').format('YYYY-MM-DD');
            
            var search = {
                remove: false,
                filter: [
                    [ 'resource_id', 'in', this.item_ids ],
                    [ 'chart.id', '=', this.chart.get('id') ],
                    '&', [ 'date_start', '<=',  period_end ], [ 'date_end', '>=',  period_start ],
                ]
            };
            return search;
        },
        
        modelError: function(model, error, options){
            throw options.validationError || error;
        }
    });

    booking.collections('Resources', Resources);

});