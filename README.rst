.. image:: https://img.shields.io/badge/licence-AGPL--3-blue.svg
   :target: http://www.gnu.org/licenses/agpl-3.0-standalone.html
   :alt: License: AGPL-3

|Build Status|

=====================
OPENERP BOOKING CHART
=====================

Introduction
============

The Booking Chart View provide an overview in a calendar for any OpenERP
resources, you can have different type of resource booking in your
calendar and you can freely associate them to any resources listed in
rows.

`Video Demo <http://booking-chart.trobz.com>`__

Features
--------

-  Display any resources in a booking chart
-  Easy scrolling navigation
-  Resource lazy loading
-  Zoom levels (from 1 week to 6 months)
-  Auto-merge overlapping resources
-  Native OpenERP search/group supported on listed resources
-  Manual period selection
-  Period freeze/unfreeze button
-  Mixin to link any OpenERP model with resources booking

Key concepts
============

The booking chart is decoupled from OpenERP models, by this way you are
totally free to display any resources in your chart, the counterpart is
that you have to code the link between OpenERP models and your booking
chart.

We decide to go on this direction instead of having an OpenERP
gantt-like configuration in ``arch`` tag because our module need to link
booking chart to multiple models, with different logics, and it's hard
to achieve this with just some configuration.

.. |Build Status| image:: https://travis-ci.org/trobz/openerp-booking-chart.png?branch=master
   :target: https://travis-ci.org/trobz/openerp-booking-chart