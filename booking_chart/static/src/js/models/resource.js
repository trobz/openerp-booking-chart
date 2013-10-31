openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
    
    var BaseModel = base.models('BaseModel'),
        _super = BaseModel.prototype;
    
    var Resource = BaseModel.extend({
        
        model_name: 'booking.resource',
        
        parse: function(response, options){
            if($.isPlainObject(response)){
                _.each(response, function(value, key){
                    // for reference fields, separate the model and the id
                    if(/_ref/.test(key) && _.isString(value) && /,/.test(value)){
                        var ref = value.split(',');
                        response[key.replace(/_ref/, '_id')] = parseInt(ref[1]);
                        response[key.replace(/_ref/, '_model')] = ref[0];
                    }
                });
            }
            return response;
        },
        
        diff: function(date){
            return Math.round(moment(this.get('date_start')).diff(date, 'days', true));
        },
        
        duration: function(refresh){
            if(!this.nb_days || refresh){
                this.refreshDiffs();
            }
            return this.nb_days;
        },
       
        months: function(refresh){
            if(!this.nb_months || refresh){
                this.refreshDiffs();
            }
            return this.nb_months;
        },
        
        start: function(){
            return moment(this.get('date_start'));
        },
        
        end: function(){
            return moment(this.get('date_end'));
        },
        
        refreshDiffs: function(){
            var start  = this.start(),
                end    = this.end(),
                days   = end.diff(start, 'days') + 1,
                months = end.diff(start, 'months');
           
           this.nb_months = months;
           this.nb_days = days;
        }
        
    });

    booking.models('Resource', Resource);

});