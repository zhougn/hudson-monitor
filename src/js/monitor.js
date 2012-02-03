var Monitor = choc.klass({
    initialize: function(jobs) {
        this.jobs = jobs || [];
    }
});

Object.merge(Monitor, {
    create: function(options) {
        var jobUrlTemplate = '{1}/job/{2}/api/json';
        var jobs = (options.jobs || []).map(function(jobOption) {
            jobOption = Object.merge({
                url: jobUrlTemplate.assign(options.url, jobOption.name)
            }, jobOption);
            return new Job(jobOption);
        });
        return new Monitor(jobs);
    }
});

var MonitorView = choc.klass({
    initialize: function(monitor) {
        this.monitor = monitor;
        this.jobViews = monitor.jobs.map(function(job) {
            return new JobView(job);
        });
    },

    render: function() {
        var $dom = this.$dom = $('#monitor');
        this.jobViews.each(function(jobView) {
            $dom.append(jobView.render());
        });
    }
});
