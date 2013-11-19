openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){

    var View = Backbone.Marionette.ItemView,
        _super = View.prototype;
        
    var Graph = View.extend({
        
        template: 'Booking.Graph',
        
        ui: {},
        
        events: {
            'click .resource-group-bar.multi': 'toggle',
            'click .resource-group-bar.single': 'openTargetForm',
            'click .resource-group-element': 'openTargetForm',
        },
        
        collectionEvents: {
            'sync': 'render',
        },
        
        initialize: function(options){
            this.period = options.period;
            this.items = options.items;
        },
        
        /*
         * events
         */
        
        toggle: function(e){
            e.preventDefault();
            var $el = $(e.currentTarget), 
                $main = $el.parent(),
                item = this.items.getInGroup($main.attr('item-id'));
            
            if(item) {
                item.toggle();
            }
        },
        
        openTargetForm: function(e){
            e.preventDefault();
            var $el = $(e.currentTarget),
                $resource = $el.is('.single') ? $el.next().find('.resource-group-element') : $el,
                target_model = $resource.attr('target-model'), target_id = parseInt($resource.attr('target-id'));
            
            if(target_model && target_id){
                booking.trigger('open:record', target_model, target_id);    
            }    
        },
        
        /*
         * render
         */
        
        render: function(){
            // remove group not displayed anymore
            _.each(this.collection.groupRemoved(), function(index){
                this.$group(index).remove();
            }, this); 
            
            // render each resource inside the correct calendar element
            // if there's no target (resource is starting before the first month displayed), display it
            // in the first month with a negative left position.
            _.each(this.collection.groupChanged(), function(group){
                var month = moment(group.period().start()).startOf('month'),
                    $target = this.$target(group, month);
                    
                if($target.length == 0){
                    month = this.period.start();
                    $target = this.$target(group, month);
                }
                
                if(!group.status.created && group.status.updated){
                    this.$group(group.options.index).remove();
                }
                
                var $html = this.$renderGroup(group, month);
                
                $target.append($html);
                
                $target.find('.resource-group-element, .resource-group-bar').each(function(index, el){
                    var $el = $(el), html = $el.find('.tooltip-info').html();
                    $el.tooltip({title:  html });
                });
                     
                
            }, this);
        },
        
        /*
         * DOM Element getter
         */
        
        $renderGroup: function(group, month){
            return $(base.render(this.template, {group: group })).css({
                left: Math.round(group.period().start().diff(month, 'days', true)) + 'em'
            });
        },
        
        $rows: function(item_id){
            return this.$el.find('.resources-container[item-id="' + item_id + '"] ');
        },
        
        $target: function(group, month){
            return this.$el.find('#month-' + month.format('YYYY-MM') + ' .resources-container[item-id="' + group.resource_id() + '"]');
        },
        
        $group: function(index){
            return this.$el.find('[group-index="' + index + '"]');
        },
        
        $label: function(item_id){
            
        }
    });     

    booking.views('Graph', Graph);

});