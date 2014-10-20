openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){

    var View = Backbone.Marionette.ItemView,
        _super = View.prototype;
        
    var Graph = View.extend({
        
        template: 'Booking.Graph',
        
        ui: {},
        
        events: {
            'click .resource-group-bar.multi': 'toggle',
            'click .resource-group-bar.single': 'openTargetForm',
            'click .resource-group-element': 'openTargetForm'
        },
        
        collectionEvents: {
            'sync': 'render'
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

	            var timelapse = moment(group.period().start()).startOf('month');

	            if(this.period.get('base') === 'hours'){

		            // get working date on the group
		            var working_date = this.$workingDate(group);

		            // TODO: start moment should be 'start' of the working date instead of first date of a month
					timelapse = moment(group.period().start()).hour(working_date.start).minute(0).second(0);
	            }

	            var $target = this.$target(group, timelapse);

                if($target.length == 0){
                    timelapse = this.period.start();
                    $target = this.$target(group, timelapse);
                }
                
                if(!group.status.created && group.status.updated){
                    this.$group(group.options.index).remove();
                }
                
                var $html = this.$renderGroup(group, timelapse);
                
                $target.append($html);

                $target.find('.resource-group-element, .resource-group-bar').each(function(index, el){
                    var $el = $(el), html = $el.find('.tooltip-info').html();
                    $el.tooltip({title:  html});
                });
                
            }, this);
        },
        
        /*
         * DOM Element getter
         */
	    $workingDate: function(group){

		    var working_dates = this.period.get('working_date'),
			    group_date = group.period().start().format('dddd').toLowerCase();

		    return _.find(working_dates, function(date){
			    return date.name === group_date;
		    })
	    },

        // TODO: render resource with specific 'left'
        $renderGroup: function(group, timelapse){
            if(this.period.get('base') === 'hours'){

	            // FIXME: remove .add(7, 'hour') because of timezone issue
	            // from 09:00:00 to 09:15:00 = 1em => 1m = 1/15
	            var diff = Math.round(group.period().start().diff(timelapse, 'minutes', true)) * (1 / 15);

                var $el = $(base.render(this.template, {group: group })).css({
                    left: diff + 'em'
                });

                return $el;
            }
            return $(base.render(this.template, {group: group })).css({
                left: Math.round(group.period().start().diff(timelapse, 'days', true)) + 'em'
            });
        },
        
        $rows: function(item_id){
            return this.$el.find('.resources-container[item-id="' + item_id + '"] ');
        },

        // TODO: finding container to inject resource
        $target: function(group, timelapse){
            if(this.period.get('base') === 'hours'){
                return this.$el.find('#day-' + timelapse.format('YYYY-MM-DD') + ' .resources-container[item-id="' + group.resource_id() + '"]');
            }
            else {
                return this.$el.find('#month-' + timelapse.format('YYYY-MM') + ' .resources-container[item-id="' + group.resource_id() + '"]');
            }
        },

        $group: function(index){
            return this.$el.find('[group-index="' + index + '"]');
        },
        
        $label: function(item_id){
            // implement this
        }
    });     

    booking.views('Graph', Graph);
});