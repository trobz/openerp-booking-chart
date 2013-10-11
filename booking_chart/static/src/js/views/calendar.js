openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){

    var BaseView = base.views('BaseView'),
        _super = BaseView.prototype;
    var Calendar = BaseView.extend({

        className:  'booking-chart-calendar',

        events: {
            'click .booking-chart-zoom a' : 'zoom',
            'click .group-name': 'toggleGroup',
            'click .items a': 'openItemForm',
            'click .calendar-button-plus': 'toggleOpenGroup',
            'click .calendar-button-minus': 'toggleOpenGroup'
        },
        initialize: function(models, options){
            _super.initialize.apply(this, arguments);

            this.loading = false;
            this.isSelectedDateRange = false

            this.ready.done(function(){
                this.$items = this.$el.find('.booking-chart-items');
                this.$dates = this.$el.find('.booking-chart-dates');

            });
            /*
            * listen to keypress
            * */
            $(document).on('keydown', this.keypress);
        },

        bind: function(){
            this.collection.on('sync', this.render, this);
            this.ref.period.on('previous', this.refreshPreviousMonth, this);
            this.ref.period.on('next', this.refreshNextMonth, this);
            this.ref.period.on('dateRangePicker', this.render, this);
            this.ref.period.on('change:start change:end', this.updateDateRange, this);
        },

        unbind: function(){
            this.collection.off(null, null, this);
            this.ref.period.off(null, null, this);
        },

        /* shortcut to get elements */

        getItemElements: function(item_id){
            return this.$dates.find('.calendar-resources-container[item-id="' + item_id + '"]');
        },

        getItemLabel: function(item_id){
            return this.$items.find('#item_' + item_id + '.item-label');
        },

        /* UI event handlers */

        openItemForm: function(e){
            e.preventDefault();
            var $el = $(e.currentTarget), $item = $el.closest('.item-label');
            this.trigger('action:open-record', $item.attr('model'), parseInt($item.attr('item-id')));
        },

        previousMonth: function(oe_pager_value){
            if(!this.loading){
                this.loading = true;
                this.ref.period.previousMonth();
            }
        },

        nextMonth: function(){
            if(!this.loading){
                this.loading = true;
                this.ref.period.nextMonth();
            }
        },

        toggleGroup: function(e){
            e.preventDefault();
            var $name = $(e.currentTarget),
                $group = $name.next(),
                name = $group.attr('group-name'),
                $resources_group = this.$dates.find('.resources-group[group-name="' + name + '"]');

            if($group.is(':visible')){
                $group.hide();
                $resources_group.hide();
                $name.find('i').attr('class', 'icon-caret-right');
            }
            else {
                $group.show();
                $resources_group.show();
                $name.find('i').attr('class', 'icon-caret-down');
            }
        },

        toggleOpenGroup: function(e){
               var $el = $(e.currentTarget),
                $container = $el.parent(),
                item_id = $container.attr('item-id'),
                $items = this.getItemElements(item_id),
                $label = this.getItemLabel(item_id),
                height = (parseInt($label.attr('size')) + 1) * 24;

            if(!$label.hasClass('open')){
                $items.find('.resource-group-detail').show();
               /*
               * show minus hide plus button
               * */
                $container.find('.icon-plus-sign-alt').hide();
                $container.find('.icon-minus-sign-alt').show();
                $items.find('.icon-minus-sign-alt').show();
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
                /*
                * show plus hide minus button
                * */
                $items.find('.icon-minus-sign-alt').hide();
                $items.find('.icon-plus-sign-alt').show();
                $items.find('.logo_of_group').show();
                $container.find('.icon-plus-sign-alt').show();
                $container.find('.icon-minus-sign-alt').hide();

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

        today: function(e){
            /*
            * check zooming
            * */
            var zoom_mode = this.$(".booking-chart-zoom .active").text();
            var date_to_scroll = moment().subtract('days', 3);
            switch (zoom_mode)
            {
              case 'XS': date_to_scroll = moment().subtract('days', 12);
                                break;
              case 'S': date_to_scroll = moment().subtract('days', 7);
                                break;
              case 'M': date_to_scroll = moment().subtract('days', 7);
                                break;
              case 'L': date_to_scroll = moment().subtract('days', 7);
                                break;
              case 'XL': date_to_scroll = moment().subtract('days', 3);
                                break;
            }
            var today = "#" + date_to_scroll.format('YYYY-MM-DD');
            this.$dates.mCustomScrollbar("scrollTo", today);
        },

        freeze: function(){
            if(!this.loading){
                this.loading = 'freeze'
                this.$el.find('.btn_freeze').text('Unfreeze');
                this.$el.addClass('freeze');
            }
            else{
                this.loading = null
                this.$el.find('.btn_freeze').text('Freeze');
                this.$el.removeClass('freeze');
            }

        },

        updateDateRange: function(){
            $("#date_picker_from").val(moment(this.ref.period.start()).format('MMMM YYYY'))
            $("#date_picker_to").val(moment(this.ref.period.end()).subtract('months', 1).format('MMMM YYYY'))
            this.$dates = this.$el.find('.booking-chart-dates');
            var $scroll = this.$dates.find('.mCSB_container');
            if(this.isSelectedDateRange)
                $scroll.css({
                    width: (this.ref.period.duration() - 1) + 'em'
                });
        },


        show_month: function ($scroll, $zoom_mode) {
            if (!this.isSelectedDateRange){
                $month_name = $scroll.find(".calendar-month");
                $month_l_size = $month_name.find('.month-l-size')
                $month_xl_size = $month_name.find('.month-xl-size');
                $month_normal_size = $month_name.find('.month-normal-size');
                switch ($zoom_mode) {
                    case 'L':
                        $month_l_size.show();
                        $month_xl_size.hide();
                        $month_normal_size.hide();
                        break;
                    case 'XL':
                        $month_xl_size.show();
                        $month_l_size.hide();
                        $month_normal_size.hide();
                        break;
                    default :
                        $month_l_size.hide();
                        $month_normal_size.show();
                        $month_xl_size.hide();
                }
            }
        },

        zoom: function(e){
            e.preventDefault();

            var $zoom = $(e.currentTarget),
                $el = this.$el,
                $dates = this.$dates,
                $parent = $zoom.parent(),
                $scroll = $dates.find('.mCSB_container'),
                classname = $zoom.attr('class');
            /* Show Month*/
            this.show_month($scroll, $parent.text())

            var zooming = function(){
                if(!$parent.hasClass('active') && ! $el.hasClass(classname)){

                    var $scroll = $dates.find('.mCSB_container'),
                        font_size_before = parseInt($el.css('fontSize').replace('px', '')),
                        left_position = parseInt($scroll.css('left').replace('px', '')),
                        left_em = left_position / font_size_before;

                    $el.attr('class', 'booking-chart-calendar ' + classname);
                    $('li', $parent.parent()).removeClass('active');
                    $parent.addClass('active');
                    var font_size_after = parseInt($el.css('fontSize').replace('px', ''));

                    $scroll.css('left', font_size_after * left_em);
                    $dates.mCustomScrollbar('update');
                }
            };

            var months_count = this.ref.period.monthsCount();

            // go XS or S, should load more months first...
            if(/\-xs/.test(classname) && months_count < 6 ){

                this.loading = true;

                var start = moment(this.ref.period.end()),
                    end = this.ref.period.end().add(6 - months_count, 'months');

                this.ref.period.set({
                    end: moment(end),
                    added_start: start,
                    added_end: moment(end),
                });
                this.refreshNextMonth();
            }
            else if(/\-s/.test(classname) && months_count < 4 ){

                this.loading = true;

                var start = moment(this.ref.period.end()),
                    end = this.ref.period.end().add(4 - months_count, 'months');

                this.ref.period.set({
                    end: moment(end),
                    added_start: start,
                    added_end: moment(end),
                });
                this.refreshNextMonth();
            }
            zooming();
        },

        /* UI config */

        setScrolling: function(scroll){
            this._scroll = scroll || 0;
        },
        /*
        *  Key Press Left And Right
        * */
        keypress: function (e) {
            $("#content_chart").hover(function () {
                $(document).data({"keyboard-input": "enabled"});
                $(this).addClass("keyboard-input");
            }, function () {
                $(document).data({"keyboard-input": "disabled"});
                $(this).removeClass("keyboard-input");
            });
            if ($(this).data("keyboard-input") === "enabled") {
                var activeElem = $(".keyboard-input"),
                    activeElemPos = Math.abs($(".keyboard-input .mCSB_container").position().left),
                    pixelsToScroll = 100;
                if (e.which === 37) { //scroll up
                    e.preventDefault();
                    activeElem.mCustomScrollbar("scrollTo", (activeElemPos - pixelsToScroll), {scrollEasing: "easeOutCirc"});
                } else if (e.which === 39) { //scroll down
                    e.preventDefault();
                    activeElem.mCustomScrollbar("scrollTo", (activeElemPos + pixelsToScroll), {scrollInertia: 400, scrollEasing: "easeOutCirc"});
                }
            }
            if(e.which === 38){
                e.preventDefault();
                var y = $(window).scrollTop();  //your current y position on the page
                $(window).scrollTop(y-150);
            }
            if (e.which === 40){
                e.preventDefault();
                var y = $(window).scrollTop();  //your current y position on the page
                $(window).scrollTop(y+150);
            }
        },
        /* renders */

        refreshNextMonth: function(){
            var $scroll = this.$dates.find('.mCSB_container');
            var $el = $(this.htmlDates(this.ref.period.diffAdded()));
            $el.hide();
            $scroll.append($el);

            $scroll.css({
                width: (this.ref.period.duration()-1) + 'em'
            });

            this.setupElements($el, $scroll);

            this.loading = false;
            this.trigger('displayed');
            var zoom_mode = this.$(".booking-chart-zoom .active").text();
            this.show_month($scroll, zoom_mode);
        },

        refreshPreviousMonth: function(){
            var $scroll = this.$dates.find('.mCSB_container');
            var $el = $(this.htmlDates(this.ref.period.diffAdded()));

            $el.hide();
            $scroll.prepend($el);

            $scroll.css({
                width: (this.ref.period.duration() - 1) + 'em',
                left: - ($el.outerWidth(true))
            });

            this.setupElements($el, $scroll);

            this.loading = false;
            this.trigger('displayed');
            var zoom_mode = this.$(".booking-chart-zoom .active").text();
            this.show_month($scroll, zoom_mode);
        },

        setupElements: function($el, $scroll){
            var self = this;

            var $labelOpen = this.$items.find('.open');
            $labelOpen.each(function(index, label){
                var $label = $(label), size = $label.attr('size'), item_id = $label.attr('item-id');
                var $items = self.getItemElements(item_id);
                $items.each(function(index, item){
                    var $item = $(item);
                    $item.css({
                        height: (parseInt(size) + 1) + 'em'
                    });
                    $item.addClass('open');
                });
            });

            var $groupOpen = this.$items.find('.item-group:visible');
            $groupOpen.each(function(index, group){
                var $group = $(group), group_name = $group.attr('group-name');
                var $items = self.$dates.find('.resources-group[group-name="' + group_name + '"]');
                $items.each(function(index, item){
                    var $item = $(item);
                    $item.show();
                });
            });

            $el.show();
            this.$dates.mCustomScrollbar('update');
        },

        scrollDone: function(metric){
            this.trigger('scroll', Math.abs(metric.left));
        },

        /* render parts */

        render: function(){
            this.ready.done(function(){
                this.renderItems()
                    .renderCalendar();
            });
            return this;
        },

        renderCalendar: function(){
            this.$dates.html(this.htmlDates(this.ref.period.diffCurrent()));
            this.$dates.mCustomScrollbar({
                horizontalScroll:true,
                autoDraggerLength: true,
                theme: 'dark-thick',
                callbacks: {
                    onTotalScroll: $.proxy(this.nextMonth, this),
                    onTotalScrollBack: $.proxy(this.previousMonth, this),
                    onScroll: $.proxy(this.scrollDone, this)
                }
            });
            if(this._scroll){
                var $scroll = this.$dates.find('.mCSB_container');
                $scroll.css({
                    left: - (this._scroll)
                });
                $scroll.css({
                    width: (this.ref.period.duration() - 1) + 'em'
                });
                this.$dates.mCustomScrollbar('update');
            }
            return this;
        },

        renderItems: function(){
            this.$items.html(this.htmlItems());
            var height = this.$items.find('.items').outerHeight(true);
            this.trigger('displayed');
            return this;
        },

        htmlItems: function(){
            var items = this.ref.display.render('Booking.Calendar.items', {
                items: this.collection,
                info: this.collection.info(),
                previous: this.collection.hasPrevious(),
                next: this.collection.hasNext(),
            });

            return items;
        },

        htmlDates: function(diff){
            var calendar = this.ref.display.render('Booking.Calendar.dates', {
                items: this.collection,
                period: this.ref.period,
                details: diff
            });

            return calendar;
        },

        destroy: function(){
            this.first_day_element = null;
            this.last_day_element = null;

            if(this.$dates){
                this.$dates.mCustomScrollbar("destroy");
            }
            _super.destroy.apply(this, arguments);
        }
    });

    booking.views('Calendar', Calendar);

});