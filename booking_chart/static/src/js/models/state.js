openerp.unleashed.module('booking_chart', function(booking, _, Backbone){

    /**
     * TOTO:
     * The purpose for this object is to maintain the state for the booking chart
     * if the user refresh the booking chart, user will be able to view the same period
     * and the same scrolling position after that, everything is put in the URL...
     * ----------------------------------------------------------
     * auto-managed by the view loading process from unleashed view
     *
     * Manage by marionette
     * */


    var State = Backbone.Model.extend({

        date_format: 'YYYY-MM-DD',

        defaults: {
            action: null,
            menu_id: null,
            model: null,
            view_type: null,

            limit: 100,
            page: 0,

            // config default state for the booking chart
            period_start: null,
            period_end: null,
            scroll: null
        },

        link: function(options){
            this.chart = options.chart;
            this.period = options.period;
            this.calendar = options.calendar;
        },

        process: function(){
            return $.when(
                this.configPager(this.get('page'), this.get('limit')),
                this.configPeriod(this.get('period_start'), this.get('period_end')),
                this.configScroll(this.get('scroll')),
                this.bind()
            );
        },

        getPeriodDefaults: function(){
            var default_start = moment().subtract(1, 'months').startOf('month').format(this.date_format),
                default_end = moment().add(2, 'months').endOf('month').format(this.date_format),
                default_scroll = moment().subtract(7, 'days').diff(moment(default_start), 'days');


            if(this.period.get("base") === "hours"){
                default_start = moment().subtract(3, 'days').format(this.date_format);
                default_end = moment().add(3, 'days').format(this.date_format);
                default_scroll = this.period.rescDuration(
                    moment(default_start), moment().subtract(4, 'hours')
                ) / 15;
            }

            return {
                start: default_start,
                end: default_end,
                scroll: default_scroll
            };
        },

        configPager: function(page, limit){
            var items = this.chart.items,
                defaults = this.defaults;

            page = $.isNumeric(page) ? parseInt(page) : defaults.page;
            limit = $.isNumeric(limit) ? parseInt(limit) : defaults.limit;

            items.pager.limit = limit;
            var promise = items.init(), state = this;

            promise.done(function(){
                items.pager.page = page < items.pager.nb_pages ? page : defaults.page;
                state.set({
                    page: items.pager.page,
                    limit: items.pager.limit
                });
            });

            return promise;
        },

        configPeriod: function(start, end){
            var period = this.period,
                defaults = this.getPeriodDefaults();

            this.set({
                period_start: start || defaults.start,
                period_end: end || defaults.end
            });

            period.set({
                start: moment(start || defaults.start),
                end: moment(end || defaults.end)
            }, {silent: true});


        },

        configScroll: function(scroll){
            var defaults = this.getPeriodDefaults();


            this.period.set({
                scroll: scroll || defaults.scroll
            }, { silent: true });
        },

        bind: function(){
            this.listenTo(
                this.chart.items, 'change:limit change:count change:next change:previous change:first change:last', this.pagerChanged
            );
            this.listenTo(
                this.period, 'change:start change:end', this.periodChanged
            );
            this.listenTo(
                this.period, 'change:scroll', this.scrollChanged
            );
        },

        /* models/collections events */
        pagerChanged: function(items, pager){
            this.set({
                page: pager.page,
                limit: pager.limit
            });
        },

        periodChanged: function(period){
            this.set({
                period_start: period.get('start').format(this.date_format),
                period_end: period.get('end').format(this.date_format)
            });
        },

        scrollChanged: function(){
            this.set({
                scroll: this.period.get('scroll')
            });
        }
    });

    booking.models('State', State);
});