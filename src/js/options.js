/*
 * Example options:
 {
    url: "http://hudson.server.url",
    jobs: [{name: "project1"}, {name: "project2"}],
    audioNotifications: {
        buildStart: "",
        buildSuccess: "",
        buildBroken: "",
        startFixing: "",
        buildFixed: "",
        stillFailure: ""
    }
 }
 */
(function(global) {
    global.OptionsAdapter = choc.klass({
        Include: choc.Optionable,

        initialize: function(options) {
            this.initOptions(options);
        },

        getUrl: function() {
            return this.options.url;
        },

        jobNames: function() {
            var jobs = this.options.jobs || [];
            return jobs.map('name');
        },

        updateJobNames: function(jobNames) {
            this.options.jobs = jobNames.map(function(name) {
                return {name: name};
            });
            return this;
        },

        updateUrl: function(url) {
            this.options.url = url;
            return this;
        },

        save: function() {
            localStorage['options'] = JSON.stringify(this.options);
            return this;
        }
    });

    Object.merge(OptionsAdapter, {
        getOptions: function() {
            return JSON.parse(localStorage['options'] || '{}');
        },

        create: function() {
            return new OptionsAdapter(this.getOptions());
        }
    });
})(this);
