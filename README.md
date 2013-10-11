## Introduction

The Booking Chart View provide an overview in a calendar for any OpenERP resources, you can have different type of resource booking in your calendar and you can freely associate them to any resources listed in rows.

Video Demo 

### Features

- display any resources in a booking chart
- easy scrolling navigation 
- resource lazy loading
- zoom levels (from 1 week to 6 months)
- auto-merge overlapping resources
- native OpenERP search/group supported on listed resources
- manual period selection
- period freeze/unfreeze button


## Key concepts

The booking chart is decoupled from OpenERP models, by this way you are totally free to display any resources in your chart, the counterpart is that you have to code the link between OpenERP models and your booking chart.

2 main model are used in the booking chart:

### booking_chart

A booking chart simply define from which model the chart will be created. Resources will be displayed as row in the chart, and Resource Booking have to make a reference to specific object from this model to be correctly displayed.

**model**
- name
- resource_model: ref to the model used to build the chart
- resource_domain


### booking_resource

A booking resource is the periodical element displayed in the chart, a reference can be made to any OpenERP object (origin).
The origin object form can be displayed by clicking on the booking resource. 

**model**
- name
- chart: ref to a booking_chart object
- resource_id: ref to a object id from the booking_chart model
- origin_model / origin_id: link a resource to any OpenERP object, used to keep a reference to the object at the origin of the booking resource
- date_start
- date_end
- css_class
- message
- tags


## Dependencies

- [Web Unleashed module](https://github.com/trobz/openerp-web-unleashed "OpenERP Web Unleashed")     
This module provide native support of Backbone and Marionnette, simplifing dramatically the creation of rich web application in OpenERP.  

## Setup / Use

The module itself is installable from the OpenERP module interface.

However, the booking chart doesn't work out of the box, because of the flexibility to link any models to it, you will have to
add some code to create/update the booking resources.
