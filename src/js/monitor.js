var Monitor = new Class({
    _interval: 20000,
    _jobMonitors: [],

    initialize: function() {
        this._$jobs = $('#jobs');
    },

    start: function() {
        this._initJobMonitors();
    },

    _initJobMonitors: function() {
        var serverUrl = localStorage['serverUrl'] || '';
        var monitoringJobs= JSON.parse(localStorage['jobs'] || '[]');
        if(serverUrl === '' || monitoringJobs.length === 0) {return;}

        var $jobs = this._$jobs;
        var self = this;
        jQuery.ajax({
            url: serverUrl,
            dataType: 'json',
            success: function(data) {
                $jobs.empty();
                data.jobs.each(function(job) {
                    if(!monitoringJobs.contains(job.name)) {
                        return;
                    }
                    var jobMonitor = new JobMonitor(job);
                    $jobs.append(jobMonitor.$dom);
                    self._jobMonitors.push(jobMonitor);
                });

                setInterval(self._refreshJobMonitors.bind(self), self._interval);
            }
        });
    },

    _refreshJobMonitors: function() {
        this._jobMonitors.each(function(jobMonitor) {
            jobMonitor.refresh();
        });
    }
});

var JobStatuses = {
    red        : 'fail',
    blue       : 'success',
    blue_anime : 'building',
    red_anime  : 'building'
};

var JobMonitor = new Class({
    initialize: function(job) {
        this._job = job;
        this._buildUI();
    },

    refresh: function() {
        var self = this;
        jQuery.ajax({
            url: this._job.url,
            dataType: 'json',
            success: function(job) {
                self._job = job;
                self.refreshUI();
            }
        });
    },

    _buildUI: function() {
        var template = '<li class="job {status}">{name}</li>';
        this.$dom = $(template.substitute({status:this._status(), name:this._job.name}));
    },

    _refreshUI: function() {
        this.$dom.removeClass('success building fail').addClass(this._status());
    },

    _status: function() {
        return JobStatuses[this._job.color];
    }
});
