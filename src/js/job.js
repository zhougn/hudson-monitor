(function(global) {
    var ColorToStatus = {
        red        : 'failed',
        blue       : 'successful',
        blue_anime : 'building',
        red_anime  : 'building',
        aborted    : 'aborted'
    };

    global.Job = choc.klass({
        Include: choc.Optionable,

        status: 'unknown',

        initialize: function(options) {
            this.name = options.name;
            this.initOptions(options);
        },

        update: function(hudsonJob) {
            if (!this._isBuildChanged(hudsonJob)) return;

            this.hudsonJob = hudsonJob;
        },

        _isBuildChanged: function(newHudsonJob) {
            var lastBuild = this.hudsonJob.lastBuild.number;
            var lastCompleteBuild = this.hudsonJob.lastCompleteBuild.number;
            var newLastBuild = newHudsonJob.lastBuild.number;
            var newLastCompleteBuild = newHudsonJob.lastCompleteBuild.number;

            return lastBuild !== newLastBuild || lastCompleteBuild !== newLastCompleteBuild;
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
