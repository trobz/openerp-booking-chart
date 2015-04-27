# -*- coding: utf-8 -*-

from openerp.osv import osv, fields
from datetime import datetime, timedelta

import logging

_logger = logging.getLogger('openerp.models.tv')


class tv_channel(osv.osv):

    _name = 'tv.channel'

    _columns = {
        'name': fields.char('Name'),
        'style': fields.selection((('documentary', 'Documentary'),
                                   ('education', 'Education'),
                                   ('entertainment', 'Entertainment'),
                                   ('movie', 'Movie'),
                                   ('music', 'Music'),
                                   ('news', 'News'),
                                   ('sf', 'Science Fiction'),
                                   ('sport', 'Sport')), string='Style'),
    }


class tv_serie(osv.osv):

    _name = 'tv.serie'

    _columns = {
        'name': fields.char('Name'),
        'genre': fields.selection((('action', 'Action'),
                                   ('adventure', 'Adventure'),
                                   ('comedy', 'Comedy'),
                                   ('drama', 'Drama'),
                                   ('horror', 'Horror'),
                                   ('epic', 'Epic'),
                                   ('sf', 'Science Fiction'),
                                   ('western', 'Western')), string='Genre'),
        'episode_ids': fields.one2many('tv.episode',
                                       'serie_id',
                                       string="Episodes"),
    }


class tv_episode(osv.osv):

    _name = 'tv.episode'

    _columns = {
        'name': fields.char('Name'),
        'number': fields.integer('Episode Number'),
        'season': fields.integer('Season Number'),
        'duration': fields.integer('Duration (s)'),
        'serie_id': fields.many2one('tv.serie', string="Serie"),
    }


class tv_broadcast(osv.osv):
    _name = 'tv.broadcast'

    _columns = {
        'channel_id': fields.many2one('tv.channel', string="Channel"),
        'episode_id': fields.many2one('tv.episode', string="Episode"),
        'start': fields.datetime('Start At'),
        'end': fields.datetime('End At'),
    }

    def _update_based_on_current_time(self, cr, uid, context=None):
        """
        Update start/end datetime based on the current datetime

        Useful to display broadcast in the current datetime range on
        booking charts.
        """
        datetime_format = '%Y-%m-%d %H:%M:%S'

        def parse_datetime(datetime_string):
            return datetime.strptime(datetime_string, datetime_format)

        def print_datetime(datetime_obj):
            return datetime_obj.strftime(datetime_format)

        broadcasts = self.search_read(cr, uid, [], ['start', 'end'])

        if broadcasts:
            today = datetime.today()
            start = parse_datetime(broadcasts[0]['start'])

            # only add range of 7 days (weeks) to avoid error on resources out
            # of the working days in booking charts by days
            nb_days_to_add = timedelta((today - start).days / 7 * 7)

            _logger.info('demo - update %s tv.broadcast record, add %s days',
                         len(broadcasts),
                         nb_days_to_add.days)

            for broadcast in broadcasts:
                start = parse_datetime(broadcast['start'])
                end = parse_datetime(broadcast['end'])

                self.write(cr, uid, broadcast['id'], {
                    'start': print_datetime(start + nb_days_to_add),
                    'end': print_datetime(end + nb_days_to_add),
                })
        else:
            _logger.warn('no broadcast record to update!')
