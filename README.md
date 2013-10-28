## Introduction

The Booking Chart View provide an overview in a calendar for any OpenERP resources, 
you can have different type of resource booking in your calendar and you can freely associate them to any resources listed in rows.

[Video Demo](http://trobz.github.io/openerp-booking-chart/ "OpenERP Booking Chart Presentation Page")

### Features

- Display any resources in a booking chart
- Easy scrolling navigation 
- Resource lazy loading
- Zoom levels (from 1 week to 6 months)
- Auto-merge overlapping resources
- Native OpenERP search/group supported on listed resources
- Manual period selection
- Period freeze/unfreeze button


## Key concepts

The booking chart is decoupled from OpenERP models, by this way you are totally free to display any resources in your chart, 
the counterpart is that you have to code the link between OpenERP models and your booking chart.

We decide to go on this direction instead of having an OpenERP gantt-like configuration because our module need 
to link booking chart to multiple models, with different logics, a simple configuration will be hard to define to have the same flexibility.


2 main models are used in the booking chart:

### booking_chart

A booking chart simply define from which model the chart will be created. Resources will be displayed as row in the chart, 
and Resource Booking have to make a reference to specific object from this model to be correctly displayed.

**model**
- name
- resource_model: ref to the model used to build the chart
- resource_domain: an additional domain, added when resource_model are retrieved
- supported_model_ids: list of model supported by booking resources as an origin and/or a target (required for fields.reference selection)

### booking_resource

A booking resource is the periodical element displayed in the chart, a reference can be made to any OpenERP object (origin).
If a target object is available, it will be displayed in a form by clicking on the booking resource. 

**model**
- name
- chart_id: relation with a booking_chart object
- resource_id: reference to a object id from the booking_chart model
- origin_id: reference to the object at the origin of the booking resource
- target_id: reference to the object to open when the booking resource is clicked
- date_start
- date_end
- css_class
- message
- tags

## Setup / Use

The module itself is installable from the OpenERP module interface.

However, the booking chart doesn't work out of the box, because of the flexibility to link any models to it, you will have to
add some code to create/update/delete booking resources.

A mixin helper is available but you can implement your own logic to keep your booking resources up to date with an other model.


### `booking.resource` and `booking.chart` views

Views are available to directly edit booking models, these views are only accessible to user with the "Technical Features" enabled.

You can access to them here: `Settings > Technical > Booking Chart`  

### Model Mixin

To simplify this task, mixin model is available in `booking_chart.mixin`, this mixin is used by the `demo_task` module.


Basically, only a mapping between your model and the booking.resource has to be done, with different type of relation:
- simple mapping: value is just copied
- object mapping: the value is defined according to a osv.model
- custom mapping: define the field to get when an other field has been modified. useful to define mapping on function fields, see the example below.


The mixin is designed to automatically create, update and delete booking resources associated with the model.

**example from `demo_task` module**
```python
from openerp.osv import fields
from booking_chart.mixin import mixin
    
class task(mixin.resource):
    _inherit = "project.task"
    
    # ref to the booking_chart xml_id (if you have created the booking chart manually, you have to override the mixin.resource.get_chart_id method)
    _booking_chart_ref = 'demo_task.users_booking_chart'
    
    _booking_resource_map = {
        # simple mapping, booking.resource field = task field 
        'name':        'name',
        'message':     'description',
        'date_start':  'date_start',
        'date_end':    'date_end',
        # object mapping, booking.resource field = "task.field._name,task.field.id" 
        'resource_id': 'user_id',
        'target_id':   'project_id',
        # custom mapping, set booking.resource.css_class field when priority is updated with the value of task.booking_css_class
        'css_class':   'priority:booking_css_class'
    }
    
    
    def _get_booking_custom_fields(self, cr, uid, ids, field_names, arg, context=None):
        # booking resource color mapping with task.priority
        colors = {
            '0': 'red', '1': 'orange', '2': 'dark-blue',  '3': 'blue', '4': 'light-blue'
        }
        res = {}
        
        for task in self.browse(cr, uid, ids):
            res[task.id] = colors[task.priority] if task.priority in colors else ""
        
        return res
    
    # add a custom field to get the booking class css according to current status
    _columns = {
        'booking_css_class': fields.function(_get_booking_custom_fields, method=True, type='char', string='Booking CSS Class', readonly=True),
    }
       
task()
```

## Dependencies

- [Web Unleashed module](https://github.com/trobz/openerp-web-unleashed "OpenERP Web Unleashed")     
This module provide native support of Backbone and Marionette, simplifing dramatically the creation of rich web application in OpenERP.  

