# -*- encoding: utf-8 -*-
##############################################################################

from openerp.osv import osv

class post_object(osv.osv_memory):
    
    _name = 'post.object.demo_task'
    _description = 'generate resource booking model based on existing tasks'
    _auto = True
    _log_access = True
    
    def start(self, cr, uid):
        return True
                
post_object()