openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){
        
    openerp.testing.section('Overlap Collection', function (test) {
        
        var Connector = base.utils('Connector');
        var connection = null;
        var sync = function(method, model, options){
            return Connector[method].apply(Connector, [model, options, connection]);
        };
        
        var Overlap = booking.collections('Overlap'); 
            
        test('fetch', {templates: false, rpc: 'mock', asserts: 83 }, function (instance, $fixture, mock) {
            
            /*
                2013-10       01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 
                             |__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|__|
            test 1 - item 1  |  |-----------|  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
            test 2 - item 1  |  .  .  .  .  |-----------|  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
            test 3 - item 1  |  .  .  |--------------------------|  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
            test 4 - item 1  |  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  |--------------|  .  .  .  .  .  .  .
            test 5 - item 2  |  .  .  .  .  .  .  .  .  .  |--------|  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .
            test 6 - item 2  |  .  .  .  .  .  .  .  |--------------------|  .  .  .  .  .  .  .  .  .  .  .  .  .
            ~~~~~~~~~~~~~~~~~
            Manually inserted
            ~~~~~~~~~~~~~~~~~
            test 7 - item 2  |  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  |-----------|  .  .
            test 8 - item 2  |  .  .  .  .  .  .  |-----------|  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  . 
            ~~~~~~~~~~~~~~~~~
            Second fetch call
            ~~~~~~~~~~~~~~~~~
            test 9 - item 2  |  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  |-----------|  .  . 
            test 10 - item 2 |  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  |--------------|  . 
            test 11 - item 2 |  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  |--------|  .  .  .  .  .  . 
            test 12 - item 2 |  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  |--| 
            test 13 - item 2 |  .  .  .  .  .  .  .  .  .  |-----------------------------|  .  .  .  .  .  .  .  . 
            test 14 - item 2 |  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  |--| 
            */           
            
            //fake response to JSON-RPC call
            var first_call = true;
            mock('/web/dataset/search_read', function (call) {
                var records = [
                    { 
                        records: [
                            {id: 1, name: 'test 1', item_id: 1, start_at: '2013-10-02', end_at: '2013-10-05' },
                            {id: 2, name: 'test 2', item_id: 1, start_at: '2013-10-06', end_at: '2013-10-09' },
                            {id: 3, name: 'test 3', item_id: 1, start_at: '2013-10-04', end_at: '2013-10-12' },
                            {id: 4, name: 'test 4', item_id: 1, start_at: '2013-10-17', end_at: '2013-10-21' },
                            {id: 5, name: 'test 5', item_id: 2, start_at: '2013-10-11', end_at: '2013-10-13' },
                            {id: 6, name: 'test 6', item_id: 2, start_at: '2013-10-09', end_at: '2013-10-15' }
                        ]
                    },
                    { 
                        records: [
                            {id: 9, name: 'test 9', item_id: 2, start_at: '2013-10-23', end_at: '2013-10-26' },
                            {id: 10, name: 'test 10', item_id: 2, start_at: '2013-10-23', end_at: '2013-10-27' },
                            {id: 11, name: 'test 11', item_id: 2, start_at: '2013-10-20', end_at: '2013-10-22' },
                            {id: 12, name: 'test 12', item_id: 2, start_at: '2013-10-28', end_at: '2013-10-28' },
                            {id: 13, name: 'test 13', item_id: 2, start_at: '2013-10-11', end_at: '2013-10-20' },
                            {id: 14, name: 'test 14', item_id: 2, start_at: '2013-10-28', end_at: '2013-10-28' },
                        ]
                    },
                ];
                
                
                var ret = first_call ? records[0] : records[1];
                first_call = false;
                return ret;
            });
            
            var additional_data = [
                {id: 7, name: 'test 7', item_id: 2, start_at: '2013-10-23', end_at: '2013-10-26' },
                {id: 8, name: 'test 8', item_id: 2, start_at: '2013-10-08', end_at: '2013-10-11' }
            ];
            
            // test
            var def = $.Deferred();
            
            connection = instance.web.Model;
            
            var List = Overlap.extend({
                model_name: 'unit.test',
                sync: sync
            });
            
            var list = new List([], {
                attr_date_start: 'start_at',
                attr_date_end: 'end_at',
                attr_group_by: 'item_id'
            });
            
            list.fetch().done(function(){
                
                
                strictEqual(list.isGroup(), false, 'list is not a group');
            
                strictEqual(_.size(list.groups()), 3, 'collection has 3 overlaps');
                
                _.each(list.groups(), function(group){
                    if(group.length == 1){
                        strictEqual(group.item_id, 1, 'group with 1 element is linked to item 1');
                        strictEqual(group.period().start('s'), '2013-10-17', 'group on item 1 with 1 element start the 2013-10-17');
                        strictEqual(group.period().end('s'), '2013-10-21', 'group on item 1 with 1 element end the 2013-10-21');
                    }
                    else if(group.length == 2){
                        strictEqual(group.item_id, 2, 'group with 2 elements is linked to item 2');
                        strictEqual(group.period().start('s'), '2013-10-09', 'group on item 2 with 2 elements start the 2013-10-09');
                        strictEqual(group.period().end('s'), '2013-10-15', 'group on item 2 with 2 elements end the 2013-10-15');
                    }
                    else if(group.length == 3){
                        strictEqual(group.item_id, 1, 'group with 3 elements is linked to item 1');
                        strictEqual(group.period().start('s'), '2013-10-02', 'group on item 1 with 3 elements start the 2013-10-02');
                        strictEqual(group.period().end('s'), '2013-10-12', 'group on item 1 with 3 elements end the 2013-10-12');
                    }
                });
                
                strictEqual(list.max, 3, 'the biggest group has 3 elements');
                
            
                list.add(additional_data);
            
                strictEqual(_.size(list.groups()), 4, 'collection has 4 overlaps after manual push');
                
                _.each(list.groups(), function(group){
                    if(group.length == 1 && group.item_id == 1){
                        strictEqual(group.item_id, 1, 'group with 1 element is linked to item 1');
                        strictEqual(group.period().start('s'), '2013-10-17', 'group on item 1 with 1 element start the 2013-10-17');
                        strictEqual(group.period().end('s'), '2013-10-21', 'group on item 1 with 1 element end the 2013-10-21');
                    }
                    else if(group.length == 3 && group.item_id == 1){
                        strictEqual(group.item_id, 1, 'group with 3 elements is linked to item 1');
                        strictEqual(group.period().start('s'), '2013-10-02', 'group on item 1 with 3 elements start the 2013-10-02');
                        strictEqual(group.period().end('s'), '2013-10-12', 'group on item 1 with 3 elements end the 2013-10-12');
                    }
                    else if(group.length == 1 && group.item_id == 2){
                        strictEqual(group.item_id, 2, 'group with 1 elements is linked to item 2');
                        strictEqual(group.period().start('s'), '2013-10-23', 'group on item 2 with 2 elements start the 2013-10-23');
                        strictEqual(group.period().end('s'), '2013-10-26', 'group on item 2 with 2 elements end the 2013-10-26');
                    }
                    else if(group.length == 3 && group.item_id == 2){
                        strictEqual(group.item_id, 2, 'group with 3 elements is linked to item 2');
                        strictEqual(group.period().start('s'), '2013-10-08', 'group on item 2 with 3 elements start the 2013-10-08');
                        strictEqual(group.period().end('s'), '2013-10-15', 'group on item 2 with 3 elements end the 2013-10-15');
                    }
                    else {
                        console.log('group no conform', group, group.item_id, group.period().start('s'), group.period().end('s'));
                        throw new Error('group "' + group.options.index + '" is not conform');
                    }
                });
                
                strictEqual(list.max, 3, 'the biggest group has 3 elements');
                
                // test errors
                var message = "";
                list.on('invalid', function(model, error, options){
                    message = options.validationError.message;
                });
            
                list.add({id: 9, name: 'test 9', start_at: '2013-10-23', end_at: '2013-10-27' });
                strictEqual(message, 'attribute "item_id" is not defined', 'validation error when the model does not have a required attribute');
                    
                list.add({id: 9, name: 'test 9', item_id: 1, start_at: 'foobar', end_at: '2013-10-27' });
                strictEqual(message, 'start date "foobar" is not valid', 'validation error when a date is not valid');
                    
                list.add({id: 9, name: 'test 9', item_id: 1, start_at: '2015-01-01', end_at: '2013-10-27' });
                strictEqual(message, 'start date "2015-01-01" is greater than end date "2013-10-27"', 'validation error when the start date is greater than the end date');
                
                strictEqual(list.length, 8, 'list still have 8 models');
                strictEqual(_.size(list.groups()), 4, 'list still have 4 overlaps');
            
                // test remove
            
                list.add({id: 9, name: 'test 9', item_id: 1, start_at: '2013-10-11', end_at: '2013-10-18' });
                
                strictEqual(list.length, 9, 'list have 9 models');
                strictEqual(_.size(list.groups()), 3, 'list have 3 overlaps');
            
                _.each(list.groups(), function(group){
                    if(group.length == 5 && group.item_id == 1){
                        strictEqual(group.item_id, 1, 'group with 5 elements is linked to item 1');
                        strictEqual(group.period().start('s'), '2013-10-02', 'group on item 1 with 5 elements start the 2013-10-02');
                        strictEqual(group.period().end('s'), '2013-10-21', 'group on item 1 with 5 elements end the 2013-10-21');
                    }
                });
                
                strictEqual(list.max, 5, 'the biggest group has 5 elements');
                
                
                list.remove({id: 9, name: 'test 9', item_id: 1, start_at: '2013-10-11', end_at: '2013-10-18' });
               
                strictEqual(list.length, 8, 'list have 8 models');
                strictEqual(_.size(list.groups()), 4, 'list have 4 overlaps');
            
                _.each(list.groups(), function(group){
                    
                    if(group.length == 1 && group.item_id == 1){
                        strictEqual(group.item_id, 1, 'group with 1 element is linked to item 1');
                        strictEqual(group.period().start('s'), '2013-10-17', 'group on item 1 with 1 element start the 2013-10-17');
                        strictEqual(group.period().end('s'), '2013-10-21', 'group on item 1 with 1 element end the 2013-10-21');
                    }
                    else if(group.length == 3 && group.item_id == 1){
                        strictEqual(group.item_id, 1, 'group with 3 elements is linked to item 1');
                        strictEqual(group.period().start('s'), '2013-10-02', 'group on item 1 with 3 elements start the 2013-10-02');
                        strictEqual(group.period().end('s'), '2013-10-12', 'group on item 1 with 3 elements end the 2013-10-12');
                    }
                    else if(group.length == 1 && group.item_id == 2){
                        strictEqual(group.item_id, 2, 'group with 1 elements is linked to item 2');
                        strictEqual(group.period().start('s'), '2013-10-23', 'group on item 2 with 2 elements start the 2013-10-23');
                        strictEqual(group.period().end('s'), '2013-10-26', 'group on item 2 with 2 elements end the 2013-10-26');
                    }
                    else if(group.length == 3 && group.item_id == 2){
                        strictEqual(group.item_id, 2, 'group with 3 elements is linked to item 2');
                        strictEqual(group.period().start('s'), '2013-10-08', 'group on item 2 with 3 elements start the 2013-10-08');
                        strictEqual(group.period().end('s'), '2013-10-15', 'group on item 2 with 3 elements end the 2013-10-15');
                    }
                    else {
                        console.log('group no conform', group, group.item_id, group.period().start('s'), group.period().end('s'));
                        throw new Error('group "' + group.options.index + '" is not conform');
                    }
                    
                });
                
                strictEqual(list.max, 3, 'the biggest group has 3 elements');
                
                //test second fetch with merge
                list.fetch({remove: false}).done(function(){
                
                    strictEqual(list.length, 14, 'list have 14 models');
                    strictEqual(_.size(list.groups()), 5, 'list have 5 overlaps');
                    
                    var updated = 0, created = 0;
                    _.each(list.groupChanged(), function(group){
                        created = group.status.created ? created + 1 : created;
                        updated = group.status.updated ? updated + 1 : updated;
                    });
                    
                    strictEqual(created, 2, '2 groups has been created');
                    strictEqual(updated, 3, '3 groups has been updated');
                    strictEqual(list.groupRemoved().length, 2, '2 groups has been removed');
                    
                    _.each(list.groups(), function(group){
                    
                        if(group.length == 1 && group.item_id == 1){
                            strictEqual(group.item_id, 1, 'group with 1 element is linked to item 1');
                            strictEqual(group.period().start('s'), '2013-10-17', 'group on item 1 with 1 element start the 2013-10-17');
                            strictEqual(group.period().end('s'), '2013-10-21', 'group on item 1 with 1 element end the 2013-10-21');
                        
                            strictEqual(group.status.created, false, 'the group is not new');
                            strictEqual(group.status.updated, false, 'the group has not been updated');
                        }
                        else if(group.length == 3 && group.item_id == 1){
                            strictEqual(group.item_id, 1, 'group with 3 elements is linked to item 1');
                            strictEqual(group.period().start('s'), '2013-10-02', 'group on item 1 with 3 elements start the 2013-10-02');
                            strictEqual(group.period().end('s'), '2013-10-12', 'group on item 1 with 3 elements end the 2013-10-12');
                        
                            strictEqual(group.status.created, false, 'the group is not new');
                            strictEqual(group.status.updated, false, 'the group has not been updated');
                        }
                        else if(group.length == 2 && group.item_id == 2 && group.period().start('s') == '2013-10-28'){
                            strictEqual(group.item_id, 2, 'group with 2 elements is linked to item 2');
                            strictEqual(group.period().start('s'), '2013-10-28', 'group on item 2 with 2 elements start the 2013-10-28');
                            strictEqual(group.period().end('s'), '2013-10-28', 'group on item 2 with 2 elements end the 2013-10-28');
                        
                            strictEqual(group.status.created, true, 'the group is new');
                            strictEqual(group.status.updated, true, 'the group has been updated');
                        }
                        else if(group.length == 3 && group.item_id == 2 && group.period().start('s') == '2013-10-23'){
                            strictEqual(group.item_id, 2, 'group with 3 elements is linked to item 2');
                            strictEqual(group.period().start('s'), '2013-10-23', 'group on item 2 with 3 elements start the 2013-10-23');
                            strictEqual(group.period().end('s'), '2013-10-27', 'group on item 2 with 3 elements end the 2013-10-27');
                        
                            strictEqual(group.status.created, false, 'the group is not new');
                            strictEqual(group.status.updated, true, 'the group has been updated');
                        }
                        else if(group.length == 5 && group.item_id == 2 && group.period().start('s') == '2013-10-08'){
                            strictEqual(group.item_id, 2, 'group with 5 elements is linked to item 2');
                            strictEqual(group.period().start('s'), '2013-10-08', 'group on item 2 with 5 elements start the 2013-10-08');
                            strictEqual(group.period().end('s'), '2013-10-22', 'group on item 2 with 5 elements end the 2013-10-22');
                        
                            strictEqual(group.status.created, true, 'the group is new');
                            strictEqual(group.status.updated, true, 'the group has been updated');
                        }
                        else {
                            console.log('group no conform', group, group.item_id, group.period().start('s'), group.period().end('s'));
                            throw new Error('group "' + group.options.index + '" is not conform');
                        }
                        
                    });    
                
                	strictEqual(list.max, 5, 'the biggest group has 5 elements');
                                
                    def.resolve();
                });
                
            });
            
            
            
            
            return def.promise();
        });
    
    });    
    
});
