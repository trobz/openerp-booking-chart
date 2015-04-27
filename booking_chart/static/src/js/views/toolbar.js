openerp.unleashed.module('booking_chart', function (booking, _, Backbone, base) {

    var View = Backbone.Marionette.ItemView;

    var default_format = "MM yy";

    var Toolbar = View.extend({

        template: 'Booking.Toolbar',

        events: {
            'click .btn_show': 'show'
        },

        modelEvents: {
            'change:start': 'updateDateStart',
            'change:end': 'updateDateEnd'
        },

        ui: {
            from:   '#date_picker_from',
            to:     '#date_picker_to',
            inputs: '.rangepicker input'
        },

        serializeData: function(){

            var format = this.model.get('base') === 'hours' ? 'YYYY-MM-DD' : 'MMMM YYYY';

            return {
                from: this.model.start(),
                to: this.model.end(),
                format: format
            };
        },

        onBeforeRender: function(){
            default_format = this.model.get('base') === 'hours' ? 'yy-mm-dd' : default_format;
        },

        onRender: function () {

            // FIXME: find a better place to handle language (ie. web unleashed...)
            $.datepicker.setDefaults({
                clearText: base._t('Clear'),
                clearStatus: base._t('Erase the current date'),
                closeText: base._t('Done'),
                closeStatus: base._t('Close without change'),
                prevText: base._t('<Prev'),
                prevStatus: base._t('Show the previous month'),
                nextText: base._t('Next>'),
                nextStatus: base._t('Show the next month'),
                currentText: base._t('Today'),
                currentStatus: base._t('Show the current month'),
                monthNames: Date.CultureInfo.monthNames,
                monthNamesShort: Date.CultureInfo.abbreviatedMonthNames,
                monthStatus: base._t('Show a different month'),
                yearStatus: base._t('Show a different year'),
                weekHeader: base._t('Wk'),
                weekStatus: base._t('Week of the year'),
                dayNames: Date.CultureInfo.dayNames,
                dayNamesShort: Date.CultureInfo.abbreviatedDayNames,
                dayNamesMin: Date.CultureInfo.shortestDayNames,
                dayStatus: base._t('Set DD as first week day'),
                dateStatus: base._t('Select D, M d'),
                firstDay: Date.CultureInfo.firstDayOfWeek,
                initStatus: base._t('Select a date'),
                isRTL: false
            });
            $.timepicker.setDefaults({
                timeOnlyTitle: base._t('Choose Time'),
                timeText: base._t('Time'),
                hourText: base._t('Hour'),
                minuteText: base._t('Minute'),
                secondText: base._t('Second'),
                currentText: base._t('Now'),
                closeText: base._t('Done')
            });

            this.ui.inputs.datepicker({
                changeMonth: true,
                changeYear: true,
                showButtonPanel: true,
                dateFormat: default_format,
                onClose: _.bind(this.dateOnClose, this),
                beforeShow: _.bind(this.dateBeforeShow, this)
            })
            .focus(_.bind(this.dateFocus, this));

            // no choices, this element in injected in the body by the datepicker plugin...
            this.ui.picker = $('#ui-datepicker-div');
        },

        dateOnClose: function(text, options){

            // if user use hours booking chart, allow to choose specific day
            var selectedDay = this.model.get("base") === "hours" ? (options.selectedDay || 1) : 1;

            var input = options.input,
                date = new Date(options.selectedYear, options.selectedMonth, selectedDay);

            input.datepicker('setDate', date);
            input.attr('date', moment(date).format('YYYY-MM-DD'));
        },

        dateBeforeShow: function(el, options){
            var input = options.input,
                other_input = this.ui.inputs.not(input),
                isFrom = options.id == 'date_picker_from';

            input.datepicker('option', 'defaultDate', new Date(input.attr('date')));
            input.datepicker('option', (isFrom ? 'maxDate' : 'minDate'), new Date(other_input.attr('date')));
        },

        dateFocus: function(){
            if(this.model.get('base') !== "hours"){
                this.ui.picker.find('.ui-datepicker-calendar').hide();
            }
        },

        updateDateStart: function(){
            var start = this.model.start();
            this.ui.from.datepicker('setDate', start.toDate());
            this.ui.from.attr('date', start.format('YYYY-MM-DD'));
        },

        updateDateEnd: function(){
            var end = this.model.end();
            this.ui.to.datepicker('setDate', end.toDate());
            this.ui.to.attr('date', end.format('YYYY-MM-DD'));
        },

        show: function() {

            //reset the period, should render again all the calendar
            var from = moment(this.ui.from.attr('date')),
                to = moment(this.ui.to.attr('date'));

            if(!from.isValid() || !to.isValid()){
                throw new Error('date range is not correct');
            }
            if(from > to){
                throw new Error('"date from" should be lower than "date to"');
            }

            if( this.model.start().format('YYYY-MM-DD') != from.format('YYYY-MM-DD')
            ||  this.model.end().format('YYYY-MM-DD') != to.format('YYYY-MM-DD')){

                // skip the setting
                // to prevent the 'end' and 'start' moment from global period from being reset
                // to the start or the end of month|day (depends on type of the booking chart)
                var options = {};
                if (this.model.get("base") === "hours"){
                    options.skip_set = true;
                }

                this.model.reset({
                    start: from,
                    end: to,
                    frozen: true
                }, options);
            }
        }
    });

    booking.views('Toolbar', Toolbar);
});
