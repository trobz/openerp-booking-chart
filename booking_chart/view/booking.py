# -*- coding: utf-8 -*-

from openerp.osv import osv
from openerp import api
from openerp.tools.translate import _
from openerp.tools.safe_eval import safe_eval
from openerp.addons.base.ir.ir_actions import VIEW_TYPES
from lxml import etree


VIEW_TYPE = ('booking', _('Booking Chart'))
VIEW_TYPES.append(VIEW_TYPE)


def valid_node_group(node):
    res = True
    if not valid_type_booking(node):
        res = False
    return res


def valid_type_booking(arch, fromgroup=True):
    # TODO: missing arch validator
    return True


class BookingView(osv.Model):
    _inherit = 'ir.ui.view'

    @api.model
    def _setup_fields(self, **kwargs):
        res = super(BookingView, self)._setup_fields(**kwargs)
        select = [k for k, v in self._columns['type'].selection]
        if VIEW_TYPE[0] not in select:
            self._columns['type'].selection.append(VIEW_TYPE)
        return res

    def _check_xml_booking(self, cr, uid, ids, context=None):
        domain = [
            ('id', 'in', ids),
            ('type', '=', VIEW_TYPE[0]),
        ]
        view_ids = self.search(cr, uid, domain, context=context)
        for view in self.browse(cr, uid, view_ids, context=context):
            fvg = self.pool.get(view.model).fields_view_get(
                cr, uid, view_id=view.id, view_type=view.type, context=context)
            view_arch_utf8 = fvg['arch']
            view_docs = [etree.fromstring(view_arch_utf8)]
            if view_docs[0].tag == 'data':
                view_docs = view_docs[0]
            for view_arch in view_docs:
                if not valid_type_booking(view_arch, fromgroup=False):
                    return False
        return True

    _constraints = [
        (
            _check_xml_booking,
            'Invalid XML for booking view architecture',
            ['arch'],
        ),
    ]
