from openerp.osv import osv

class resource_mixin(osv.osv): 
    """
    Mixin Class, used to auto generate booking.resource based on an other model.
    Hook model load, create, update and delete methods.
    """
    
    _register = False
    
    "Required booking resource fields"
    _booking_resource_map_required = ['name', 'date_start', 'date_end', 'resource_ref']
    
    #
    # Mixins
    #
    
    def __init__(self, *args, **kwargs):
        """
        Check all required property
        """
        self._check_booking_properties()
        super(resource_mixin, self).__init__(*args, **kwargs)
    
    
    def create(self, cr, uid, vals, context=None, **kwargs):
        """
        Create related booking resource
        """
        model_id = super(resource_mixin, self).create(cr, uid, vals, context=context)
        
        if self._has_required_fields(vals):
            models = self.browse(cr, uid, [model_id], context=context)
            
            if len(models) > 0:
                model = models[0]
                resource = self.pool.get('booking.resource')
                mapping = self._map_values(model, vals)
                
               
                mapping['chart_id'] = self.get_chart_id(cr, uid, model)
            
            resource.create(cr, uid, mapping, context=context)
        
        return model_id
    
    def write(self, cr, uid, ids, vals, context=None, **kwargs):
        """
        Update related booking resource
        """
        
        status = super(resource_mixin, self).write(cr, uid, ids, vals, context=context)
        
        if status:
            models = self.browse(cr, uid, ids, context=context)
            resource = self.pool.get('booking.resource')
            resource_ids = self._get_resources(cr, uid, ids, context)
            
            if len(resource_ids) > 0 and len(models) > 0:
                # use only the first model to update values, because they should have the same value updated at super.write call before
                model = models[0]
                mapping = self._map_values(model, vals)
                status = resource.write(cr, uid, resource_ids, mapping, context=context)
  
        return status
    
    def unlink(self, cr, uid, ids, context=None, **kwargs):
        """
        Delete related booking chart
        """
        status = super(resource_mixin, self).unlink(cr, uid, ids, context=context)
   
        if status:
            resource = self.pool.get('booking.resource')
            resource_ids = self._get_resources(cr, uid, ids, context)
            if len(resource_ids) > 0:
                status = resource.unlink(cr, uid, resource_ids, context=context)
        
        return status
    
    #
    # Methods override-able
    #
    
    def get_chart_id(self, cr, uid, model):
        """
        Get the booking chart id in relation with auto created booking.resource.
        Override this method if you want to implement your own way to get chart id. 
        """
        if not self._booking_chart_ref:
            raise Exception('%s model with booking resource mixin: _booking_chart_ref property required' % (self._name))
        
        xml_id = self._booking_chart_ref.split('.')
        ref = self.pool.get('ir.model.data').get_object_reference(cr, uid, xml_id[0], xml_id[1])
        if len(ref) < 2:
            raise Exception('%s model with booking resource mixin: can not find the chart_id according to the xml_id: %s' % (self._name, self._booking_chart_ref))
        return ref[1] 

    #
    # Internal methods
    #
    
    def _check_booking_properties(self):   
        """
        Check if all required properties are correctly set to bind booking.resource with the model
        """
        if not self._booking_resource_map:
            raise Exception('%s model with booking resource mixin: _booking_resource_map property required' % (self._name))
        
        for name in self._booking_resource_map_required:
            if name not in self._booking_resource_map:
                raise Exception('%s model with booking resource mixin: "%s" key required in _booking_resource_map property' % (self._name, name))
            
    def _has_required_fields(self, vals):
        """
        Check if the dictionary has all required booking.resource fields
        """
        valid = True
        for name in self._booking_resource_map_required:
            if self._get_map(name) not in vals:
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
        return resource.search(cr, uid, [('origin_ref', 'in', models )], context=context)
    
    
    def _get_map(self, name):
        """
        Get the field name to map with a booking.resource field 
        """
        return self._booking_resource_map[name] if name in self._booking_resource_map else None

    def _map_values(self, model, vals):
        """
        Get booking.resource data according to the mapping description
        """
        mapping = {}
        
        for name in self._booking_resource_map:
            target = self._get_map(name)
            custom = None
            
            # custom mapping
            if ':' in target:
                target, custom = target.split(':')
                
            if target in vals and target in model:
                if custom:
                    # custom mapping
                    mapping[name] = model[custom]
                elif isinstance(model[target], osv.orm.browse_record):
                    # object mapping
                    mapping[name] = "%s,%s" % (model[target]._name, model[target].id)
                else:
                    # simple mapping
                    mapping[name] = model[target]
        
            # add a ref to the current model and link the booking.resource with the chart
            mapping['origin_ref'] = "%s,%s" % (self._name, model.id)
            
            if 'target_ref' not in mapping:
                mapping['target_ref'] = mapping['origin_ref']
            
        return mapping 
    
resource = resource_mixin
