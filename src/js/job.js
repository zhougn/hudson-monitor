(function(global) {
    global.Job = choc.klass({
        Include: [choc.Optionable, choc.Eventable],

        initialize: function(options) {
            this.name = options.name;
            this.initOptions(options);
        },

        notifyBuildChange: function() {
            var eventName = '';

            if (this.status() === 'building' && this.previousBuildStatus() === 'success') {
                eventName = 'buildStart';
            } else if (this.status() === 'building' && this.previousBuildStatus() === 'failure') {
                eventName = 'startFixing';
            } else if (this.status() === 'failure' && this.previousBuildStatus() === 'success') {
                eventName = 'buildBroken';
            } else if (this.status() === 'success' && this.previousBuildStatus() === 'failure') {
                eventName = 'buildFixed';
            } else if (this.status() === 'failure' && this.previousBuildStatus() === 'failure') {
                eventName = 'stillFailure';
            } else if (this.status() === 'success' && this.previousBuildStatus() === 'success') {
                eventName = 'stillSuccess';
            }

            this.trigger(eventName, this);
        },

        status: function() {
            if (this.hudsonJob.lastBuild.building) return 'building';
            return this.hudsonJob.lastBuild.result.toLowerCase();
        },

        previousBuildStatus: function() {
            return this.hudsonJob.previousBuild.result.toLowerCase();
        }
    });

    global.JobView = choc.klass({
        initialize: function(job) {
            this.job = job;
        },

        render: function() {
            this.$dom = $('#job').tmpl({job: this.job});
            return this.$dom;
        }
    });

})(this);
