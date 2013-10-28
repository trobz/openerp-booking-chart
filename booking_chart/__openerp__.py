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
    ],
    
    'demo': [],
    'application': True,
    'sequence': -99,
    'installable': True,
    'active': False,
    
    'qweb' : [
        'static/src/templates/*.xml',
    ],
    
    'js': [
        # OpenERP form widgets
        'static/src/js/widgets/chart.js',
        'static/src/js/widgets/resource.js',
        'static/src/js/widgets/supported.js',
        
        
        # lib
        'static/lib/scrollbar/js/jquery.scrollbar.min.js',
        
        # collection used by dateRange model
        'static/src/js/models/month.js',
        'static/src/js/collections/months.js',
        
        # backbone model
        'static/src/js/models/chart.js',
        'static/src/js/models/resource.js',
        'static/src/js/models/item.js',
        'static/src/js/models/itemGroup.js',
        'static/src/js/models/dateRange.js',
        'static/src/js/models/state.js',
        
        # backbone collection
        'static/src/js/collections/overlap.js',
        'static/src/js/collections/resources.js',
        'static/src/js/collections/items.js',
        
        # backbone view
        'static/src/js/views/panel.js',
        'static/src/js/views/buttons.js',
        'static/src/js/views/toolbar.js',
        'static/src/js/views/pager.js',
        
        'static/src/js/views/calendar/items.js',
        'static/src/js/views/calendar/months.js',
        'static/src/js/views/calendar/graph.js',
        'static/src/js/views/calendar/controls.js',
        'static/src/js/views/calendar.js',
        
        # openERP view
        'static/src/js/booking.js', 
    ],
    'css': [
        # lib
        'static/lib/scrollbar/css/jquery.scrollbar.css',
      
        # booking chart view
        'static/src/css/booking.css',
        'static/src/css/calendar.css',
        'static/src/css/items.css',
        'static/src/css/months.css',
        'static/src/css/graph.css',
        'static/src/css/buttons.css',
        'static/src/css/toolbar.css',
    ],
    
    'test': [
        'static/src/tests/overlap.js',
        'static/src/tests/dateRange.js',
    ]
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
