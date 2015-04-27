openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base) {

    var BaseModel = base.models('BaseModel'),
        _super = BaseModel.prototype;

    var Resource = BaseModel.extend({

        model_name : 'booking.resource',

        validate : function(attrs) {

            // should validate only when user use hours booking chart
            if (this.collection.daterange.get('base') === 'hours') {

                var timezone = this.collection.daterange.get('timezone');

                var attr_date_start = this.collection.options.attr_date_start,
                    attr_date_end = this.collection.options.attr_date_end;

                var resc_start = moment(attrs[attr_date_start]),
                    resc_end = moment(attrs[attr_date_end]);

                // if 'start' and 'end' in the same day, they must be different in hour or minute
                var current_wd_start = this.collection.daterange.workingDay(resc_start),
                    current_wd_end = this.collection.daterange.workingDay(resc_end);

                // id 'start' or 'end' of resource is not working day => stop
                if (!current_wd_start || !current_wd_end) {
                    throw new Error([
                        "", "+ Resource ID: " + attrs["id"] + " :: " + attrs["name"],
                        "- There is no working day defined for:: " + resc_start.format('dddd') + " or " + resc_end.format('dddd')
                    ].join('\n'));
                }

                // if the current resource exceed the range => stop this also
                if (parseInt(resc_start.format('HH')) < current_wd_start.start
                || (parseInt(resc_end.format('HH')) > current_wd_end.end)
                || (parseInt(resc_end.format('HH')) == current_wd_end.end && (parseInt(resc_end.format('m')) != 0
                || parseInt(resc_end.format('s')) != 0
                ))) {
                    throw new Error([
                        "", "+ Resource ID: " + attrs["id"] + " :: " + attrs["name"],
                        "- Exceeds the start or end of current working date:",
                        "  - current timezone: " + timezone,
                        "  - Working day starts at: " + current_wd_start.start + ":00:00 (" + current_wd_start.name + ") ends at: " + current_wd_end.end + ":00:00 (" + current_wd_end.name + ")",
                        "  - Resource starts at: " + resc_start.format('HH:mm:ss') + " ends at: " + resc_end.format('HH:mm:ss')
                    ].join('\n'));
                }
            }
        },

        set : function(key, val, options) {

            var attrs,
                attr;
            if ( typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            // convert to fixed timezone if the resource is not fetched
            // if we dont handle this case, the resource will get added by timezone
            // which causes unexpected result on the graph and the validation
            if (!this.get('fixed_timezone')) {

                // get fixed configured timezone
                var fixed_timezone = this.collection.daterange.get('timezone'),
                    by_hour = this.collection.daterange.get('base') == 'hours';

                var attr_date_start = this.collection.options.attr_date_start,
                    attr_date_end = this.collection.options.attr_date_end;

                if (attrs[attr_date_start] && attrs[attr_date_end]) {

                    // get standard input data
                    var start = moment(attrs[attr_date_start]),
                        end = moment(attrs[attr_date_end]);

                    // convert to fixed GMT timezone
                    var start_gmt = moment(start.zone(fixed_timezone)),
                        end_gmt = moment(end.zone(fixed_timezone));

                    // reset input data
                    if (by_hour) {
                        attrs[attr_date_start] = moment(start_gmt._d).format('YYYY-MM-DD HH:mm:ss');
                        attrs[attr_date_end] = moment(end_gmt._d).format('YYYY-MM-DD HH:mm:ss');
                    } else {
                        attrs[attr_date_start] = moment(start_gmt._d).startOf('day').format('YYYY-MM-DD HH:mm:ss');
                        attrs[attr_date_end] = moment(end_gmt._d).endOf('day').format('YYYY-MM-DD HH:mm:ss');
                    }

                    attrs['range'] = start.twix(end);

                    // mark this resource as converted
                    attrs['fixed_timezone'] = true;
                }

            }

            return _super.set.apply(this, [attrs, options]);
        },

        resourceWidth : function() {
            if (this.collection.daterange.get('base') === 'hours') {
                return this.duration() * (1 / 15);
            }
            return this.duration();
        },

        tooltipDateTimeFormat : function() {
            if (this.collection.daterange.get('base') === 'hours') {
                return 'ddd. (Do MMM, YYYY) HH:mm:ss';
            }
            return 'ddd. Do MMM, YYYY';
        },

        tooltipTimeDuration : function() {
            var duration = this.duration(true);
            return this.collection.daterange.humanizeDisplay(duration);
        },

        parse : function(response, options) {
            if ($.isPlainObject(response)) {
                _.each(response, function(value, key) {
                    // for reference fields, separate the model and the id
                    if (/_ref/.test(key) && _.isString(value) && /,/.test(value)) {
                        var ref = value.split(',');
                        response[key.replace(/_ref/, '_id')] = parseInt(ref[1]);
                        response[key.replace(/_ref/, '_model')] = ref[0];
                    }
                });
            }
            return response;
        },

        diff : function(date) {

            if (this.collection.daterange.get('base') === 'hours') {
                var diff = Math.round(moment(this.get('date_start')).diff(date, 'minutes', true));
                return diff * (1 / 15);
            }
            return Math.round(moment(this.get('date_start')).diff(date, 'days', true));
        },

        duration : function(refresh) {

            if (!this.nb_days || !this.nb_minutes || refresh) {
                this.refreshDiffs();
            }
            // width for separated resource of an item
            if (this.collection.daterange.get('base') === 'hours') {
                return this.minutes();
            }
            return this.nb_days;
        },

        months : function(refresh) {
            if (!this.nb_months || refresh) {
                this.refreshDiffs();
            }
            return this.nb_months;
        },

        minutes : function(refresh) {
            if (!this.nb_minutes || refresh) {
                this.refreshDiffs();
            }
            return this.nb_minutes;
        },

        refreshDiffs : function() {

            var start = this.start(),
                end = this.end();

            var minutes = this.collection.daterange.rescDuration(start, end),
                days = Math.round(end.endOf('day').diff(start.startOf('day'), 'days', true)),
                months = end.diff(start, 'months');

            this.nb_minutes = minutes;
            this.nb_months = months;
            this.nb_days = days;
        },

        start : function() {
            return moment(this.get('date_start'));
        },

        end : function() {
            return moment(this.get('date_end'));
        }
    });

    booking.models('Resource', Resource);
});