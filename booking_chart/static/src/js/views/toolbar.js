/**
 * Created with PyCharm.
 * User: chanhle
 * Date: 8/1/13
 * Time: 11:30 AM
 * To change this template use File | Settings | File Templates.
 */
openerp.unleashed.module('booking_chart', function (booking, _, Backbone, base) {

    var BaseView = base.views('BaseView'),
        _super = BaseView.prototype;

    var Toolbar = BaseView.extend({

        className: 'Booking.Toolbar',

        events: {
            'click .btn_today': 'today',
            'click .btn_freeze': 'freeze',
            'click #btnShow': 'show'
        },

        initialize: function (options) {
            _super.initialize.apply(this, arguments);
        },

        bind: function () {
            this.collection.on('sync', this.render, this);
        },

        unbind: function () {
            this.collection.off(null, null, this);
            this.ref.period.off(null, null, this);
        },

        render: function () {
            var self = this
            var html = this.ref.display.render('Booking.Toolbar', {
                from: this.ref.period.start().format('MMMM YYYY'),
                to: this.ref.period.end().format('MMMM YYYY')
            });
            this.$el.html(html);

            $("#date_picker_from, #date_picker_to").datepicker({
                changeMonth: true,
                changeYear: true,
                showButtonPanel: true,
                dateFormat: 'MM yy',
                onClose: function (dateText, inst) {
                    var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
                    var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
                    $(this).datepicker('setDate', new Date(year, month, 1));
                },
                beforeShow: function (input, inst) {
                    if (input.id == 'date_picker_from') {
                        var year = moment(self.ref.period.start()).year()
                        var month = moment(self.ref.period.start()).month()
                        $(this).datepicker('setDate', new Date(year, month, 1));
                    }
                    if (input.id == 'date_picker_to') {
                        var year = moment(self.ref.period.end()).year()
                        var month = moment(self.ref.period.end()).month()
                        $(this).datepicker('setDate', new Date(year, month, 1));
                    }

                    if ((datestr = $(this).val()).length > 0) {
                        year = datestr.substring(datestr.length - 4, datestr.length);
                        month = jQuery.inArray(datestr.substring(0, datestr.length - 5), $(this).datepicker('option', 'monthNames'));
                        $(this).datepicker('option', 'defaultDate', new Date(year, month, 1));
                        $(this).datepicker('setDate', new Date(year, month, 1));
                    }
                    var other = this.id == "date_picker_from" ? "#date_picker_to" : "#date_picker_from";
                    var option = this.id == "date_picker_from" ? "maxDate" : "minDate";
                    if ((selectedDate = $(other).val()).length > 0) {
                        year = selectedDate.substring(selectedDate.length - 4, selectedDate.length);
                        month = jQuery.inArray(selectedDate.substring(0, selectedDate.length - 5), $(this).datepicker('option', 'monthNames'));
                        $(this).datepicker("option", option, new Date(year, month, 1));
                    }
                }
            }).focus(function () {
                    $(".ui-datepicker-calendar").hide();
                    $("#ui-datepicker-div").position({
                        my: "center top",
                        at: "center bottom",
                        of: $(this)
                    });
                });
            return this
        },

        today: function () {
            this.ref.calendar.today()
        },

        freeze: function () {
            this.ref.calendar.freeze()
        },

        show: function (e) {
            if ($("#date_picker_from").val().length == 0 || $("#date_picker_to").val().length == 0) {
                alert('All fields are required');
            }
            else {
                var dateRangePicker_end = moment($("#date_picker_to").val(), 'MMM YYYY').add('months', 1).date(1),
                    dateRangePicker_start = moment($("#date_picker_from").val(), 'MMM YYYY')
                if (dateRangePicker_end < dateRangePicker_start) {
                    alert('To date should be greater than from date!')
                }
                else {
                    var diff_start = this.ref.period.start().diff(dateRangePicker_start)
                    var diff_end = this.ref.period.end().diff(dateRangePicker_end)
                    if( diff_start != 0 || diff_end != 0){
                        this.ref.period.dateRangePicker(dateRangePicker_start, dateRangePicker_end)
                        this.ref.calendar.loading = false
                    }
                    this.freeze()
                }

            }
        }
    })

    booking.views('Toolbar', Toolbar);

});
