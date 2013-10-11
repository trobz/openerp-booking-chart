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
        'web_unleashed'
    ],
    
    'data': [
        # security
        'security/res_groups_data.xml',
        #'security/ir.model.access.csv',
        
        # view
        'view/booking_resource_view.xml',
        'view/booking_chart_view.xml',
        'view/custom_resource_group_view.xml',
        'view/custom_resource_view.xml',
        
        # menu
        'menu/booking_chart_menu.xml',
    ],
    
    'demo': [],
    'application': True,
    'sequence': -99,
    'installable': True,
    'active': False,
    'post_objects': [],
    
    'qweb' : [
        'static/src/templates/*.xml',
    ],
    
    'js': [
        # lib
        'static/lib/scrollbar/js/jquery.scrollbar.min.js',
        'static/lib/tiptip/jquery.tipTip.minified.js',

        
        # backbone model
        'static/src/js/models/chart.js',
        'static/src/js/models/resource.js',
        'static/src/js/models/dateRange.js',
        'static/src/js/models/state.js',
        
        # backbone collection
        'static/src/js/collections/models.js',
        'static/src/js/collections/group.js',
        'static/src/js/collections/overlap.js',
        
        'static/src/js/collections/resources.js',
        'static/src/js/collections/items.js',
        
        # backbone view
        'static/src/js/views/toolbar.js',
        'static/src/js/views/pager.js',
        'static/src/js/views/calendar.js',
        'static/src/js/views/graph.js',

        # openERP view
        'static/src/js/booking.js',
        'static/src/js/generator.js',
    ],
    'css': [
        # lib
        'static/lib/scrollbar/css/jquery.scrollbar.css',
        'static/lib/tiptip/tipTip.css',

        # booking chart view
        'static/src/css/booking.css',
        'static/src/css/calendar.css',
        'static/src/css/graph.css',
        'static/src/css/toolbar.css',
    ],
    
    'test': [
        'static/src/tests/group.js',
        'static/src/tests/overlap.js',
    ]
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
