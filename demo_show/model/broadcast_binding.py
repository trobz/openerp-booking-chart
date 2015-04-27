# -*- coding: utf-8 -*-

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
