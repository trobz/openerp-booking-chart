# -*- encoding: utf-8 -*-
##############################################################################

from openerp.osv import osv, fields

class booking_chart(osv.osv):
    
    _name = "booking.chart"
    _description = "Booking Chart"
    
    def extra_fields(self, cr, uid, ids, field_names, arg, context=None):
        result = {}
        
        for chart in self.browse(cr, uid, ids, context=context):
            
            result[chart.id] = {
                'resource_model_name': chart.resource_model.model
            }
        
        return result

    
    _columns = {
        'name': fields.char('Chart Name'),
        'resource_model':fields.many2one('ir.model','Model of the Resource', help='OpenERP model that represents the booked resource.'),
        'resource_domain':fields.char('Domain to filter the resources', help='This Domain has the format of an domain expression (see: https://doc.openerp.com/trunk/web/rpc/ ). It is used if we want to display only some resources filtered based on that domain. Example: [["is_company","=",false]]'),
        'resource_name': fields.char('Resource Name'),
        
        'resource_model_name': fields.function(extra_fields, method=True, type='serialized', string='Resource Model Name', multi=True, readonly=True),
    }

booking_chart()

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

