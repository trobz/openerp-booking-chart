[![Build Status](https://travis-ci.org/trobz/openerp-booking-chart.png?branch=master)](https://travis-ci.org/trobz/openerp-booking-chart)


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
- Mixin to link any OpenERP model with resources booking


## Key concepts

The booking chart is decoupled from OpenERP models, by this way you are totally free to display any resources in your chart, 
the counterpart is that you have to code the link between OpenERP models and your booking chart.

We decide to go on this direction instead of having an OpenERP gantt-like configuration in `arch` tag because our module need 
to link booking chart to multiple models, with different logics, and it's hard to achieve this with just some configuration.


2 main models are used in the booking chart:

### booking_chart

```
- name
- resource_model        // ref to the model used to build the chart, used to list resources, 
						// search/group_by queries are applied on this model
- resource_domain       // force some additional domains, added when resource_model are retrieved
- supported_model_ids   // list of model supported by resources booking  
						// for origin and/or target (required for fields.reference selection)
```

A booking chart define from which model the chart will be created. 
Resources will be displayed as row in the chart and Resource Booking have to make a reference 
to specific object from this model to be correctly displayed.

### booking_resource

```
- name
- chart_id      // relation with a booking_chart object
- resource_ref  // reference to an object from the booking_chart.resource_model
- origin_ref    // reference to the object at the origin of the resource booking 
- target_ref    // reference to the object to open when the resource booking is 
                // clicked (not required)
- date_start
- date_end
- css_class
- message
- tags
```


A resource booking is the periodical element displayed in the chart, the object at the origin of 
the resource booking can be any OpenERP model (origin_ref).
If a target object is defined, it will be displayed in a form view at click on the resource booking. 

## Setup / Use

The module itself is installable from the OpenERP module interface.

However, the booking chart doesn't work out of the box, because of the flexibility to link any models, you will have to
add some code to create/update/delete resources booking.

A mixin helper is available but you can implement your own logic to keep your resources booking up to date with an other model.


### `booking.resource` and `booking.chart` views

Views are available to directly edit booking models, these views are only accessible 
to users with the "Technical Features" enabled.

Access to booking chart model views:           
`Settings > Technical > Booking Chart`  

## Configuration

The booking chart support some `arch` view configuration:

- tag `<items>`
  - attribute `title`: field from `booking_chart.resource_model` to display in the booking list

**example:**

```xml
<record id="bar_booking_view" model="ir.ui.view">
    ...
    <field name="arch" type="xml">
        <booking version="7.0">
            <items title="name" />
        </booking>
    </field>
</record>
```

### Model Mixin

To simplify this task, mixin model is available in `booking_chart.mixin`, 
this mixin is used by the `demo_task` module.


Basically, only a mapping between your model and the booking.resource has to be done, 
with different type of relation:

- simple mapping: value is just copied
- reference mapping: the value is defined according to a `osv.model` object
- custom mapping: define the field to get when an other field has been modified. useful to define mapping on function fields, see the example below.


The mixin is designed to automatically create, update and delete resources booking associated with the model.

**example from `demo_task` module**

```python
from openerp.osv import fields
from booking_chart.mixin import mixin
    
class task(mixin.resource):
    _inherit = "project.task"
    
    # ref to the booking_chart xml_id (if you have created the booking chart
    # manually, you have to override the mixin.resource.get_chart_id method)
    '''
        _booking_chart_refs: {
			module_name.booking_chart_xml_id: resource_field_ref
		}
        resource_field_ref: is field which link project.task with resource_model in users_booking_chart
    '''

    _booking_chart_refs = {
        'demo_task.users_booking_chart': 'user_id'
    }

	'''
		For _booking_resource_map, There are functions can be used
		Eg:

		def _get_message(self, cr, uid, model, context=None):
			# param: model is a current object's browse record
			return model and model.note or "It's empty"

		_booking_resource_map = {
			'message': _get_message,
		}
	'''
    
    _booking_resource_map = {
        # simple mapping, booking.resource field = task field 
        'name':        'name',
        'message':     'description',
        'date_start':  'date_start',
        'date_end':    'date_end',
        # reference mapping, booking.resource field = "task.field._name,task.field.id" 
        'resource_ref': 'user_id',
		'origin_ref':   'user_id',
        'target_ref':   'project_id',
        # custom mapping, set booking.resource.css_class field when priority is 
        # updated with the value of task.booking_css_class
        'css_class':   'priority:booking_css_class'
    }
    
    
    def _get_booking_custom_fields(self, cr, uid, ids, field_names, arg, context=None):
        # resource booking color mapping with task.priority
        colors = {
            '0': 'red',
			'1': 'orange',
			'2': 'dark-blue',
			'3': 'blue',
			'4': 'light-blue',
        }
        res = {}
        
        for task in self.browse(cr, uid, ids):
            res[task.id] = colors[task.priority] if task.priority in colors else ""
        
        return res
    
    # add a custom field to get the booking class css according to current status
    _columns = {
        'booking_css_class': fields.function(_get_booking_custom_fields, 
        									 method=True, 
        									 type='char', 
        									 string='Booking CSS Class', 
        									 readonly=True),
    }
       
task()
```

#### Customize the booking chart associated with the resource booking 

If you need a specific way to get the chart associated with the resource booking, you can override `get_chart_ids()`.

This method has to return the booking.chart id, and in addition to `cr` and `uid`  parameters, the method get the current model.

** example **

```python
from booking_chart.mixin import mixin
    
class task(mixin.resource):
    _inherit = "project.task"
	
	...
	
	def get_chart_ids(self, cr, uid, model):
        """
            Get the booking chart id in relation with
            auto created booking.resource.
            Override this method if you want to implement
            your own way to get chart id.
        """
        if not self._booking_chart_refs:
            raise Exception('%s model with booking resource mixin: \
                _booking_chart_refs property required' % (self._name))
        ids = []
        ir_model = self.pool['ir.model.data']
        for _booking_chart_ref, resource_field_ref in \
                self._booking_chart_refs.iteritems():
            if model[resource_field_ref]:
                xml_id = _booking_chart_ref.split('.')
                ref = ir_model.get_object_reference(cr, uid,
                                                    xml_id[0],
                                                    xml_id[1])
                if len(ref) < 2:
                    raise Exception('%s model with booking resource mixin: \
                        can not find the chart_id according to the \
                        xml_id: %s' % (self._name, self._booking_chart_ref))
                resource = ir_model.get_object(cr, uid,
                                               xml_id[0],
                                               xml_id[1])
                resource_name = resource and \
                    resource.resource_model.model or False
                if resource_name:
                    for resource_id in model[resource_field_ref].ids:
                        resource_ref = "%s,%s" % (resource_name, resource_id)
                        ids.append({ref[1]: resource_ref})
            elif resource_field_ref not in model:
                raise Exception('Field %s does not exists in \
                model %s' % (resource_field_ref, self._name))
        return ids
	
	...

task()
```

----

## Update 12/11/2014
- New support for display days/hours style and interchangable with months/days style on the booking chart.
- Filtering resource and booking resources based on domain and context from mixin object.


###- Using Days/Hours display style or Months/Days display style:

```xml
<record id="bar_booking_view" model="ir.ui.view">
    ...
    <field name="arch" type="xml">
        <booking version="7.0">
            <items title="name" />
            <!-- base should be hours|days -->
            <calendar base="hours" timezone="+07:00">
                <date name="monday" start="09" end="23" />
                <date name="tuesday" start="09" end="21" />
                <date name="wednesday" start="09" end="22" />
                <date name="thursday" start="08" end="21" />
                <date name="friday" start="09" end="21" />
            </calendar>
        </booking>
    </field>
</record>
```

- `calendar` tag: addition tag to indicate the style of the booking chart, this tag is optional.

- `base` attribute: the style that booking chart will use to display can be:
    - `hours`: days/hours booking chart
    - `days`: months/days booking chart

- `timezone` attribute: the timezone to be applied on the resource data.
    - example: `+07:00`.
    - this attribute is mandatory if `base` is `hours`.
    - more information: [momentjs timezone offset](http://momentjs.com/docs/#/manipulating/timezone-offset/)

- `date` tag: define working days will be displayed on days/hours style booking chart.
    - `name`: name of week day (from monday to sunday).
    - `start`: start point (hour) of a day.
    - `end`: end point (hour) of a day.

**NOTICE**: if the resources is exceeded (start or end or both) or not defined in the list of week days, booking chart will throw an error and stop everything.

###- Filtering resources / booking resources for mixin object: 

- To applied filter on resources and booking resources, a context and domain should be applied.

**example on the `project.task` object:**

```python

def button_go_to_filtered_resources(self, cr, uid, ids, context=None):

    if context is None:
        context = {}

    # get object pool references
    resource_pool = self.pool.get('booking.resource')
    data_pool = self.pool.get('ir.model.data')

    # get the current clicking task
    _task = self.browse(cr, uid, ids[0], context=context)

    # get all related booking resources for this task
    domain = [('origin_ref', '=', u'{0},{1}'.format(self._name, ids[0]))]
    booking_resource_ids = resource_pool.search(cr, uid, domain, context=context)

    # get the booking chart id by xml
    booking_data = data_pool.xmlid_lookup(cr, uid, self._booking_chart_ref)

    # context to filter booking resources on the booking chart
    context.update({
        'booking_chart_id': booking_data[2],
        'booking_resource_domain': [('id', 'in', booking_resource_ids)]
    })

    # domain to filter resource on the booking chart
    domain = [
        ('id', 'in', [
            _task.user_id and _task.user_id.id,
            _task.reviewer_id and _task.reviewer_id.id
        ])
    ]

    return {
        'name': 'Task by users',
        'view_type': 'booking',
        'view_mode': 'booking',
        'res_model': 'res.users',
        'context': context,
        'domain': domain,
        'type': 'ir.actions.act_window',
    }
```

**On the `project.task` view:**

```xml
<field name="stage_id" position="before">
    <button string="Booking" type="object" class="oe_highlight" name="button_go_to_filtered_resources" />
</field>
```

**Things to notice from above example (function and the view):**

- The `context`:
    - `booking_chart_id` key: indicates which booking chart will be used for the mixin model.
    - `booking_resource_domain` key: domain will be used to filter booking resources (applied on `booking.resource` object)
    
- The `domain`:
    - This domain will be used to restrict the number of resources to be displayed on the booking chart.
    - The domain will be applied on mixin object model (in example is `project.task`)

## Dependencies

- [Web Unleashed module](https://github.com/trobz/openerp-web-unleashed "OpenERP Web Unleashed")     
This module provide native support of Backbone and Marionette, simplifing dramatically the creation of rich views in OpenERP.  
