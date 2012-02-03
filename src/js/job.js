(function(global) {
    var ColorToStatus = {
        red        : 'failed',
        blue       : 'successful',
        blue_anime : 'building',
        red_anime  : 'building'
    };

    global.Job = choc.klass({
        Include: choc.Optionable,

        status: 'unknown',

        initialize: function(options) {
            this.name = options.name;
            this.initOptions(options);
        },

        update: function(job) {
            this.lastBuild = job.lastBuild.number;
            this.status = ColorToStatus[job.color];
        }
    });

    global.JobView = choc.klass({
        initialize: function(job) {
            this.job = job;
        },

        render: function() {
            this.$dom = $('#job').tmpl(this.job);
            return this.$dom;
        }
    });

})(this);
