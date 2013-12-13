openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var Model = Backbone.Model,
        Collection = Backbone.Collection;
    
    var ItemView = Backbone.Marionette.ItemView,
        _superItem = ItemView.prototype;
        
    var CompositeView = Backbone.Marionette.CompositeView,
        _superComposite = CompositeView.prototype;
    
    var CollectionView = Backbone.Marionette.CollectionView,
        _superCollection = CollectionView.prototype;
    
    /*
     * Item
     */
        
    var Item = ItemView.extend({
        template: 'Booking.Calendar.items.item',
        
        className: 'item-label',
        
        attributes: function(){
            return {
                id: 'item_' + this.model.get('id'),
                'item-id': this.model.get('id'),
                model: this.model.collection.model_name
            };
        },
        
        ui: {
            caret: '.icon-caret-right'
        },
        
        events: {
            'click a': 'openForm',
            'click .toggle-rows': 'toggle'
        },
        
        modelEvents: {
            'change:height': 'heightChanged',
            'change:open': 'openChanged',
        },

        serializeData: function(){
            return {
                'title': this.model.title()
            };
        },
        
        openChanged: function(){
            this.model.isOpen() ? this.openItem() : this.closeItem();    
        },
        
        heightChanged: function(){
            if(this.model.get('height') > 1){
                this.$el.addClass('multi');
            }
            else {
                this.$el.removeClass('multi');
            }
            if(this.model.isOpen()){
                this.openItem();
            }
        },
        
        openItem: function(){
            var height = this.model.get('height');
            this.$el.addClass('open')
                    .css('height', (height + 1) * 24 + 'px');
        },
        
        closeItem: function(){
            this.$el.removeClass('open')
                    .css('height', '23px');
        },
        
        toggle: function(){
            this.model.toggle();
        }, 
        
        openForm: function(e){
            e.preventDefault();
            
            var $el = $(e.currentTarget), 
                $item = $el.closest('.item-label');
                
            booking.trigger('open:record', $item.attr('model'), parseInt($item.attr('item-id')));
        }
    });
    
   
    /*
     * Grouped Items
     */
    
    var GroupedItems = CompositeView.extend({
        
        template: 'Booking.Calendar.items.grouped',
        
        className: 'item-group',
        
        itemView: Item,
        
        itemViewContainer: '.grouped-items',
    
        modelEvents: {
            'change:open': 'toggleItems'
        },
    
        events: {
            'click .group-name': 'toggleGroup'
        },
        
        ui: {
            items: '.grouped-items',
            title: '.group-name'
        },
        
        initialize: function(){
            this.collection = this.model.group;
        },
        
        toggleGroup: function(e){
            e.preventDefault();
            var promise = null, model = this.model;
            if(model.isNew()){
                promise = model.fetch();    
            }
            $.when(promise).done(function(){
                model.isOpen() ? model.close() : model.open();
            });
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
     * Items list
     */
        
    var Items = CompositeView.extend({
        
        template: 'Booking.Calendar.items',
        
        getItemView: function(){
            return this.collection.grouped() ? GroupedItems : Item;     
        },
        
        itemViewContainer: '.items',
        
        serializeData: function(){
            return {
                title: this.collection.title()
            };
        }
    });
    
    booking.views('Items', Items);
});