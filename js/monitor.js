var Monitor = new Class({
    _url: 'http://localhost:8080/api/json',
    _projects: ['hello'],
    _interval: 10000,
    _statues: {
        red: 'fail',
        blue: 'success',
        yellow: 'building'
    },

    initialize: function() {
        this._$jobs = $('#jobs');
    },

    start: function() {
        this._refreshStatuses();
        setInterval(this._refreshStatuses.bind(this), this._interval);
    },

    _refreshStatuses: function() {
        var $jobs = this._$jobs;
        var jobTemplate = '<li class="job {status}">{name}</li>';
        var self = this;
        jQuery.ajax({
            url: this._url,
            dataType: 'json',
            success: function(data) {
                $jobs.empty();
                data.jobs.each(function(job) {
                    if(!self._projects.contains(job.name)) {
                        return;
                    }
                    var status = self._statues[job.color];
                    $jobs.append(jobTemplate.substitute({status:status, name:job.name}));
                });
            }
        });
    }
});
