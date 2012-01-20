var Project = choc.klass();

Object.merge(Project, {
    findAll: function() {
        var projectOptions = JSON.parse(localStorage['projects'] || '[]');
        return projectOptions.map(function(projectOption) {
            return new Project(projectOption);
        });
    }
});
