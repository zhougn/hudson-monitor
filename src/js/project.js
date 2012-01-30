(function(global) {
    var ColorToStatus = {
        red        : 'failed',
        blue       : 'successful',
        blue_anime : 'building',
        red_anime  : 'building'
    };

    global.Project = choc.klass({
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

    global.ProjectView = choc.klass({
        initialize: function(project) {
            this.project = project;
        },

        render: function() {
            this.$dom = $('#project').tmpl(this.project);
            return this.$dom;
        }
    });

})(this);
