var ir_models = null;

/*---------------------------------------------------------
 * booking_chart
 *---------------------------------------------------------*/

openerp.unleashed.module('booking_chart').ready(function(instance, booking, _, Backbone, base) {

    var _t = instance.web._t,
        _lt = instance.web._lt,
        QWeb = instance.web.qweb;
    
    var Pager = base.views('Pager'),
        Calendar = booking.views('Calendar'),
        Graph = booking.views('Graph'),
        Toolbar = booking.views('Toolbar'),

        DateRange = booking.models('DateRange'),
        State = booking.models('State'),
        Chart = booking.models('Chart'),
        
        Models = booking.collections('Models'),
        Resources = booking.collections('Resources'),
        Items = booking.collections('Items');
    
    var irModels = new Models();
    
    ir_models = irModels;
    
    var irModelsLoaded = null;
    instance.session.on('module_loaded', this, function(){
        irModelsLoaded = irModels.update();
    });
    
    instance.web.views.add('booking', 'instance.booking_chart.BookingView');
    instance.booking_chart.BookingView = instance.web.View.extend({
        
        display_name: _lt('Booking'),
        template: "Booking",
        view_type: 'tree',
        
        defaults: {
            // records can be selected one by one
            'selectable': false,
            // list rows can be deleted
            'deletable': false,
            // whether the column headers should be displayed
            'header': false,
            // display addition button, with that label
            'addable': _lt("Create"),
            // whether the list view can be sorted, note that once a view has been
            // sorted it can not be reordered anymore
            'sortable': false,
            // whether the view rows can be reordered (via vertical drag & drop)
            'reorderable': false,
            'action_buttons': true,
            //whether the editable property of the view has to be disabled
            'disable_editable_mode': false,
        },
        
        init: function(parent, dataset, view_id, options) {
    
            this._super(parent, dataset, view_id, options);

            this.$pager = this.options.$pager;
            this.$buttons = this.options.$buttons;
            this.context = dataset.get_context();
            /*
            * Get Active Language From Context Of View
            * */
             var active_lang = this.context['__contexts']
                && this.context['__contexts'][0]
                && this.context['__contexts'][0].lang.substr(0,2)
                || 'en'
            moment.lang(active_lang)
            // get from context
            var start = false
            var end = false
            if(this.context['__contexts'].length>1){
                var keys = _.keys(this.context['__contexts'][1])
                if (keys.indexOf('start')>-1 && keys.indexOf('end')>-1){
                    start = moment(this.context['__contexts'][1].start, 'YYYY-MM-DD').date(1)
                    end = moment(this.context['__contexts'][1].end, 'YYYY-MM-DD').add('months', 1).date(1)
                }
            }

             var //models
                period = new DateRange({}, {silent: true}),
                state = new State({}, {silent: true}),
                chart = new Chart({}, {
                    context: this.context.eval(),
                    
                    ref: {
                        ir_models: irModels        
                    }
                }),
                
                //collections
                items = new Items([], {
                    silent: true,
                    
                    ranges: [2, 10, 50, 100, 200, _t("Unlimited") ],
                    
                    ref: {
                        chart: chart,
                        domain: this.dataset && this.dataset.domain || null
                    }
                }),
                resources = new Resources([], {
                    silent: true,
                    
                    attr_date_start: 'date_start',
                    attr_date_end: 'date_end',
                    attr_group_by: 'resource_id',
                    
                    ref: {
                        period: period,
                        items: items,
                        chart: chart
                    }
                }),
            
                //views
                pager = new Pager({
                    $el: this.options.$pager,
                    collection: items,
                    ref: {
                        display: QWeb,
                        period:  period
                    }
                }),
                calendar = new Calendar({
                    collection: items,
                    ref: {
                        display: QWeb,
                        period:  period
                    }
                }),
                graph = new Graph({
                    collection: resources,
                    ref: {
                        display: QWeb,
                        calendar: calendar,
                        period: period,
                        items: items
                    }
                }),

                toolbar = new Toolbar({
                    $el: this.$buttons,
                    collection: items,
                    ref: {
                        display: QWeb,
                        calendar: calendar,
                        period: period
                    }
                });

            this.models = { period: period, state: state, chart: chart };
            this.collections = { items: items, resources: resources};
            this.views = { pager: pager, calendar: calendar, graph: graph, toolbar: toolbar };

            //the state is binded to all objects by default
            state.link(this.models, this.collections, this.views);
            //setup the state
            state.set($.bbq.getState());
            // process the state when everything is ready
            var self = this;
            this.viewLoaded = $.Deferred();
            
            this.ready = $.when(this.viewLoaded);
            
            this.ready.done(function(){
                state.process().done(function(){
                    //push the current state
                    self.stateChanged();
                    self.bind();
                    if(start && end){
                        self.models.period.dateRangePicker(start, end)
                        self.views.calendar.freeze()
                    }
                });
            });
            
        },
        
        bind: function(){
            
            //bind the state changes with the URL
            this.models.state.on('change', self.stateChanged, self);
                
            _.each(this.views, function(view){
                view.on('action:open-record', this.openRecord, this);
            }, this);
            
            this.collections.items.on('change', this.itemsChanged, this);
            
        },
        
        
        itemsChanged: function(){
            this.models.period.addedFull();
        },
        
        stateChanged: function(){
            this.do_push_state(this.models.state.attributes);
        },
        
        openRecord: function(model_name, id){
            if($.isNumeric(model_name)){
                var model = irModels.get(parseInt(model_name)); 
                model_name =  model ? model.get('model') : null;
            }
            
            if(!model_name){
                throw new Error('can not open the form for id: ' + id + ', model:' + model_name);
            }
            
            this.do_action({
                type: 'ir.actions.act_window',
                res_model: model_name,
                res_id: id,
                views: [[false, 'form']],
                target: 'current',
                context: this.context.eval(),
            });
        },
        
        view_loading: function(data){
            this.fields_view = data;
           
            this.views.pager.resetElement(this.$pager);
            this.views.toolbar.resetElement(this.$buttons);

            this.views.calendar.resetElement(this.$el.find('.booking-chart-calendar'));
            this.views.graph.resetElement(this.$el.find('.booking-chart-resources'));
            
            this.viewLoaded.resolve();

            this._super(data);
        },
        
        do_search: function(domain, context, group_by) {
            if (['resolved', 'pending'].indexOf(this.collections.items.ready.state()) >= 0) {
                if(group_by && group_by.length > 0){
                    this.pager_limit = this.collections.items.pager.limit;
                    this.collections.items.pager.limit = this.collections.items.pager.total;
                }
                else if(this.pager_limit){
                    this.collections.items.pager.limit = this.pager_limit;
                }
                
                this.models.period.addedFull();
                this.collections.items.updateQuery(domain, context, group_by).load();
            }
        },
        
        /**
         * destroy all, rather twice than once...
         */
        destroy: function() {

            _(this.views).each(function(view){
                view.off();
                view.destroy();
            });
            _(this.models).each(function(model){
                model.off();
            });
            _(this.collections).each(function(collection){
                collection.off();
                collection.unbind();
            });
            _(this.collections).each(function(collection){
                collection.reset();
            });
            
            var name = null;
            for(name in this.views){
                this.views[name] = null;
            }
            for(name in this.collections){
                this.collections[name] = null;
            }
            for(name in this.models){
                this.models[name] = null;
            }
                
            this._super();
        }
    });
});