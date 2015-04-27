# -*- coding: utf-8 -*-

from openerp.tests import common

import logging
from random import choice

_logger = logging.getLogger('openerp.booking.mixin.test')

class TestMixin(common.TransactionCase):
    
    def setUp(self):
        super(TestMixin, self).setUp()
        cr, uid = self.cr, self.uid
        
        self.broadcast = self.registry('tv.broadcast')
        self.channel = self.registry('tv.channel')
        self.episode = self.registry('tv.episode')
        
        self.chart = self.registry('booking.chart')
        self.resource = self.registry('booking.resource')
        
        self.channel_ids = self.channel.search(cr, uid, [])
        self.episode_ids = self.episode.search(cr, uid, [])

    def test_with_all_required_fields(self):
        cr, uid = self.cr, self.uid
        
        _logger.info('Test model creation with all required fields')
        
        id = self.broadcast.create(cr, uid, {
            'channel_id': choice(self.channel_ids),
            'episode_id': choice(self.episode_ids),
            'start': '2014-01-01 10:00:00',
            'end': '2014-01-01 11:00:00',
        })
        
        origin = 'tv.broadcast,%s' % id
        res_ids = self.resource.search(cr, uid, [
                    ('origin_ref', '=', origin),
                    ('date_start', '=', '2014-01-01 10:00:00'),
                    ('date_end', '=', '2014-01-01 11:00:00')])
        
        self.assertEqual(len(res_ids), 2, 'binded resource created')
    
        _logger.info('Test model update')
        
        self.broadcast.write(cr, uid, [id], {
            'channel_id': self.channel_ids[0],
        })

        resource = 'tv.channel,%s' % self.channel_ids[0]
        res_ids = self.resource.search(cr, uid, [
                    ('resource_ref', '=', resource),
                    ('origin_ref', '=', origin),
                    ('date_start', '=', '2014-01-01 10:00:00'),
                    ('date_end', '=', '2014-01-01 11:00:00')])
        
        self.assertEqual(len(res_ids), 1, 'binded resource created')
        
    def test_without_all_required_fields(self):
        cr, uid = self.cr, self.uid
        
        _logger.info('Test model creation without required fields')
        
        id = self.broadcast.create(cr, uid, {
            'channel_id': choice(self.channel_ids),
            'episode_id': choice(self.episode_ids),
        })
        
        origin = 'tv.broadcast,%s' % id
        res_ids = self.resource.search(cr, uid, [('origin_ref', '=', origin)])
        
        self.assertEqual(len(res_ids), 0, 'binded resource not created')
        
        self.broadcast.write(cr, uid, [id], {
            'start': '2014-01-01 10:00:00',
            'end': '2014-01-01 11:00:00',
        })

        res_ids = self.resource.search(cr, uid, [
                    ('origin_ref', '=', origin),
                    ('date_start', '=', '2014-01-01 10:00:00'),
                    ('date_end', '=', '2014-01-01 11:00:00')])
        
        self.assertEqual(len(res_ids), 2, 'binded resource created')
         
        _logger.info('Test model update')
        
        self.broadcast.write(cr, uid, [id], {
            'channel_id': self.channel_ids[0],
        })

        resource = 'tv.channel,%s' % self.channel_ids[0]
        res_ids = self.resource.search(cr, uid, [
                    ('resource_ref', '=', resource),
                    ('origin_ref', '=', origin),
                    ('date_start', '=', '2014-01-01 10:00:00'),
                    ('date_end', '=', '2014-01-01 11:00:00')])
        
        self.assertEqual(len(res_ids), 1, 'binded resource created')
        
    def test_resource_unlink(self):
        cr, uid = self.cr, self.uid
        
        _logger.info('Test model creation for future deletion')
        
        id = self.broadcast.create(cr, uid, {
            'channel_id': choice(self.channel_ids),
            'episode_id': choice(self.episode_ids),
            'start': '2014-01-01 10:00:00',
            'end': '2014-01-01 11:00:00',
        })
        
        origin = 'tv.broadcast,%s' % id
        res_ids = self.resource.search(cr, uid, [
                    ('origin_ref', '=', origin),
                    ('date_start', '=', '2014-01-01 10:00:00'),
                    ('date_end', '=', '2014-01-01 11:00:00')])
        
        self.assertEqual(len(res_ids), 2, 'binded resource created')
        
        _logger.info('Test model deletion')
        
        self.broadcast.unlink(cr, uid, [id])
        
        origin = 'tv.broadcast,%s' % id
        res_ids = self.resource.search(cr, uid, [
                    ('origin_ref', '=', origin)])
        
        self.assertEqual(len(res_ids), 0, 'no more binded resource')
