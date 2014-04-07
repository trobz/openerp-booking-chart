# -*- coding: utf-8 -*-
{
    'name': 'Booking Chart Ressource Group',
    'version': '1.0',
    'category': 'Data Visualization',
    'description': """

    """,
    'author': 'Trobz',
    'website': 'http://trobz.github.io/openerp-booking-chart/',
    
    'depends': [
        'booking_chart'
    ],
    
    'data': [
             'security/ir.model.access.csv',
             'view/custom_resource_group_view.xml',
             'view/custom_resource_view.xml'
    ],
    
    'demo': [],
    'application': True,
    'sequence': -99,
    'installable': True,
    'active': False,
    
    'qweb' : [
    ],
    
    'js': [
    ],
    'css': [
    ],
    
    'test': [
    ]
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
