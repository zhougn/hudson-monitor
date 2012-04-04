(function(global) {
    global.OptionsAdapter = choc.klass({
        Include: choc.Optionable,

        initialize: function(options) {
            this.initOptions(options);
        },

        save: function() {
            localStorage['options'] = JSON.stringify(this.options);
        }
    });

    Object.merge(OptionsAdapter, {
        getOptions: function() {
            return JSON.parse(localStorage['options'] || '{}');
        },

        create: function() {
            return new OptionsAdapter(this.getOptions());
        }
    });

    global.OptionsView = choc.klass({
        initialize: function() {
            this.cacheElements();
            this.bindEvents();

            this.optionsAdapter = OptionsAdapter.create();
            this.restoreOptions();
        },

        cacheElements: function() {
            this.$serverUrl = $('#serverUrl');
            this.$scanServer = $('#scanServer');
            this.$jobsContainer = $('#jobsContainer');
        },

        bindEvents: function() {
            this.$scanServer.click(this.scanServer.bind(this));
        },

        scanServer: function() {
            var self = this;
            var apiUrl = this.$serverUrl.val() + '/api/json';
            jQuery.ajax({
                url: apiUrl,
                dataType: 'json',
                success: function(data) {
                    self.$jobsContainer.empty();
                    data.jobs.each(function(job) {
                        $('#jobTemplate').tmpl({name:job.name}).appendTo(self.$jobsContainer);
                    });
                }
            });
        },

        restoreOptions: function() {
            
        }
    });
})(this);
