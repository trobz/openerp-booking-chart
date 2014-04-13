# -*- encoding: utf-8 -*-
##############################################################################

from openerp.osv import osv, fields

class custom_resource_group(osv.osv):
    
    _name = "custom.resource.group"
    _description = "Custom Resource Group"

    _columns = {
        'name': fields.char('Group Name', required=True),
    }

custom_resource_group()

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:

