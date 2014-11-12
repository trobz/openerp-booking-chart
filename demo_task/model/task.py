from openerp.osv import fields
from openerp.addons.booking_chart.mixin import mixin


class task(mixin.resource):
    _inherit = "project.task"

    # ref to the booking_chart xml_id (if you have created the booking chart
    # manually, you have to override the mixin.resource.get_chart_id method)
    '''
        _booking_chart_refs: {}
        {module_name.booking_chart_xml_id: resource_field_ref}
        resource_field_ref: is field which link project.task with res.users
    '''
    _booking_chart_ref = 'demo_task.users_booking_chart'

    '''
        For _booking_resource_map, There are functions can be used
        Eg: we have

        def _get_message(self, cr, uid, model, context=None):
            # param: model is a current object's browse record
            return model and model.note or "It's empty"

        _booking_resource_map = {
            'message': _get_message,
        }
    '''
    _booking_resource_map = {
        # simple mapping, booking.resource field = task field
        'name':        'name',
        'message':     'description',
        'date_start':  'date_start',
        'date_end':    'date_end',
        # object mapping,
        # booking.resource field = "task.field._name,task.field.id"
        'resource_ref': 'user_id',
        'origin_ref':   'id',
        # custom mapping, set booking.resource.css_class field when priority
        # is updated with the value of task.booking_css_class
        'css_class':   'priority:booking_css_class'
    }

    def _get_booking_custom_fields(self, cr, uid, ids, field_names,
                                   arg, context=None):
        # booking resource color mapping with task.priority
        colors = {
            '0': 'red',
            '1': 'orange',
            '2': 'dark-blue',
            '3': 'blue',
            '4': 'light-blue',
        }
        res = {}

        for task in self.browse(cr, uid, ids):
            res[task.id] = colors[task.priority] if \
                task.priority in colors else ""

        return res

    # add a custom field to get the booking class css
    # according to current status
    _columns = {
        'booking_css_class': fields.function(_get_booking_custom_fields,
                                             method=True, type='char',
                                             string='Booking CSS Class',
                                             readonly=True),
    }

    def button_go_to_filtered_resources(self, cr, uid, ids, context=None):
        if context is None:
            context = {}

        # get object pool references
        resource_pool = self.pool.get('booking.resource')
        data_pool = self.pool.get('ir.model.data')

        # get the current clicking task
        _task = self.browse(cr, uid, ids[0], context=context)

        # get all related booking resources for this task
        domain = [('origin_ref', '=', u'{0},{1}'.format(self._name, ids[0]))]
        booking_resource_ids = resource_pool.search(cr, uid, domain, context=context)

        # get the booking chart id by xml
        booking_data = data_pool.xmlid_lookup(cr, uid, self._booking_chart_ref)

        # context to filter booking resources on the booking chart
        context.update({
            'booking_chart_id': booking_data[2],
            'booking_resource_domain': [('id', 'in', booking_resource_ids)]
        })

        # domain to filter resource on the booking chart
        domain = [
            ('id', 'in', [
                _task.user_id and _task.user_id.id,
                _task.reviewer_id and _task.reviewer_id.id
            ])
        ]

        return {
            'name': 'Task by users',
            'view_type': 'booking',
            'view_mode': 'booking',
            'res_model': 'res.users',
            'context': context,
            'domain': domain,
            'type': 'ir.actions.act_window',
        }

    #
    # FOR DEMO PROPOSE ONLY
    #
    # This method generate booking.resource
    # from existing task at demo_task module install/update
    #
    def _generate_resources(self, cr, uid, context=None):

        resource = self.pool.get('booking.resource')

        for task_id in self.search(cr, uid, [('name', '!=', None),
                                             ('date_start', '!=', None),
                                             ('date_end', '!=', None)],
                                   context=context):
            resource_id = resource.search(cr, uid, [
                ('origin_ref', '=', '%s,%s' % (self._name, task_id))],
                context=context)

            if not resource_id:
                tasks = self.browse(cr, uid, [task_id], context=context)
                task = tasks[0] if len(tasks) > 0 else {}

                mapping = self._map_values(task, task)
                mapping['origin_ref'] = "%s,%s" % (self._name, task_id)
                mapping['chart_id'] = self.get_chart_id(cr, uid, task)

                resource_id = resource.create(cr, uid, mapping,
                                              context=context)

task()
