openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var Item = booking.models('Item'),
        ItemGroup = booking.models('ItemGroup');
    
    var Pager = base.collections('Pager'),
        _super = Pager.prototype;
            
    var Items = Pager.extend({

        model: Item,
        group_model: ItemGroup,
        
        resource_domain: [],
        resource_title: 'Resource',
        
        initialize: function(models, options){
            _super.initialize.apply(this, arguments);    
            this.model_name = options.model_name;
            this.options = _.extend({
                title: 'name'
            }, options);
        },

        setOptions: function(options){
            this.options = _.extend(this.options, options);
        },
        
        domain: function(domain){
            try {
                if(domain){
                    this.resource_domain = JSON.parse(domain);    
                }
            }
            catch(e){
                throw new Error('"booking.chart.resource_domain" is not a valid JSON string: "' + domain + '"');
            }
            return this.resource_domain;
        },
        
        search: function(query){
            var search = _super.search.apply(this, arguments);
            
            var filter = _.clone(this.domain()); 
            filter = filter.concat(search.filter || []);
            
            return _.extend(search, {
                fields: [this.options.title],
                filter: filter
            }); 
        },

        comparator: function (item) {
            return item.get(this.options.title);
        },
        
        title: function(title){
            if(title){
                this.resource_title;
            }
        	return this.resource_title;
        }
    });

    booking.collections('Items', Items);

});