/*
 * Possible job statuses includes: unknown, building, success, failure, aborted
 * */

(function(global) {
    var buildChangedTypeMapping = {
        'unknown': {'building': 'buildStart',  'success': 'buildSuccess', 'failure': 'buildBroken'},
        'success': {'building': 'buildStart',  'success': 'buildSuccess', 'failure': 'buildBroken'},
        'failure': {'building': 'startFixing', 'success': 'buildFixed',   'failure': 'stillFailure'}
    };

    function apiUrl(url) {
        return url + 'api/json';
    }

    global.Job = choc.klass({
        Include: [choc.Optionable, choc.Eventable],
        Delegate: {'hudsonJob': ['lastBuild', 'lastCompleteBuild']},

        hudsonJob: {
            lastBuild: {building: false, result: 'unknown', number: -1},
            lastCompleteBuild: null
        },

        initialize: function(options) {
            this.name = options.name;
            this.initOptions(options);
        },

        refresh: function() {
            var self = this;
            jQuery.getJSON(apiUrl(this.options.url), function(newHudsonJob) {
                if (!self.isBuildChanged(newHudsonJob)) return;
                self.hudsonJob = newHudsonJob;

                jQuery.getJSON(apiUrl(self.lastBuild().url), function(richLastBuild) {
                    self.hudsonJob.lastBuild = richLastBuild;

                    var previousBuild = self.previousBuild();
                    if (!previousBuild) {
                        self.notifyBuildChange();
                        return;
                    }
                    jQuery.getJSON(apiUrl(previousBuild.url), function(richPreviousBuild) {
                        self.hudsonJob.previousBuild = richPreviousBuild;
                        self.notifyBuildChange();
                    });
                });
            });
        },

        isBuildChanged: function(newHudsonJob) {
            var lastBuildChanged = (newHudsonJob.lastBuild.number !== this.lastBuild().number);
            var lastCompleteBuildChanged = !Object.equal(newHudsonJob.lastCompleteBuild, this.lastCompleteBuild());
            return lastBuildChanged || lastCompleteBuildChanged;
        },

        notifyBuildChange: function() {
            var type = buildChangedTypeMapping[this.previousBuildStatus()][this.status()];
            this.trigger('buildChanged', [type, this]);
        },

        status: function() {
            if (this.hudsonJob.lastBuild.building) return 'building';
            return this.hudsonJob.lastBuild.result.toLowerCase();
        },

        previousBuildStatus: function() {
            var previousBuild = this.hudsonJob.previousBuild;
            return previousBuild ? previousBuild.result.toLowerCase() : 'unknown';
        },

        previousBuild: function() {
            return this.hudsonJob.previousBuild || this.hudsonJob.builds[1];
        }
    });

    global.JobView = choc.klass({
        initialize: function(job) {
            this.job = job;
        },

        render: function() {
            this.$dom = $('#job').tmpl({job: this.job});
            this.bindEvents();
            return this.$dom;
        },

        bindEvents: function() {
            this.job.on('buildChanged', this.refresh.bind(this));
        },

        refresh: function() {
            this.$dom.removeClass('building aborted success failure unknown').addClass(this.job.status());
        }
    });

})(this);
