# -*- coding: utf-8 -*-
{
    'name': 'Booking Chart - Project Tasks by Users',
    'version': '1.0',
    'author': 'Trobz',
    'website': 'https://github.com/trobz/openerp-booking-chart',
    'category': 'Booking Chart',
    'description': """
Booking chart view applied on the project module, powered by the booking chart module.

The Booking Chart will display one line per Employee with the Project's Tasks assigned to him.

New menu entry to access to the booking chart: Project > Project > Tasks Assignment Chart
    """,
    
    'depends': [
        'project',
        'booking_chart',
    ],
    
    'data': [
        'data/booking_chart_data.xml',
        'view/booking_chart_view.xml',
        'menu/booking_chart_menu.xml',        
        # Declare an init function to generate booking.resource from existing tasks
        'data/task_function.xml',
    ],
    
    'js': [],
    
    'css': [],
    
    'demo': [],
    
    'application': True,
    'sequence': -99,
    'installable': True,
    'active': True
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
