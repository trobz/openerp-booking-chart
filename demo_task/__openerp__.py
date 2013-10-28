# -*- coding: utf-8 -*-
{
    'name': 'Booking Chart - Task Demo',
    'version': '1.0',
    'author': 'trobz',
    'website': 'http://trobz.com',
    'category': 'Demo',
    'description': """
Demo of a booking chart view applied on the project module, powered by the booking chart module.

features in demo:

- data binding between tasks and resources booking
- new menu entry to access to the booking chart 
    """,
    
    'depends': [
        'project',
        'booking_chart',
    ],
    
    'data': [
        'data/booking_chart.xml',
        'menu/booking_chart.xml'
    ],
    
    'js': [],
    
    'css': [],
    
    'demo': [],
    
    'application': False,
    'sequence': -99,
    'installable': True,
    'active': False,
    'post_objects': ['post.object.demo_task'],
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
