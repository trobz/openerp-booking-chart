# -*- encoding: utf-8 -*-
##############################################################################

from openerp.osv import osv, fields
import logging

class booking_resource(osv.osv):
    _name = "booking.resource"
    _description = "Booking Resource"

    def _get_tags(self, cr, uid, ids, field_names, arg, context=None):
        res = {}
        for item in self.browse(cr, uid, ids, fields_process=['tag_ids', 'id']):
            res[item.id] = []
            if item.tag_ids:
                for tag in item.tag_ids:
                    if tag.icon_name:
                        res[item.id].append(tag.icon_name)
        return res
    
    def _models_resource_get(self, cr, uid, context=None):
        chart_model = self.pool.get('booking.chart')
        chart_ids = chart_model.search(cr, uid, [])
        
        models = []
        for chart in chart_model.browse(cr, uid, chart_ids):
            models.append((chart.resource_model.model, chart.resource_model.name))
        
        logging.warn("booking_resource: _models_resource_get: %s", models)
            
        return models

    def _models_get(self, cr, uid, context=None):
        return [('res.partner','Partner')]
    
    
    _columns = {
		'name': fields.char('Booking Name'),
		'chart': fields.many2one('booking.chart', 'Booking Chart', help='Related booking chart.'),
		
        'resource_id': fields.reference('Resource', selection=_models_resource_get, size=128, select=1, require=True, help="Related booking chart resource."),
        
        'date_start': fields.date('Date Start'),
		'date_end': fields.date('Date End'),
		'css_class': fields.char('CSS Class',
								 help="CSS Class to be used to display that record. standard classes: blue, red, green, yellow, ..."),
		'message': fields.text('Message',
							   help="Message to be displayed on mouse over the block. This is stored in a textarea because the type of information will depends on the source of the information (reservation, guest folio, replacement, holidays, training ...)"),
		
        
        'origin_id': fields.reference('Origin', selection=_models_get, size=128, require=True, help='Resource at the origin of the booking. Example: holiday, reservation...'),
        'target_id': fields.reference('Target', selection=_models_get, size=128, help='Resource to open when the booking is clicked. If not set, use the Origin'),
        
        'tag_ids': fields.many2many('booking.resource.tag', id1='booking_resource_id', id2='booking_resource_tag_id',
									string='Tags'),
		
        
        
        'tags': fields.function(_get_tags, method=True, type='serialized', string='Serialized Tags', readonly=True),
    }


booking_resource()

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
