# -*- coding: utf-8 -*-
{
    'name': 'Booking Chart Custom Resource',
    'version': '1.0',
    'category': 'Booking Chart',
    'description': """
        Provides a model that can be used to abstract the concept of resource.
        In the Booking Chart module, a resource is binded to a unique model.
        With this module, we create a new model "custom resource" which will be bindable to the resource.
        Then, the custom resource can be linked to any record from any model.
        
        **Use case: Farming**
        
        *With a* **booking chart** *module, the resource would be a field, then the bookings would be the events (farming period, treatments, sickness, ...)
        The problem is that the farming period will be very long and will always overlap with the other events.
        Therefore, the booking chart might not be very readable.*
        
        *With the* **booking chart custom resource** *module, you can create one custom resource per field and type of event.
        Your booking chart will then be much more readable.*
    """,
    'author': 'Trobz',
    'website': 'http://trobz.github.io/openerp-booking-chart/',
    
    'depends': [
        'booking_chart',
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
