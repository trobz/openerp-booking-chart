openerp.unleashed.module('booking_chart', function(booking, _, Backbone, base){

    openerp.testing.section('Overlap Hour Collection', function (test) {

        var Connector = base.utils('Connector'),
            Model = null;

        var sync = function(method, model, options){
            if(!model.model_name){
                throw base.error('The "model_name" is not defined on Backbone Model.');
            }

            // compound query context with user context
            options = options || {};

            // instantiate a JSON-RPC model object to communicate with OpenERP by JSON-RPC
            var connection = new Model(
                model.model_name,
                options.context
            );

            return Connector[method].apply(Connector, [model, options, connection]);
        };

        var Overlap = booking.collections('Overlap');

        test('fetch', {templates: false, rpc: 'mock', asserts: 34 }, function (instance, $fixture, mock) {

            Model = instance.web.Model;

/*
CASE 1:
- add item1 - res1: 14:00:00 -> 14:11:00
- add item1 - res2: 14:14:00 -> 14:24:00
- add item2 - res3: 14:08:00 -> 14:18:00
>> NO OVERLAPPED
    >> group 1 - item1 :: no overlapped
    >> group 2 - item1 :: no overlapped
    >> group 3 - item2 :: no overlapped
===================================================================================================
14:00                         14:15                         14:30                         14:45
  |                             |                             |                             |
' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' "
  {------item1-res1-----}
                              {----item1-res2-----}
                  {----item2-res3-----}


CASE 2:
- add item1 - res4: 14:09:00 -> 14:18:00
>> 1 OVERLAPPED
    >> group 1 - item1 :: overlapped with res1, res2, res4
    >> group 2 - item2 :: no-overlapped
===================================================================================================
14:00                         14:15                         14:30                         14:45
  |                             |                             |                             |
' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' "
  {---------------------GROUP---------------------}
  {------item1-res1-----}
                              {----item1-res2-----}
                  {----item2-res3-----}
                  {----item1-res4-----}


CASE 3:
- remove item1 - res2: 14:14:00 -> 14:24:00
- add item2 - res5: 14:21:00 -> 14:31:00
>> 1 OVERLAPPED
    >> group 1 - item1 :: overlapped with res1, res4 => period is updated to be shorter than case 2
    >> group 2 (1) - item2 :: no-overlapped
    >> group 2 (2) - item2 :: no-overlapped
===================================================================================================
14:00                         14:15                         14:30                         14:45
  |                             |                             |                             |
' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' "
  {---------------GROUP---------------}
  {------item1-res1-----}
                  {----item2-res3-----}
                  {----item1-res4-----}
                                            {----item2-res5-----}


CASE 4:
- add res6 - item1: 14:31:00 -> 14:41:00
>> 1 OVERLAPPED
    >> group 1 - item1 :: overlapped with res1, res4 => period is the same as case 3
    >> group 2 - item2 (1):: res3 is in one group and there is no overlap
    >> group 2 - item2 (2):: res5 and res6 should not be merged -> there is no overlapped

===================================================================================================
14:00                         14:15                         14:30                         14:45
  |                             |                             |                             |
' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' "
  {---------------GROUP---------------}
  {------item1-res1-----}
                  {----item2-res3-----}
                  {----item1-res4-----}
                                            {----item2-res5-----}
                                                                {----item2-res6-----}


CASE 5:
- remove res6 - item2
- add res7 - item2: 14:20:00 -> 14:36:00
>> 1 OVERLAPPED
    >> group 1 - item1 :: overlapped with res1, res4 => period is the same as case 4
    >> group 2 - item2 (1):: res3 is in one group and there is no overlap
    >> group 2 - item2 (2):: res5 and res7 now are overlapped

===================================================================================================
14:00                         14:15                         14:30                         14:45
  |                             |                             |                             |
' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' " ' ' ' ' "
  {---------------GROUP---------------}
  {------item1-res1-----}
                  {----item2-res3-----}
                  {----item1-res4-----}
                                            {----item2-res5-----}
                                          {------------item2-res7---------}
*/

            mock('/web/dataset/search_read', function (call) {
                var records = {
                    records: [
                        {item_id: 1, id: 1, name: 'res 1', start_at: '2014-10-01 14:00:00', end_at: '2014-10-01 14:11:00'},
                        {item_id: 1, id: 2, name: 'res 2', start_at: '2014-10-01 14:14:00', end_at: '2014-10-01 14:24:00'},
                        {item_id: 2, id: 3, name: 'res 3', start_at: '2014-10-01 14:08:00', end_at: '2014-10-01 14:18:00'},
                    ]
                };
                return records;
            });

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

                // the list should contains groups - list is just a collection of group
                // but the overlapped data (resource) is contains in a groups
                // so: list -> groups -> models (resources)
                strictEqual(list.isGroup(), false, 'list is not a group');

                // =====================================================================
                // FIRST CASE
                // =====================================================================

                // res1 and res2 on item1 should not be grouped - the same for res3 on item2 - 3 separated groups
                strictEqual(_.size(list.groups()), 3, 'FIRST :: list has 3 groups and there is no overlaps ---------------------');

                // check resource models on each group (list.groups is === list.data.groups)
                _.each(list.groups(), function(group){
                    var title = '>> group - item' + group.item_id;
                    var period = group.period().start('s') + ' -> ' + group.period().end('s');
                    var res_models = _.map(group.models, function(model){ return model.get('name')}).join();
                    var message = title + ' :: 1 resource model :: ' + res_models +  ' :: ' + period;

                    strictEqual(_.size(group.models), 1, message);
                });

                // =====================================================================
                // SECOND CASE :: ITEM 1 IS OVERLAPPED
                // =====================================================================

                // add res4 - item1 into the list
                list.add({item_id: 1, id: 4, name: 'res 4', start_at: '2014-10-01 14:08:00', end_at: '2014-10-01 14:18:00' });

                // after check, this should be only one group because there is an overlapped here for item 1
                strictEqual(_.size(list.groups()), 2, 'SECOND :: list has 2 groups and there is 1 overlaps for item1 ----------');

                // check overlap and period on groups
                _.each(list.groups(), function(group){

                    // group for item1 contains overlapped resource models
                    if(group.item_id === 1){
                        strictEqual(_.size(group.models), 3, 'group item1 is overlapped with 3 resource models');
                        strictEqual(_.map(group.models, function(model){return model.get('name')}).join(), 'res 1,res 2,res 4', '>> group item1 contains :: res 1,res 2,res 4');
                        strictEqual(group.period().start('m'), '2014-10-01 14:00:00', '>> group item1 start at 2014-10-01 14:00:00');
                        strictEqual(group.period().end('m'), '2014-10-01 14:24:00', '>> group item1 end at 2014-10-01 14:24:00');
                    }
                    // group for item2 contains only one resource model
                    else if(group.item_id === 2){
                        strictEqual(_.size(group.models), 1, 'group item2 should contain only 1 resource model');
                        strictEqual(_.map(group.models, function(model){return model.get('name')}).join(), 'res 3', '>> group item2 contains :: res 3');
                        strictEqual(group.period().start('m'), '2014-10-01 14:08:00', '>> group item1 start at 2014-10-01 14:08:00');
                        strictEqual(group.period().end('m'), '2014-10-01 14:18:00', '>> group item1 end at 2014-10-01 14:18:00');
                    }
                });

                strictEqual(list.max, 3, 'the biggest group has 3 elements'); // group item1

                // =====================================================================
                // THIRD CASE :: REMOVE RES2 - ITEM 1, ADD RES 5 - ITEM 2
                // =====================================================================

                // remove res2 - item1 from the list
                list.remove({item_id: 1, id: 2, name: 'res 2', start_at: '2014-10-01 14:14:00', end_at: '2014-10-01 14:24:00'});
                list.add({item_id: 2, id: 5, name: 'res 5', start_at: '2014-10-01 14:21:00', end_at: '2014-10-01 14:31:00'});

                strictEqual(_.size(list.groups()), 3, 'THIRD :: list contains 3 groups ------------------------------------------');

                _.each(list.groups(), function(group){

                    if(group.item_id === 1){

                        strictEqual(_.size(group.models), 2, 'group item 1 is overllapped and contains 2 resource models');
                        strictEqual(group.period().start('m'), '2014-10-01 14:00:00', 'group item 1 start at 2014-10-01 14:00:00');
                        strictEqual(group.period().end('m'), '2014-10-01 14:18:00', 'group item 1 start at 2014-10-01 14:18:00');
                    }
                    else if(group.item_id === 2){
                        var res = _.map(group.models, function(model){ return model.get("name")}).join();
                        strictEqual(_.size(group.models), 1, 'group item 2 is not overlapped and contains ' + res);
                    }
                });

                strictEqual(list.max, 2, 'the biggest group has 2 elements'); // group item1

                // =====================================================================
                // FOURTH CASE :: ADD RES 6 - ITEM 2 :: 14:31:00 -> 14:41:00
                // =====================================================================

                list.add({item_id: 2, id: 6, name: 'res 6', start_at: '2014-10-01 14:31:00', end_at: '2014-10-01 14:41:00'});

                strictEqual(_.size(list.groups()), 4, 'FOURTH:: List now have 4 groups -----------------------');

                _.each(list.groups(), function(group){

                    if(group.item_id === 1){
                        strictEqual(_.size(group.models), 2, "item1 overlapped with 2 model inside");
                        strictEqual(group.period().start('m'), "2014-10-01 14:00:00", "start moment of item1 group should be 2014-10-01 14:00:00");
                        strictEqual(group.period().end('m'), "2014-10-01 14:18:00", "end moment of item1 group should be 2014-10-01 14:18:00");
                    }
                    else if(group.item_id === 2){
                        strictEqual(_.size(group.models), 1, "groups for item2 have no overlap, only one model in a group");
                    }
                });

                // =====================================================================
                // FIFTH CASE :: REMOVE RES 6, ADD RES 7 - ITEM 2 :: 14:20:00 -> 14:36:00
                // =====================================================================

                list.remove({item_id: 2, id: 6, name: 'res 6', start_at: '2014-10-01 14:31:00', end_at: '2014-10-01 14:41:00'});
                list.add({item_id: 2, id: 7, name: 'res 7', start_at: '2014-10-01 14:20:00', end_at: '2014-10-01 14:36:00'});

                strictEqual(_.size(list.groups()), 3, 'FIFTH:: List now have 3 groups -----------------------');

                _.each(list.groups(), function(group){

                    if(group.item_id === 2){

                        if(_.size(group.models) === 1){
                            strictEqual(group.models[0].get("name"), "res 3", "item2 first group contains only res3 model")
                        }
                        else if(_.size(group.models) === 2){
                            var models = _.map(group.models, function(model){ return model.get("name")}).join();
                            strictEqual(models, "res 5,res 7", "item2 second group contains res5 and res7 models");
                            strictEqual(group.period().start("m"), "2014-10-01 14:20:00", "start moment item2 should be 2014-10-01 14:20:00");
                            strictEqual(group.period().end("m"), "2014-10-01 14:36:00", "end moment item2 should be 2014-10-01 14:36:00");
                        }
                    }
                });

                def.resolve();
            });

            return def.promise();
        });
    });
});
