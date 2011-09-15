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
                    var jobMonitor = new JobMonitor(job.name, job.url);
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
    _jobEvents: {
        build_fail: function(oldJob, newJob) {
            return JobStatuses[oldJob.color] == 'building' && JobStatuses[newJob.color] == 'fail';
        },
        build_success: function(oldJob, newJob) {
            return JobStatuses[oldJob.color] == 'building' && JobStatuses[newJob.color] == 'success';
        }
    },

    initialize: function(name, url) {
        this._url = url + 'api/json';
        this._name = name;

        this._buildUI();

        this.refresh();
    },

    refresh: function() {
        var self = this;
        jQuery.ajax({
            url: this._url,
            dataType: 'json',
            success: function(job) {
                self._refreshJob(job);
                self._refreshUI();
            }
        });
    },

    _buildUI: function() {
        var template = '<li class="job">{name}</li>';
        this.$dom = $(template.substitute({name:this._name}));
    },

    _refreshJob: function(newJob) {
        if(!!this._job) {
            var oldJob = this._job;
            var self = this;
            Object.each(this._jobEvents, function(condition, eventName) {
                if(condition(oldJob, newJob)) { self._notify(eventName); }
            });
        }

        this._job = newJob;
    },

    _notify: function(eventName) {
        var audio = document.getElementById('audio_' + eventName);
        audio.play();
    },

    _refreshUI: function() {
        this.$dom.removeClass('success building fail').addClass(this._status());
    },

    _status: function() {
        return JobStatuses[this._job.color];
    }
});
