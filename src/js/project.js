var Project = choc.klass({
    Include: choc.Optionable,

    status: 'unknown',

    initialize: function(options) {
        this.name = options.name;
        this.initOptions(options);
    }
});

var ProjectView = choc.klass({
    initialize: function(project) {
        this.project = project;
    },

    render: function() {
        this.$dom = $('#project').tmpl(this.project);
        return this.$dom;
    }
});
