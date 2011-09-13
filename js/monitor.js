var Monitor = new Class({
    _interval: 10000,
    _statues: {
        red        : 'fail',
        blue       : 'success',
        yellow     : 'building',
        blue_anime : 'building'
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
        var selectedProjects = JSON.parse(localStorage['projects'] || '[]');
        if(serverUrl === '' || selectedProjects.length === 0) {return;}

        var $jobs = this._$jobs;
        var jobTemplate = '<li class="job {status}">{name}</li>';
        var self = this;
        jQuery.ajax({
            url: serverUrl,
            dataType: 'json',
            success: function(data) {
                $jobs.empty();
                data.jobs.each(function(job) {
                    if(!selectedProjects.contains(job.name)) {
                        return;
                    }
                    var status = self._statues[job.color];
                    $jobs.append(jobTemplate.substitute({status:status, name:job.name}));
                });
            }
        });
    }
});
