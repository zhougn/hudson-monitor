/*
 * Possible job statuses includes: unknown, building, success, failure, aborted
 * */

(function(global) {
    var eventMapping = {
        'unknown': {'building': 'buildStart',  'success': 'buildSuccess', 'failure': 'buildBroken'},
        'success': {'building': 'buildStart',  'success': 'buildSuccess', 'failure': 'buildBroken'},
        'failure': {'building': 'startFixing', 'success': 'buildFixed',   'failure': 'stillFailure'}
    };

    global.Job = choc.klass({
        Include: [choc.Optionable, choc.Eventable],

        hudsonJob: {
            lastBuild: {building: false, result: 'unknown', number: -1}
        },

        initialize: function(options) {
            this.name = options.name;
            this.initOptions(options);
        },

        notifyBuildChange: function() {
            var eventName = eventMapping[this.previousBuildStatus()][this.status()];
            this.trigger(eventName, this);
        },

        status: function() {
            if (this.hudsonJob.lastBuild.building) return 'building';
            return this.hudsonJob.lastBuild.result.toLowerCase();
        },

        previousBuildStatus: function() {
            var previousBuild = this.hudsonJob.previousBuild;
            return previousBuild ? previousBuild.result.toLowerCase() : 'unknown';
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
