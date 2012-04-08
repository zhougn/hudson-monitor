(function(global) {
    var ProjectsView = choc.klass({
        initialize: function(optionsAdapter) {
            this.optionsAdapter = optionsAdapter;

            this.cacheElements();
            this.bindEvents();
            this.restoreOptions();
        },

        cacheElements: function() {
            this.$serverUrl = $('#serverUrl');
            this.$scanServer = $('#scanServer');
            this.$jobsContainer = $('#jobsContainer');
            this.$monitorJobs = $('#monitorJobs');
        },

        bindEvents: function() {
            this.$scanServer.click(this.scanServer.bind(this));
            this.$monitorJobs.click(this.monitorJobs.bind(this));
        },

        scanServer: function(callback) {
            var url = this.$serverUrl.val().trim();
            if (url === '') return;

            var self = this;
            var apiUrl = url + '/api/json';
            jQuery.ajax({
                url: apiUrl,
                dataType: 'json',
                success: function(data) {
                    self.$jobsContainer.empty();
                    data.jobs.each(function(job) {
                        $('#jobTemplate').tmpl({name:job.name}).appendTo(self.$jobsContainer);
                    });

                    callback && callback();
                }
            });
        },

        restoreOptions: function() {
            var url = this.optionsAdapter.getUrl();
            if (!url) return;

            this.$serverUrl.val(url);
            this.scanServer(this.checkMonitoringJobs.bind(this));
        },

        checkMonitoringJobs: function() {
            var jobNames = this.optionsAdapter.jobNames();
            var monitoringJobsSelector = jobNames.map(function(jobName) {
                return 'input[value="{1}"]'.assign(jobName);
            }).join(',');
            this.$jobsContainer.find(monitoringJobsSelector).attr('checked', 'checked');
        },

        monitorJobs: function() {
            var jobNames = [];
            this.$jobsContainer.find('input:checked').each(function() {
                jobNames.push(this.value);
            });

            if (jobNames.isEmpty()) return;

            var url = this.$serverUrl.val().trim();
            this.optionsAdapter.updateUrl(url).updateJobNames(jobNames).save();
        }
    });

    var AudioNotificationsView = choc.klass({
        initialize: function() {
            this.bindEvents();
            this.restoreOptions();
        },

        bindEvents: function() {
        },

        restoreOptions: function() {
        }
    });

    global.OptionsView = choc.klass({
        initialize: function() {
            this.optionsAdapter = OptionsAdapter.create();
            this.projectsView = new ProjectsView(this.optionsAdapter);

            this.cacheElements();
            this.bindEvents();
        },

        cacheElements: function() {
            this.$navbarItems = $('.navbar-item');
            this.$pages = $('.page');
        },

        bindEvents: function() {
            var self = this;
            this.$navbarItems.click(function() { self.selectNavbarItem($(this)); });
        },

        selectNavbarItem: function($navbarItem) {
            if ($navbarItem.hasClass('navbar-item-selected')) return;

            this.$navbarItems.removeClass('navbar-item-selected');
            this.$pages.addClass('hidden');

            $navbarItem.addClass('navbar-item-selected');
            $('#' + $navbarItem.data('pagename')).removeClass('hidden');
        }
    });
})(this);
