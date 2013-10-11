openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var BaseView = base.views('BaseView'),
        _super = BaseView.prototype;

    var Graph = BaseView.extend({
        
        className:  'booking-chart-resources',
        
        events: {
        },
        
        bind: function(){
            this.collection.on('sync', this.renderResources, this);
            this.ref.items.on('sync', this.clearResources, this);
            
            //FIXME: elements are moved inside the calendar, click event are catched on the main div..
            $(".resource-group-bar").tipTip({maxWidth: "auto", edgeOffset: 10});
            $('.oe_view_manager_view_booking').on('click', '.resource-group-bar.multi', $.proxy(this.openGroup, this));
            $('.oe_view_manager_view_booking').on('click', '.resource-group-element, .resource-group-bar.single', $.proxy(this.openOriginForm, this));

        },
        /*snippet_function: function(){

            this.collection.each(function(item){
                console.log(item.get("id") + " "+ item.get("name") + JSON.stringify(item));

            });
        },*/
        unbind: function(){
            this.collection.off(null, null, this);
            this.ref.items.off(null, null, this);
            $('.oe_view_manager_view_booking').off('click', '.resource-group-bar.multi');
        },
        
        // UI events
        
        openOriginForm: function(e){
            e.preventDefault();
            var $el = $(e.currentTarget), $res = $el.is('.resource-group-element') ? $el : $el.next().find('.resource-group-element');
            this.trigger('action:open-record', $res.attr('origin-model'), parseInt($res.attr('origin-id')));
        },

        openGroup: function(e){
            var $el = $(e.currentTarget),
                $container = $el.parent(),
                item_id = $container.attr('item-id'),
                $items = this.ref.calendar.getItemElements(item_id),
                $label = this.ref.calendar.getItemLabel(item_id),
                group = this.collection.group($container.attr('group-index')),
                height = (parseInt($label.attr('size')) + 1) * 24,
                _id="#item_"+item_id;

            if(!$label.hasClass('open')){
                $items.find('.resource-group-detail').show();
               /*
               * show minus hide plus button
               * */
                $items.find('.icon-plus-sign-alt').hide();
                $items.find('.icon-minus-sign-alt').show();
                $(_id).find('.icon-minus-sign-alt').show();
                $items.find('.logo_of_group').hide();
                if($items.height() < height) {
                    $items.css({
                        height: height
                    });

                    $label.css({
                        height: height
                    });
                }

                $items.addClass('open');
                $label.addClass('open');
                $container.addClass('open');
            }
            else {
                $items.find('.resource-group-detail').hide();
                $items.find('.icon-minus-sign-alt').hide();
                $items.find('.icon-plus-sign-alt').show();
                /*
                * show plus hide minus button
                * */

                $(_id).find('.icon-plus-sign-alt').show();
                $items.find('.logo_of_group').show();
                $(_id).find('.icon-minus-sign-alt').hide();

                $items.css({
                    height: 24
                });
                
                $label.css({
                    height: 24
                });
                
                $items.removeClass('open'); 
                $label.removeClass('open'); 
                $container.removeClass('open');
            }
        },
        
        
        // render
        
        clearResources: function(){
            this.ref.calendar.$dates.find('.resource-group').remove();
        },
        
        renderResources: function(){
            this.ready.done(function(){
                var groups = this.collection.groupChanged();
                
                var html = this.ref.display.render('Booking.Graph.resources', {
                    groups: groups,
                    constants: booking.constants
                });
                
                this.$el.html(html);
                
                this.placeResources();
            });
            return this;
        },
        
        placeResources: function(){
            var calendar = this.ref.calendar,
                $el = this.$el,
                period = this.ref.period;
            
            
            _.each(this.collection.groupRemoved(), function(index){
                var chart = calendar.$dates.find('.resource-group[group-index="' + index + '"]');
                chart.remove();
            });
            
            _.each(this.collection.groupChanged(), function(group){
                
                var el = $el.find('.resource-group[group-index="' + group.options.index + '"]');
                
                if(el.length > 0){
                    var resource_start = group.period().start(),
                        month_str = resource_start.format('YYYY-MM'),
                        month = moment(month_str),

                        $target = calendar.$el.find('#month-' + month_str + ' .calendar-resources-container[item-id="' + group.resource_id + '"]'),
                        left = 0;
                    
                    if($target.length <= 0){
                        month_str = period.start().format('YYYY-MM');
                        month = moment(month_str);
                        $target = calendar.$el.find('#month-' + month_str + ' .calendar-resources-container[item-id="' + group.resource_id + '"]');
                    }
                    
                    if(!group.status.created && group.status.updated){
                        var prev_el = calendar.$dates.find('.resource-group[group-index="' + group.options.index + '"]');
                        prev_el.remove();
                    }
                    el.css({
                        left: Math.round(resource_start.diff(month, 'days', true)) + 'em'
                    });
                    $target.append(el);
                    
                    el.removeClass('hidden');
                }    
            });
            
            _.each(this.collection.groupLengths(), function(length, resource_id){
                var $label = calendar.getItemLabel(resource_id);
                var $items = calendar.getItemElements(resource_id).filter('.open');
                
                $label.attr('size', length);
                
                $label.filter('.open').css({
                    height: ((parseInt(length) + 1) * 24 ) 
                });
                $items.css({
                    height: ((parseInt(length) + 1) * 24 ) 
                });
            
                $items.find('.resource-group-detail').show();
            }, this);
            
        },
        
        render: function(){
            return this;
        }
    });

    booking.views('Graph', Graph);

});