openerp.unleashed.module('booking_chart', function (booking, _, Backbone, base) {


    var BaseModel = base.models('BaseModel'),
        BaseCollection = base.collections('BaseCollection'),
        _super = BaseCollection.prototype;

    var Models = BaseCollection.extend({

        model: BaseModel,
        model_name: 'booking.resource.tag',

        initialize: function (models, options) {
            this.ready = $.Deferred();
            _super.initialize.apply(this, arguments);
        },

        update: function () {
            var self = this;
            return this.fetch(this.search())
                .done(function () {
                    self.ready.resolve();
                });
        },

        search: function () {
            return {
                filter: [
                ['id', 'in', [1]]
            ]}
        },


        bind: function () {
        },

        unbind: function () {
        }

    });

    booking.collections('Tags', Models);

});