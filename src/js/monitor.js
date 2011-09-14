var Monitor = new Class({
    _interval: 10000,
    _jobs: [],
    _statues: {
        red        : 'fail',
        blue       : 'success',
        blue_anime : 'building',
        red_anime : 'building'
    },

    initialize: function() {
        this._$jobs = $('#jobs');
    },

    start: function() {
        this._refreshStatuses();
        setInterval(this._refreshStatuses.bind(this), this._interval);
    },

    _refreshStatuses: function() {
        var serverUrl = localStorage['serverUrl'] || '';
        var selectedJobs = JSON.parse(localStorage['jobs'] || '[]');
        if(serverUrl === '' || selectedJobs.length === 0) {return;}

        var $jobs = this._$jobs;
        var jobTemplate = '<li class="job {status}">{name}</li>';
        var self = this;
        jQuery.ajax({
            url: serverUrl,
            dataType: 'json',
            success: function(data) {
                $jobs.empty();
                data.jobs.each(function(job) {
                    if(!selectedJobs.contains(job.name)) {
                        return;
                    }
                    var status = self._statues[job.color];
                    $jobs.append(jobTemplate.substitute({status:status, name:job.name}));
                });
            }
        });
    }
});
