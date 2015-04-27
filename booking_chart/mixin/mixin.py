# -*- coding: utf-8 -*-

from openerp.osv import osv, orm, fields
import logging

_logger = logging.getLogger('openerp.booking.mixin')


class BookingMixinException(Exception):
    pass


class resource_mixin(osv.osv):

    """
    Mixin Class, used to auto generate booking.resource based on an other model.
    Hook model load, create, update and delete methods.
    """

    _register = False

    _booking_resource_map_required = [
        'name', 'date_start', 'date_end', 'resource_ref'
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
        model_id = super(resource_mixin, self).create(cr, uid,
                                                      vals,
                                                      context=context)

        resource = self.pool('booking.resource')
        models = self.browse(cr, uid, [model_id], context=context)

        if len(models) > 0:
            model = models[0]

            for char_xml_id, chart_id, map in self._get_chart_ids(cr, uid):

                mapping = self._map_values(map, model, char_xml_id, chart_id)

                if self._has_required_fields(mapping):
                    _logger.info(
                        'Create booking resource for model %s with id %s',
                        self._name, model.id)
                    resource.create(cr, uid, mapping, context=context)
                else:
                    _logger.warn(
                        "The booking resource for model %s can't be " +
                        "created, some required fields are missing",
                        self._name)

        return model_id

    def write(self, cr, uid, ids, vals, context=None):
        """
        Update related booking resource
        """

        status = super(resource_mixin, self).write(cr, uid,
                                                   ids, vals,
                                                   context=context)

        if status:
            resource = self.pool.get('booking.resource')

            models = self.browse(cr, uid, ids, context=context)

            for char_xml_id, chart_id, map in self._get_chart_ids(cr, uid):
                for model in models:

                    resource_id = self._get_resource_id(cr, uid,
                                                        model.id,
                                                        chart_id,
                                                        context)

                    mapping = self._map_values(map,
                                               model,
                                               char_xml_id,
                                               chart_id)

                    if resource_id:
                        _logger.info(
                            'Update booking resource %s ' +
                            'for model %s with id %s',
                            resource_id, self._name, model.id)
                        status = resource.write(cr, uid,
                                                resource_id,
                                                mapping,
                                                context=context)
                    else:
                        if self._has_required_fields(mapping):
                            _logger.info(
                                'Create booking resource for ' +
                                'model %s with id %s', self._name, model.id)
                            resource.create(cr, uid,
                                            mapping,
                                            context=context)
                            status = True
                        else:
                            _logger.warn(
                                "The booking resource for model %s can't be " +
                                "created/updated, some required " +
                                "fields are missing", self._name)

        return status

    def unlink(self, cr, uid, ids, context=None):
        """
        Delete related booking chart
        """
        status = super(resource_mixin, self).unlink(cr, uid,
                                                    ids,
                                                    context=context)

        if status:
            resource = self.pool.get('booking.resource')

            resource_ids = self._get_resource_ids(cr, uid, ids, context)

            if len(resource_ids) > 0:
                _logger.info(
                    'Delete %s booking resources linked to ' +
                    'model %s', len(resource_ids), self._name)
                status = resource.unlink(cr, uid,
                                         resource_ids,
                                         context=context)

        return status

    #
    # Internal methods
    #

    def _get_chart_id(self, cr, uid, char_xml_id):
        """
        Get the booking chart based on a booking_chart xml ids
        """

        data_model = self.pool.get('ir.model.data')
        booking_model = self.pool.get('booking.chart')

        module_name, xml_id = char_xml_id.split('.')

        ref = data_model.get_object_reference(cr, uid, module_name, xml_id)

        if len(ref) < 2:
            raise BookingMixinException(
                '%s model with booking resource mixin: ' % self._name +
                'can not find the chart_id according ' +
                'to the xml_id: %s' % char_xml_id)

        return ref[1]

    def _get_chart_ids(self, cr, uid):
        """
        Get Booking Chart record and field mapping based 
        on _booking_chart_mapping xml ids
        """
        charts = {}
        for xml_id, map in self._booking_chart_mapping.iteritems():
            chart_id = self._get_chart_id(cr, uid, xml_id)
            yield xml_id, chart_id, map

    def _check_booking_properties(self):
        """
        Check if all required properties are correctly set to bind 
        booking.resource with the model
        """
        if not self._booking_chart_mapping:
            raise BookingMixinException(
                '%s model with booking resource mixin: ' % self._name +
                '_booking_chart_mapping property is required')

        for chart_xml, chart_map in self._booking_chart_mapping.iteritems():
            for name in self._booking_resource_map_required:
                if name not in chart_map:
                    raise BookingMixinException(
                        '%s model with booking resource mixin: ' % self._name +
                        '"%s" key required in ' % name +
                        '_booking_chart_mapping[%s] property' % chart_xml)

    def _has_required_fields(self, vals):
        """
        Check if the dictionary has all required booking.resource fields
        """
        valid = True
        for name in self._booking_resource_map_required:
            if vals.get(name) is None:
                valid = False
        return valid

    def _get_resource_ids(self, cr, uid, ids, context=None):
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

    def _get_resource_id(self, cr, uid, model_id, chart_id, context=None):
        """
        Get resource id according to the origin reference and the chart id
        """
        resource = self.pool.get('booking.resource')
        origin_ref = '%s,%s' % (self._name, model_id)

        return resource.search(cr, uid, [('origin_ref', '=', origin_ref),
                                         ('chart_id', '=', chart_id)],
                               context=context)

    def _map_values(self, map, model, chart_xml_id, chart_id):
        """
        Get booking.resource data according to the mapping description
        """
        mapping = {'chart_id': chart_id}

        for name, target in map.iteritems():

            # user defined method
            if callable(target):
                mapping[name] = target(self, model)

            # object mapping
            elif isinstance(model[target], orm.browse_record):
                mapping[name] = "%s,%s" % (model[target]._name,
                                           model[target].id)

            # simple mapping
            elif target in model:
                is_bool = isinstance(model._columns[target], fields.boolean)
                value = model[target]

                # fix ORM shit returning False for field without value...
                if not is_bool and value is False:
                    value = None

                mapping[name] = value

            else:
                _logger.warn("Mapping value for field %s can't be found.",
                             target)

            # force the link between booking.resource and the mixin record
            mapping['origin_ref'] = "%s,%s" % (self._name, model.id)

            if 'target_ref' not in mapping:
                mapping['target_ref'] = mapping['origin_ref']

        return mapping

resource = resource_mixin
