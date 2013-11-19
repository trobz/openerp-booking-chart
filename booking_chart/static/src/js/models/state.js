openerp.unleashed.module('booking_chart', function(booking, _, Backbone){
    
    var _super = Backbone.Model.prototype;
    
    var default_start = moment().subtract(1, 'months').format('YYYY-MM'),
        default_end = moment().add(2, 'months').format('YYYY-MM'),
        default_scroll = moment().subtract(7, 'days').diff(moment(default_start), 'days');
    
    var State = Backbone.Model.extend({
        
        defaults: {
            action: null,
            menu_id: null,
            model: null,
            view_type: null,
            
            period_start: default_start,
            period_end: default_end,
        
            //scroll 7 days before the current time by default
            scroll: default_scroll,
                 
            limit: 100,
            page: 0
        },
        
        link: function(options){
            this.chart = options.chart;
            this.period = options.period;
            this.calendar = options.calendar;
        },
        
        bind: function(){
            this.listenTo(this.chart.items, 'change:limit change:count change:next change:previous change:first change:last', this.pagerChanged);
            this.listenTo(this.period, 'change:start change:end', this.periodChanged);
            this.listenTo(this.period, 'change:scroll', this.scrollChanged);
        },
        
        process: function(){
            return $.when(
                this.configPager(this.get('page'), this.get('limit')),
                this.configPeriod(this.get('period_start'), this.get('period_end')),
                this.configScroll(this.get('scroll')),
                this.bind()    
            );
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
                defaults = this.defaults,
                start = moment(start),
                end = moment(end);
           
            if(start && end && start.isValid() && end.isValid() && start < end){
                period.set({ 
                    start: start, 
                    end: end 
                }, {silent: true});
            }
            else {
                period.set({ 
                    start: moment(defaults.period_start), 
                    end: moment(defaults.period_end) }, 
                    {silent: true}
                );
            
                this.set({
                    period_start: defaults.period_start,
                    period_end: defaults.period_end
                });
            }
        },
        
        configScroll: function(scroll){
            this.period.set({ 
                scroll: scroll 
            }, { silent: true });
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
                period_start: period.get('start').format('YYYY-MM'),
                period_end: period.get('end').format('YYYY-MM')
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