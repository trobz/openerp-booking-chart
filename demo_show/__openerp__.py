# -*- coding: utf-8 -*-
{
    'name': 'Booking Chart - Demo',
    'version': '1.0',
    'author': 'Trobz',
    'website': 'https://github.com/trobz/openerp-booking-chart',
    'category': 'Demo',
    'description': """
Demo of a booking chart view applied on a fictive tv show module

features in demo:

- data binding between show and resources booking
- new menu entry to access to the booking chart
    """,

    'depends': [
        'booking_chart',
    ],

    'data': [
        'security/ir.model.access.csv',

        'data/booking_chart.xml',

        'view/booking_chart.xml',
        'view/tv.xml',

        'menu/booking_chart.xml',
        'menu/tv.xml',
    ],

    'demo': [
        'demo/tv.channel.csv',
        'demo/tv.serie.csv',
        'demo/tv.episode.csv',
        'demo/tv.broadcast.csv',
    ],

    'post_init_hook': 'update_tv_broadcast_with_current_time',

    'application': True,
    'sequence': -99,
    'installable': True,
    'active': False
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
