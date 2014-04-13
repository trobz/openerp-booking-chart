# -*- encoding: utf-8 -*-
##############################################################################

from openerp.osv import osv, fields

class custom_resource(osv.osv):
    
    _name = "custom.resource"
    _description = "Custom Resource"
    
    def _models_get(self, cr, uid, context=None):
        model_ids = self.pool.get('ir.model').search(cr, uid, [], context=context)
        model_objs = self.pool.get('ir.model').read(cr, uid, model_ids, ['model', 'name'])
        res = []
        for model_obj in model_objs:
            res.append((model_obj['model'], model_obj['name']))
        return res
    
    _columns = {
        'name': fields.char('Resource Name', required=True),
        'resource_id': fields.reference('Resource Reference', selection=_models_get, size=128, select=1, required=True),
        'model_id': fields.many2one('ir.model', 'Model of the Resource', readonly=True),
        'res_id': fields.integer('Resource Id', readonly=True),
        'group_id': fields.many2one('custom.resource.group', 'Custom Resource Group', required=True),
    }
        
    def create(self, cr, uid, vals, context=None):
        '''
        '''
        if vals.get('resource_id', False):
            resource_id = vals['resource_id']
            assert isinstance(resource_id, basestring) and ',' in resource_id,  'Resource Id must be an reference field'
            model_model, res_id = resource_id.split(',')
            model_ids = self.pool.get('ir.model').search(cr, uid, [('model', '=', model_model)])
            if model_ids:
                vals['model_id'] = self.pool.get('ir.model').name_get(cr, uid, model_ids[0])[0][0]
            vals['res_id'] = res_id
            
        return super(osv.osv, self).create(cr, uid, vals, context)
    
    def write(self, cr, uid, ids, vals, context=None):
        '''
        '''
        if vals.get('resource_id', False):
            resource_id = vals['resource_id']
            assert isinstance(resource_id, basestring) and ',' in resource_id,  'Resource Id must be an reference field'
            model_model, res_id = resource_id.split(',')
            model_ids = self.pool.get('ir.model').search(cr, uid, [('model', '=', model_model)])
            if model_ids:
                vals['model_id'] = self.pool.get('ir.model').name_get(cr, uid, model_ids[0])[0][0]
            vals['res_id'] = res_id
            
        return super(custom_resource, self).write(cr, uid, ids, vals, context)
    
custom_resource()

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

