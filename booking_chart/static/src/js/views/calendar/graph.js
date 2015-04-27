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

                var hour_booking = this.period.get('base') === 'hours';

                if(hour_booking){

                    // get working date on the group
                    var group_start = group.period().start();
                    var working_date = this.period.workingDay(group_start);

                    // start moment should be 'start' of the working date instead of first date of a month
                    timelapse = moment(group.period().start()).hour(working_date.start).minute(0).second(0);
                }

                // place where we inject the resource inside
                var $target = this.$target(group, timelapse);

                // if this is true => start of global period is after start of resource (for hours booking)
                var start_in_past = false;

                // if no group found, the resource must start from few days ago
                // and the start of the resource is before the start of global period
                if($target.length == 0){

                    // set flag to true to change the diff (left)
                    start_in_past = hour_booking && $target.length == 0;

                    // then the start must be the start of global period
                    timelapse = this.period.start();

                    $target = this.$target(group, timelapse);
                }

                if(!group.status.created && group.status.updated){
                    this.$group(group.options.index).remove();
                }

                var $html = this.$renderGroup(group, timelapse, start_in_past);

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
        // render resource with specific 'left'
        $renderGroup: function(group, timelapse, start_in_past){

            var group_start = group.period().start().clone();

            var diff =  Math.floor(group_start.diff(timelapse, 'days', true));

            if(this.period.get('base') === 'hours'){

                diff = Math.round(group_start.diff(timelapse, 'minutes', true)) * (1 / 15);

                // recalculate the left in special case: [resource start] < [global period start]
                if(start_in_past){

                    var global_period_start = this.period.start().clone();

                    var group_start_wd = this.period.workingDay(group_start),
                        group_wd_end = group_start.clone().hour(group_start_wd.end).minute(0).second(0);

                    // reset diff
                    diff = group_start.diff(group_wd_end, 'minutes')  * (1 / 15);

                    var range = group_start.twix(global_period_start);
                    var days = range.count('days') - 2;

                    _(days).times(function(){

                        // add one more day
                        var gap_day = group_start.clone().add(1, 'day'),
                            gap_day_wd = this.period.workingDay(gap_day);

                        if (gap_day_wd){
                            var gap_day_start = group_start.clone().hour(gap_day_wd.start).minute(0).second(0),
                                gap_day_end = group_start.clone().hour(gap_day_wd.end).minute(0).second(0);

                            diff += (gap_day_start.diff(gap_day_end, 'minutes')  * (1 / 15) );
                        }
                    }, this);
                }
            }

            return $(base.render(this.template, {group: group })).css({
                left: diff + 'em'
            });
        },

        $rows: function(item_id){
            return this.$el.find('.resources-container[item-id="' + item_id + '"] ');
        },

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