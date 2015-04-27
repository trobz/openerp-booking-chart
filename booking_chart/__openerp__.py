# -*- coding: utf-8 -*-
{
    'name': 'Booking Chart',
    'version': '1.0',
    'category': 'Data Visualization',
    'description': """
Creates a new object Resource Booking intended to be displayed as a "Booking Chart view".

The "Booking Chart view" is a new type of view for OpenERP.
    """,
    'author': 'Trobz',
    'website': 'http://trobz.github.io/openerp-booking-chart/',
    
    'depends': [
        'web_unleashed_extra'
    ],
    
    'data': [
        # security
        'security/res_groups_data.xml',
        'security/ir.model.access.csv',
        
        # view
        'view/booking_resource_view.xml',
        'view/booking_chart_view.xml',
        
        # menu
        'menu/booking_chart_menu.xml',

        # JS/CSS Assets files
        'views/booking_chart.xml',
    ],
    
    'demo': [],
    'application': True,
    'sequence': -99,
    'installable': True,
    'active': False,
    
    'qweb' : [
        'static/src/templates/*.xml',
    ],

    'test': [
        'static/src/tests/overlap.js',
        'static/src/tests/dateRange.js',
    ]
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
