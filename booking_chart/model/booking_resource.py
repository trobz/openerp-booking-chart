# -*- encoding: utf-8 -*-
##############################################################################

from openerp.osv import osv, fields
import logging

class booking_resource(osv.osv):
    _name = "booking.resource"
    _description = "Booking Resource"

    def _get_all_tags(self, cr, uid, ids, field_names, arg, context=None):
        res = {}
        for item in self.browse(cr, uid, ids, fields_process=['tag_ids', 'id']):
            res[item.id] = []
            if item.tag_ids:
                for tag in item.tag_ids:
                    if tag.icon_name:
                        res[item.id].append(tag.icon_name)
                if res[item.id]:
                    res[item.id] = ', '.join(res[item.id])
        return res
    

    def _get_origin_name(self, cr, uid, ids, field_names, arg, context=None):
        res = {}
        #for item in self.browse(cr, uid, ids, fields_process=['origin_id', 'secondary_origin_id']):
        for item in self.browse(cr, uid, ids):
            res[item.id] = {
                'origin_name': '',
                'secondary_origin_name': '',
                'resource_name':'',
            }
            if item.origin_id and item.origin_model:
                res[item.id]['origin_name'] = self.pool.get(item.origin_model.model).name_get(cr, uid, [item.origin_id], context=context)[0][1]
            if item.secondary_origin_id and item.secondary_origin_model:
                res[item.id]['origin_name'] = self.pool.get(item.secondary_origin_model.model).name_get(cr, uid, [item.secondary_origin_id], context=context)[0][1]
            
            resource_model_name = self.pool.get('booking.chart').browse(cr,uid,item.chart.id,fields_process=['resource_model']).resource_model.model 
            res[item.id]['resource_name'] =  self.pool.get(resource_model_name).name_get(cr, uid, [item.resource_id], context=context)[0][1]
            
        return res                                                           
        
    
    _columns = {
		'name': fields.char('Booking Name'),
		'chart': fields.many2one('booking.chart', 'Booking Chart', help='Related booking chart.'),
		'resource_id': fields.integer('Resource ID'),
		'date_start': fields.date('Date Start'),
		'date_end': fields.date('Date End'),
		'css_class': fields.char('CSS Class',
								 help="CSS Class to be used to display that record. standard classes: blue, red, green, yellow, ..."),
		'message': fields.text('Message',
							   help="Message to be displayed on mouse over the block. This is stored in a textarea because the type of information will depends on the source of the information (reservation, guest folio, replacement, holidays, training ...)"),
		'origin_model': fields.many2one('ir.model', 'Model of the Origin',
										help='Name of the model at the origin of the booking this booking_resource. Example: hr.holiday, hotel.reservation.'),
		'origin_id': fields.integer('Origin ID'),
		'tag_ids': fields.many2many('booking.resource.tag', id1='booking_resource_id', id2='booking_resource_tag_id',
									string='Tags'),
		'tags_name': fields.function(_get_all_tags, method=True, type='char', string='Tag Names', readonly=True),
		'secondary_origin_model': fields.many2one('ir.model', 'Model of the Secondary Origin'),
		'secondary_origin_id': fields.integer('Secondary Origin ID',help='This is used in the case of a room booking and room booking line. Room booking is the origin (because we want to open that form when clicking on the bar of the Booking Chart), the secondary_origin_id  is used to store the reservation_line_id.'),
        'resource_name': fields.function(_get_origin_name, method=True, type='char', multi='name', string='Resource Name', readonly=True),
        'origin_name': fields.function(_get_origin_name, method=True, type='char', multi='name', string='Origin Name', readonly=True),
        'secondary_origin_name': fields.function(_get_origin_name, method=True, type='char', multi='name', string='Secondary Origin Name', readonly=True),

    }

    def get_overlaying_booking(self,cr,uid,resource_id,date_from,date_to):
        return self.search(cr,uid,[('resource_id','=',resource_id),('date_start','<=',date_to),('date_end','>=',date_from)])

    def unlink_by_origin(self,cr,uid,secondary_origin_id):
        booking_resource_ids = self.search(cr, uid, [('secondary_origin_id', '=', secondary_origin_id)])
        return self.unlink(cr, uid, booking_resource_ids)

    def unlink_by_secondary_origin(self,cr,uid,secondary_origin_id):
        booking_resource_ids = self.search(cr, uid, [('secondary_origin_id', '=', secondary_origin_id)])
        return self.unlink(cr, uid, booking_resource_ids)

    def save_booking_resource(self,cr,uid,vals,tags,origin_model_name=None,secondary_origin_model_name=None,chart_name='Booking Chart'):

        booking_chart_ids = self.pool.get('booking.chart').search(cr, uid, [('name', '=', chart_name)])
        booking_chart_id = booking_chart_ids[0]
        vals['chart'] = booking_chart_id
        
        ir_model_obj = self.pool.get('ir.model')
        if origin_model_name:
            origin_model_ids = ir_model_obj.search(cr, uid, [('model', '=', origin_model_name)])
            origin_model_id = origin_model_ids and origin_model_ids[0] or False
            vals['origin_model'] = origin_model_id
        
        if secondary_origin_model_name:
            secondary_origin_model_ids = ir_model_obj.search(cr, uid, [('model', '=', secondary_origin_model_name)])
            secondary_origin_model_id = secondary_origin_model_ids and secondary_origin_model_ids[0] or False
            vals['secondary_origin_model'] = secondary_origin_model_id

        if tags:
            tag_ids = self.pool.get('booking.resource.tag').search(cr,uid,[('name','in',tags)])
            vals['tag_ids']= [(6, 0, tag_ids)]

        if vals.get('secondary_origin_id',False):
            booking_resource_ids = self.search(cr, uid, [('secondary_origin_id', '=', vals['secondary_origin_id']),('secondary_origin_model','=',secondary_origin_model_id)])
        else:
            booking_resource_ids = self.search(cr, uid, [('origin_id', '=', vals['origin_id']),('origin_model','=',origin_model_id)])
            
        if booking_resource_ids and len(booking_resource_ids)>1:
            logging.error('Found several booking resource to update, booking_resource_ids: %s' % (str(booking_resource_ids)))
            raise 'TODO' #TODO: 'We should not have several booking_resource_ids to update

        booking_resource_id = booking_resource_ids and booking_resource_ids[0] or False

        if booking_resource_id:
            self.write(cr, uid, booking_resource_id, vals)
            return booking_resource_id
        else:
            return self.create(cr, uid, vals)

        booking_resource_id = booking_resource_ids and booking_resource_ids[0] or False


booking_resource()

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
