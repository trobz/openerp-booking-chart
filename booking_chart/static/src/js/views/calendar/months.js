openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var ItemView = Backbone.Marionette.ItemView,
        _superItem = ItemView.prototype;
        
    var CompositeView = Backbone.Marionette.CompositeView,
        _superComposite = CompositeView.prototype;
        
    var CollectionView = Backbone.Marionette.CollectionView,
        _superCollection = CollectionView.prototype;
    
        
    var Item = ItemView.extend({
        template: 'Base.Empty',
        
        className: 'resources-container',
        
        attributes: function(){
            return {
                'item-id': this.model.get('id')
            };
        },
        
        constructor: function(){
            return ItemView.apply(this, arguments);
        },
        
        
        modelEvents: {
            'change:height': 'setHeight',
            'change:open': 'setHeight',
        },
        
        onRender: function(){
            this.setHeight();
        },
        
        setHeight: function(){
            if(this.model.isOpen()){
                var height = this.model.get('height');
                this.$el.css('height', (height + 1) * 24 + 'px')
                        .addClass('open');
            }
            else {
                this.$el.css('height', '23px')
                        .removeClass('open');
            }
        }
    });
    
   
    /*
     * Grouped Items
     */
    
    var GroupedItems = CompositeView.extend({
        
        template: 'Booking.Calendar.months.grouped',
        
        attributes: function(){
            return {
                'class': 'resources-group' + (this.model.isOpen() ? ' open' : ''),
            };
        },
        
        itemView: Item,
        
        itemViewContainer: '.resources-grouped',
    
        modelEvents: {
            'change:open': 'toggleItems'
        },
    
        initialize: function(){
            this.collection = this.model.group;
        },
        
        toggleItems: function(){
            if(this.model.isOpen()){
                this.$el.addClass('open');
            }
            else {
                this.$el.removeClass('open');
            }
        }
    });
    
    /*
     * Month View
     */
    
    var Month = CompositeView.extend({
        template: 'Booking.Calendar.month',
    
        getItemView: function(){
            return this.collection.grouped() ? GroupedItems : Item;     
        },
        
        itemViewContainer: '.resources',
        
        serializeData: function(){
            return {
                month: this.model
            };
        }
    });
    
    /*
     * Months Collection
     */
    
    var Months = CompositeView.extend({
        template: 'Booking.Calendar.months',
    
        itemViewContainer: '.calendar-months-wrapper',
        
        itemView: Month,
        
        itemViewOptions: function(model, index) {
            return {
                model: model,
                collection: this.items
            };
        },
        
        modelEvents: {
            'change:size': 'zoom',
            'change:frozen': 'freeze',
            'scroll:today': 'scroll',
            
        },
        
        ui: {
            wrapper: '.calendar-months-wrapper',
            scroll: '.mCSB_container'
        },
        
        loading: false,
        
        
        initialize: function(options){
            this.items = options.items;
            this.collection = this.model.months;
        },
        
        appendHtml: function(collectionView, itemView, index){
            var $container = this.getItemViewContainer(collectionView);
            
            if(index == 0 && this.children.length > 1){
                $container.prepend(itemView.el);
                this.scroll(itemView.model.nbDays());
            }
            else {
                $container.append(itemView.el);
                this.scroll();
            }
            this.first_load = false;
            this.loading = false;
        },
        
        onCompositeModelRendered: function(){
            this.scrollbar({
                horizontalScroll:true,
                autoDraggerLength: true,
                theme: 'dark-thick',
                callbacks: {
                    onTotalScroll: _.bind(this.nextMonth, this),
                    onTotalScrollBack: _.bind(this.previousMonth, this),
                    onScroll: _.bind(this.scrollDone, this)
                }
            });
        
            // the scrollbar wrap the content in a new element, future collection view insertion have to be done there
            this.resetItemViewContainer();
            this.itemViewContainer = '.mCSB_container'; 
            
            // rebind UI element, to have access to the scroll bar container element
            this.bindUIElements();
        },

        onRender: function(){
            this.scroll();
            this.loading = false;
        },

        scrollSize: function(){
            return this.model.get('scroll') * this.$el.fontSize();
        },

        scrollbar: function(){
            return this.ui.wrapper.mCustomScrollbar.apply(this.ui.wrapper, arguments); 
        },
        
        nextMonth: function(){
            if(!this.loading && !this.model.isFrozen()){
                this.loading = true;
                this.model.nextMonth();
            }
        },

        previousMonth: function(){
            if(!this.loading && !this.model.isFrozen()){
                this.loading = true;
                this.model.previousMonth();
            }
        },
        
        scrollDone: function(metric){
            this.model.set('scroll', Math.round(Math.abs(metric.left / this.$el.fontSize())));
        },
        
        
        freeze: function(){
            this.$el.toggleClass('freeze');    
        },
        
        zoom: function(){
            this.$el.removeClass('zoom-xs zoom-s zoom-m zoom-l zoom-xl')
                    .addClass('zoom-' + this.model.get('size'));
            
            this.scroll();
        },
        
        scroll: function(position, animation){
            if(_.isNumber(position)){
                this.model.set('scroll', position);
            }
                
            if(animation){
                this.scrollbar("scrollTo", this.scrollSize());
            }
            else {
                this.ui.scroll.css({
                    left: - this.scrollSize(),
                    width: this.model.duration() + 'em'
                });
                this.scrollbar('update');    
            }
        } 
    });
    
    booking.views('Months', Months);
});