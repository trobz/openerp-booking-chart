openerp.unleashed.module('booking_chart', function(booking, _, Backbone){
    
    var _super = Backbone.Model.prototype;
    
    var default_start = moment().subtract(1, 'months').format('YYYY-MM'),
        default_end = moment().add(2, 'months').format('YYYY-MM'),
        default_scroll = (moment().subtract(7, 'days').diff(moment(default_start), 'days') * 24);
    
    
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
        
        link: function(models, collections, views){
            this.models = models;
            this.collections = collections;
            this.views = views;
        },
        
        bind: function(){
            this.collections.items.on('change', this.pagerChanged, this);
            this.models.period.on('change', this.periodChanged, this);
            this.views.calendar.on('scroll', this.scrollChanged, this);
        },
        
        unbind: function(){
            this.collections.items.off(null, null, this);
            this.models.period.off(null, null, this);
        },
        
        
        /* processing */
        process: function(){
            return $.when(
                this.configPager(this.get('page'), this.get('limit')),
                this.configPeriod(this.get('period_start'), this.get('period_end')),
                this.configScroll(this.get('scroll')),
                this.bind()    
            );
        },
        
        configPager: function(page, limit){
            var items = this.collections.items, defaults = this.defaults, self = this, def = $.Deferred();
            
            page = $.isNumeric(page) ? parseInt(page) : defaults.page;
            limit = $.isNumeric(limit) ? parseInt(limit) : limit;
            
            items.ready.done(function(){
                items.pager.limit = limit <= items.pager.total && ! _.isString(limit) ? limit : (_.isString(limit) ? items.pager.total : defaults.limit);
                items.refresh();
                items.pager.page = page < items.pager.nb_pages ? page : defaults.page;
                items.update().done(function(){
                    def.resolve();        
                });
                
                self.set({
                    page: items.pager.page,
                    limit: items.pager.limit
                });
            });
            
            return def.promise();
        },
        
        configPeriod: function(start, end){
            var period = this.models.period,
                defaults = this.defaults,
                start = moment(start),
                end = moment(end);
           
            if(start && end && start.isValid() && end.isValid() && start < end){
                period.set({ start: start, end: end }, {silent: true});
            }
            else {
                period.set({ start: moment(defaults.period_start), end: moment(defaults.period_end) }, {silent: true});
                this.set({
                    period_start: defaults.period_start,
                    period_end: defaults.period_end
                });
            }
            
            period.setDefaults(moment(defaults.period_start), moment(defaults.period_end));
        },
        
        configScroll: function(scroll){
            this.views.calendar.setScrolling(scroll, this.defaults.scroll);
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
                period_start: period.start().format('YYYY-MM'),
                period_end: period.end().format('YYYY-MM')
            }); 
        },
        
        scrollChanged: function(scroll){
            this.set({
                scroll: parseInt(scroll)
            }); 
        },
        
        destroy: function(){
            this.unbind();
            _super.destroy.apply(this, arguments);
        }
        
    });

    booking.models('State', State);

});