# -*- coding: utf-8 -*-

import model
from openerp import SUPERUSER_ID


def update_tv_broadcast_with_current_time(cr, registry):
    """
    Update start/end datetime based on the current datetime.

    Use a post hook because it has to be done after demo data import.
    """
    model = registry.get('tv.broadcast')
    model._update_based_on_current_time(cr, SUPERUSER_ID)
