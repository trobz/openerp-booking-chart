from openerp.osv import osv, orm


class resource_mixin(osv.osv):
    """
    Mixin Class,
    used to auto generate booking.resource based on an other model.
    Hook model load, create, update and delete methods.
    """

    _register = False

    "Required booking resource fields"
    _booking_resource_map_required = [
        'name', 'date_start', 'date_end',
    ]

    #
    # Mixins
    #
    def __init__(self, *args, **kwargs):
        """
        Check all required property
        """
        self._check_booking_properties()
        super(resource_mixin, self).__init__(*args, **kwargs)

    def create(self, cr, uid, vals, context=None):
        """
        Create related booking resource
        """
        model_id = super(resource_mixin, self).create(cr, uid, vals,
                                                      context=context)
        models = self.browse(cr, uid, [model_id], context=context)
        if len(models) > 0 and self._has_required_fields(models):
            self._create_resource(cr, uid, models, context=context)
        return model_id

    def write(self, cr, uid, ids, vals, context=None):
        """
        Update related booking resource
        """

        status = super(resource_mixin, self).write(
            cr, uid, ids, vals, context=context)

        if status:
            models = self.browse(cr, uid, ids, context=context)
            resource = self.pool.get('booking.resource')
            resource_ids = self._get_resources(cr, uid, ids, context)

            if len(resource_ids) > 0 and len(models) > 0 and \
                    self._has_required_fields(models):
                '''
                    use only the first model to update values,
                    because they should have the same value updated at
                    super.write call before
                '''
                resource.unlink(cr, uid, resource_ids, context=context)
                status = self._create_resource(cr, uid, models,
                                               context=context)

        return status

    def unlink(self, cr, uid, ids, context=None):
        """
        Delete related booking chart
        """
        status = super(resource_mixin, self).unlink(cr, uid, ids,
                                                    context=context)

        if status:
            resource = self.pool.get('booking.resource')
            resource_ids = self._get_resources(cr, uid, ids, context)
            if len(resource_ids) > 0:
                status = resource.unlink(cr, uid, resource_ids,
                                         context=context)

        return status

    def _create_resource(self, cr, uid, models, context=None):
        context = context or {}
        resource = self.pool.get('booking.resource')
        for model in models:
            mapping = self._map_values(model)
            datas = self.get_chart_ids(cr, uid, model)
            for data in datas:
                for chart_id, resource_ref in data.iteritems():
                    mapping['chart_id'] = chart_id
                    mapping['resource_ref'] = resource_ref
                    resource.create(cr, uid, mapping, context=context)
        return True

    #
    # Methods override-able
    #
    def get_chart_ids(self, cr, uid, model):
        """
            Get the booking chart id in relation with
            auto created booking.resource.
            Override this method if you want to implement
            your own way to get chart id.
        """
        if not self._booking_chart_refs:
            raise Exception('%s model with booking resource mixin: \
                _booking_chart_refs property required' % (self._name))
        ids = []
        ir_model = self.pool['ir.model.data']
        for _booking_chart_ref, resource_field_ref in \
                self._booking_chart_refs.iteritems():
            if model[resource_field_ref]:
                xml_id = _booking_chart_ref.split('.')
                ref = ir_model.get_object_reference(cr, uid,
                                                    xml_id[0],
                                                    xml_id[1])
                if len(ref) < 2:
                    raise Exception('%s model with booking resource mixin: \
                        can not find the chart_id according to the \
                        xml_id: %s' % (self._name, self._booking_chart_ref))
                resource = ir_model.get_object(cr, uid,
                                               xml_id[0],
                                               xml_id[1])
                resource_name = resource and \
                    resource.resource_model.model or False
                if resource_name:
                    for resource_id in model[resource_field_ref].ids:
                        resource_ref = "%s,%s" % (resource_name, resource_id)
                        ids.append({ref[1]: resource_ref})
            elif resource_field_ref not in model:
                raise Exception('Field %s does not exists in \
                model %s' % (resource_field_ref, self._name))
        return ids

    #
    # Internal methods
    #

    def _check_booking_properties(self):
        """
        Check if all required properties are correctly \
        set to bind booking.resource with the model
        """
        if not self._booking_resource_map:
            raise Exception('%s model with booking resource mixin: \
            _booking_resource_map property required' % (self._name))

        for name in self._booking_resource_map_required:
            if name not in self._booking_resource_map:
                raise Exception('%s model with booking resource mixin: "%s" key \
                required in _booking_resource_map property' % (self._name,
                                                               name))

    def _has_required_fields(self, models):
        """
        Check if the dictionary has all required booking.resource fields
        """
        valid = True
        for model in models:
            for name in self._booking_resource_map_required:
                if self._get_map(name) not in model:
                    valid = False
        return valid

    def _get_resources(self, cr, uid, ids, context=None):
        """
        Get resource ids according to their origin reference
        """
        resource = self.pool.get('booking.resource')
        models = []
        for model_id in ids:
            models.append('%s,%s' % (self._name, model_id))
        return resource.search(cr, uid,
                               [('origin_ref', 'in', models)],
                               context=context)

    def _get_map(self, name):
        """
        Get the field name to map with a booking.resource field
        """
        return self._booking_resource_map[name] if name in \
            self._booking_resource_map else None

    def _map_values(self, model):
        """
        Get booking.resource data according to the mapping description
        """
        mapping = {}

        for name in self._booking_resource_map:
            target = self._get_map(name)
            custom = None

            '''
                If target is a function
                def function(self, cr, uid, model, context=None)
                    return string
            '''
            if hasattr(target, '__call__'):
                target = target(model)
            # custom mapping
            if ':' in target:
                target, custom = target.split(':')

            if target in model:
                if custom:
                    # custom mapping
                    mapping[name] = model[custom]
                elif isinstance(model[target], orm.browse_record):
                    # object mapping
                    mapping[name] = "%s,%s" % (model[target]._name,
                                               model[target].id)
                elif name == 'origin_ref':
                    mapping[name] = "%s,%s" % (self._name, model.id)
                elif name == 'target_ref':
                    mapping[name] = "%s,%s" % (self._name, model.id)
                else:
                    # simple mapping
                    mapping[name] = model[target]
            else:
                mapping[name] = target

        return mapping

resource = resource_mixin
