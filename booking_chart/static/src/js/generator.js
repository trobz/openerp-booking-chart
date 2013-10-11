openerp.unleashed.module('booking_chart').ready(function(instance, booking, _, Backbone, base) {
    
    var QWeb = instance.web.qweb;
    
    // Debugging action, should be removed in production
    var Resource = booking.models('Resource');
        
    instance.web.client_actions.add('booking.debug.generator', 'instance.booking_chart.DataGenerator');
    instance.booking_chart.DataGenerator = instance.web.Widget.extend({
        events: {
            'click .generate': 'run'
        },
        
        start: function () {
            this.displayForm();
            return this._super();
        },
        
        displayForm: function(){
            var html = QWeb.render('Booking.Debug.Generator');
            this.$el.html(html);
            this.$form = this.$el.find('.debug-form');
            this.$res = this.$el.find('.debug-result ul');
            
        },
        
        run: function(){
            this.$res.html('');
            try {
                this.generate();
            }
            catch(e){
                console.log(e);
                console.trace();
                this.$res.append(
                    $('<li class="error">').text(e.message)
                );
            }
        },
        
        generate: function(){
            
            var datas = {
                'All': [
                /*    {name: 'Business Trip', nb: 1, min: 15, max: 25, color: 'light-blue', desc: ['USA', 'Mexico', 'France', 'China', 'Germany', 'UK']}, */
                ],
                'Scientist': [
                    {name: 'Meeting', nb: 3, min: 1, max: 2, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer'], follow: true},
                    {name: 'Research', nb: 10, min: 5, max: 15, color: 'green', desc: ['physic', 'atom', 'chemistry', 'biology', 'nano-technology'], follow: true},
                    {name: 'Experimentation', nb: 10, min: 5, max: 10, color: 'orange', desc: [], follow: true},
                ],
                'Engineer': [
                    {name: 'Meeting', nb: 3, min: 1, max: 2, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer'], follow: true},
                    {name: 'Development', nb: 10, min: 5, max: 15, color: 'green', desc: [], follow: true},
                    {name: 'Test', nb: 10, min: 5, max: 10, color: 'orange', desc: [], follow: true},
                ],
                'Developer': [
                    {name: 'Meeting', nb: 3, min: 1, max: 2, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer'], follow: true},
                    {name: 'Development', nb: 10, min: 5, max: 15, color: 'green', desc: [], follow: true},
                    {name: 'Test', nb: 10, min: 5, max: 10, color: 'light-pink', desc: [], follow: true},
                    {name: 'Deployment', nb: 10, min: 5, max: 10, color: 'orange', desc: [], follow: true},
                ],
                'Manager': [
                    {name: 'Meeting', follow: false, nb: 10, min: 1, max: 5, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer']},
                    {name: 'Meeting', follow: false, nb: 10, min: 1, max: 5, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer']},
                    {name: 'Meeting', follow: false, nb: 10, min: 1, max: 5, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer']},
                    {name: 'Meeting', follow: false, nb: 10, min: 1, max: 5, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer']},
                    {name: 'Meeting', follow: false, nb: 10, min: 1, max: 5, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer']},
                    {name: 'Meeting', follow: false, nb: 10, min: 1, max: 5, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer']},
                    {name: 'Meeting', follow: false, nb: 10, min: 1, max: 5, color: 'blue', desc: ['important', 'kickoff', 'introduction', 'customer']},
                ]
            };
            
            var self = this,
                BC = base.collections('BaseCollection'),
                Employees = BC.extend({model_name: 'hr.employee'}),
                employees = new Employees(),
                params = this.parameters(),
                date_from = moment('2013-06-01'),
                date_to = moment('2014-06-01');
            
            employees.fetch().done(function(){
                console.log(employees);
                
                employees.each(function(employee){
                    
                    
                    // Resource for all
                    var res = datas['All'];
                    
                    _(res).each(function(d){
                        var place = d.desc.length > 0 ? d.desc[self.randomNumber(0,d.desc.length-1)] : '';
                        self.saveChart($.extend(d, {
                            chart_id: 2,
                            chart_name: d.name + ' - ' + place,
                            message: 'Business Trip in ' + place,
                            date_from: date_from, 
                            date_to: date_to,
                            resource_id: employee.get('id'),
                            force_start: false
                        }));
                    });
                    
                    if(employee.get('job_id')){
                        var specs = datas[employee.get('job_id')[1]], pos = 0;
                        
                        if(specs.length > 0){
                            
                            var next = function(spec, save_params){
                                var force = $.isPlainObject(save_params) && spec.follow;
                                self.saveChart($.extend(spec, {
                                    chart_id: 2,
                                    chart_name: spec.name,
                                    message: spec.desc.length > 0 ? spec.desc[self.randomNumber(0,spec.desc.length-1)] : '',
                                    date_from: force ? moment(save_params.date_end).add('days', 1) : date_from, 
                                    date_to: date_to,
                                    resource_id: employee.get('id'),
                                    force_start: force 
                                }))
                                .done(function(p){
                                    if(pos < specs.length){
                                        next(specs[pos++], p);    
                                    }
                                }); 
                            };
                        
                            next(specs[pos++]);    
                        }
                    }
                });
                
            });
        },
        
        saveChart: function(params){
            
            
            var savedef =  $.Deferred(),
                diff = ((params.date_to - params.date_from)/60/60/1000/24)-params.max, 
                dates = this.randomDates(params.date_from, params.date_to, diff > 0 ? diff : 0, params.min, params.max, params.force_start); 
            
            var datas = {
                chart: params.chart_id,
                css_class: params.color,
                date_start: dates.start,
                date_end: dates.end,
                message: params.message,
                
                secondary_origin_model: 123,
                secondary_origin_id: params.resource_id,
                origin_model: 123,
                origin_id: params.resource_id,
                
                name:  params.chart_name,
                selected: false,
                resource_id: params.resource_id     
            };
            
            var chart = new Resource(datas);
            
            console.log('save chart', chart);
            
            var def = chart.save(),
                $res = this.$res;
                
            if(def){
                def.then(
                    function(){
                        savedef.resolve(datas);
                        $res.append(
                            $('<li>').text('chart successfully saved')
                        );
                    },
                    function(e){
                        savedef.reject();
                        console.error(e);
                        throw new Error('chart can not be saved');
                    }
                );    
            }
            else {
                savedef.reject();
                throw new Error('chart is not valid');
            }
            return savedef;
        },    
        
        randomDates: function(from, to, diff, min, max, force_start){
            max = parseInt(max);
            var start_diff = force_start ? 0 : this.randomNumber(0, diff-1), 
                start = moment(from).add('days', start_diff),
                end_diff = this.randomNumber(min, diff-start_diff + min),
                end = moment(start).add('days', end_diff > max ? max : end_diff);
            
            return {
                start: start.format('YYYY-MM-DD'),
                end: end.format('YYYY-MM-DD')
            };
        },
        
        randomNumber: function(min, max){
            min = parseInt(min);
            max = parseInt(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        
        parameters: function(){
            var data = this.$form.serializeArray(),
                params = {};
                
            _.each(data, function(input){
                params[input.name] = input.value;
            });    
            
            return params;
        }
    });

});