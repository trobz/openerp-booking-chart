Booking Chart Models
====================

There are 2 main models used in the booking chart:

booking\_chart
--------------

::

    - name
    - resource_model        // ref to the model used to build the chart, used to list resources, 
                            // search/group_by queries are applied on this model
    - resource_domain       // force some additional domains, added when resource_model are retrieved
    - supported_model_ids   // list of model supported by resources booking  
                            // for origin and/or target (required for fields.reference selection)

A booking chart define from which model the chart will be created.
Resources will be displayed as row in the chart and Resource Booking
have to make a reference to specific object from this model to be
correctly displayed.

booking\_resource
-----------------

::

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

A resource booking is the periodical element displayed in the chart, the
object at the origin of the resource booking can be any OpenERP model
(origin\_ref). If a target object is defined, it will be displayed in a
form view at click on the resource booking.

Setup / Use
===========

The module itself is installable from the OpenERP module interface.

However, the booking chart doesn't work out of the box, because of the
flexibility to link any models, you will have to add some code to
create/update/delete resources booking.

A mixin helper is available but you can implement your own logic to keep
your resources booking up to date with an other model.

``booking.resource`` and ``booking.chart`` views
------------------------------------------------

Views are available to directly edit booking models, these views are
only accessible to users with the "Technical Features" enabled.

| Access to booking chart model views:
| ``Settings > Technical > Booking Chart``

Configuration
=============

Booking chart by days
---------------------

The booking chart support some ``arch`` view configuration:

-  tag ``<items>``

   -  attribute ``title``:
      field from ``booking_chart.resource_model`` to display in the booking list

-  tag ``<calendar>``

   -  attribute ``base``:
      define the display type, ``days`` or ``hours``. Use ``days`` configuration by default.
   -  attribute ``timezone``:
      The calendar timezone, we decided to fix it instead of having a
      dynamic timezone based on the current user configuration because
      most of the time (e.g. room booking, etc...) the booking will be
      based on a specific geo-location, not related to the user
      connected. Actually, not geo-located booking (e.g. online meeting,
      etc...) are not supported.
      More information about the `momentjs timezone offset <http://momentjs.com/docs/#/manipulating/timezone-offset/>`_.

-  tag ``<date>``

   In hours mode, working days can be defined, with a range of hours to
   display.
   Booking resource have to exists in defined ranges or an exception
   would be raised, it's up to the developer to ensure that booking
   resource are not created outside ranges.

   -  attribute ``name``:
      day name: ``monday``, ``tuesday``, ``wednesday``, ``thursday``, ``friday``, ``saturday``, ``sunday``

   -  attribute ``start``: start time of the day
   -  attribute ``end``: end time of the day

**example 1: booking chart by days**

.. code:: xml

    <record id="bar_booking_view" model="ir.ui.view">
        ...
        <field name="arch" type="xml">
            <booking version="7.0">
                <items title="name" />
                <calendar base="days" timezone="+01:00" />
            </booking>
        </field>
    </record>

**example 2: booking chart by hours**

.. code:: xml

    <record id="foo_booking_view" model="ir.ui.view">
        ...
        <field name="arch" type="xml">
            <booking version="7.0">
                <items title="name" />
                <calendar base="hours" timezone="+01:00">
                    <date name="monday" start="09" end="23" />
                    <date name="tuesday" start="09" end="23" />
                    <date name="wednesday" start="09" end="23" />
                    <date name="thursday" start="10" end="20" />
                    <date name="friday" start="10" end="20" />
                </calendar>
            </booking>
        </field>
    </record>

Model Mixin
-----------

To simplify this task, mixin model is available in
``booking_chart.mixin``, this mixin is used by the ``demo_show`` module.

Basically, only a mapping between your model and some booking.chart has
to be done.

The mixin is designed to automatically create, update and delete
resources booking associated with the model.

**example from "demo_show" module**

This example will bind ``tv.broadcast`` records with 2 booking charts.
Specific methods are used to generate the ``booking.resource`` name, css
class, etc...

.. code:: python

    from openerp.osv import fields
    from openerp.addons.booking_chart.mixin import mixin

    class tv_broadcast(mixin.resource):
        _inherit = 'tv.broadcast'

        # mapping methods for tv_channel_booking_chart

        def _episode_name(self, broadcast):
            episode = broadcast.episode_id
            return '%s / S%02dE%02d' % (episode.serie_id.name, 
                                        episode.season,
                                        episode.number)

        def _episode_desc(self, broadcast):
            episode = broadcast.episode_id
            return '%s / %s (S%02dE%02d)' % (episode.serie_id.name,
                                             episode.name,
                                             episode.season,
                                             episode.number)

        def _episode_color(self, broadcast):
            genre = broadcast.episode_id.serie_id.genre

            color_map = {
                'action': 'red', 'adventure': 'green', 'comedy': 'blue',
                'drama': 'black', 'horror': 'red', 'epic': 'light-blue',
                'sf': 'yellow', 'western': 'orange'
            }

            return color_map[genre]

        # mapping methods for tv_serie_booking_chart

        def _channel_name(self, broadcast):
            return broadcast.channel_id.name

        def _channel_desc(self, broadcast):
            episode = broadcast.episode_id
            return '%s (S%02dE%02d)' % (episode.name,
                                        episode.season,
                                        episode.number)

        def _serie_ref(self, broadcast):
            return 'tv.serie,%s' % broadcast.episode_id.serie_id.id

        def _channel_color(self, broadcast):
            style = broadcast.channel_id.style

            color_map = {
                'documentary': 'light-green', 'education': 'blue',
                'entertainment': 'green', 'movie': 'black',
                'music': 'red', 'news': 'light-blue', 'sf': 'orange', 
                'sport': 'yellow'
            }

            return color_map[style]


        _booking_chart_mapping = {
            'demo_show.tv_channel_booking_chart': {
                'name':         _episode_name,
                'message':      _episode_desc,
                'date_start':   'start',
                'date_end':     'end',
                'resource_ref': 'channel_id',
                'css_class':    _episode_color,
            },
            'demo_show.tv_serie_booking_chart': {
                'name':         _channel_name,
                'message':      _episode_desc,
                'date_start':   'start',
                'date_end':     'end',
                'resource_ref': _serie_ref,
                'css_class':    _channel_color,
            }
        }

**Note**: the mixin has not been ported yet to the new Odoo API.

Filtering resources / booking resources for mixin object:
---------------------------------------------------------

-  To applied filter on resources and booking resources, a context and
   domain should be applied.

**example on the "project.task" object:**

.. code:: python


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

**On the "project.task" view:**

.. code:: xml

    <field name="stage_id" position="before">
        <button string="Booking" type="object" class="oe_highlight" name="button_go_to_filtered_resources" />
    </field>

**Things to notice from above example (function and the view):**

-  The ``context``:

   -  ``booking_chart_id`` key: indicates which booking chart will be
      used for the mixin model.
   -  ``booking_resource_domain`` key: domain will be used to filter
      booking resources (applied on ``booking.resource`` object)

-  The ``domain``:

   -  This domain will be used to restrict the number of resources to be
      displayed on the booking chart.
   -  The domain will be applied on mixin object model (in example is
      ``project.task``)

Dependencies
============

-  `Web Unleashed
   module <https://github.com/trobz/openerp-web-unleashed>`__
   This module provide native support of Backbone and Marionette,
   simplifing dramatically the creation of rich views in OpenERP.