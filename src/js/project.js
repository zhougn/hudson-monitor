var Project = choc.klass({
    status: 'unknown',
    initialize: function(options) {
        this.name = options.name;
    }
});

Object.merge(Project, {
    findAll: function() {
        var projectOptions = JSON.parse(localStorage['projects'] || '[]');
        return projectOptions.map(function(projectOption) {
            return new Project(projectOption);
        });
    }
});

var ProjectView = choc.klass({
    initialize: function(project) {
        this.project = project;
    },

    render: function() {
        this.dom = $('#project').tmpl(this.project);
        return this.dom;
    }
});
