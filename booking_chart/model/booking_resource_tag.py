# -*- encoding: utf-8 -*-
##############################################################################

from openerp.osv import osv, fields

class booking_resource_tag(osv.osv):

    _name = "booking.resource.tag"
    _description = "Booking Resource tag"

    _columns = {
        'name': fields.char('Name'),
		'icon_name': fields.char('Icon Name')
    }

booking_resource_tag()

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

