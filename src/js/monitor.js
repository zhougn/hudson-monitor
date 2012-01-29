var Monitor = choc.klass({
    initialize: function(projects) {
        this.projects = projects || [];
    }
});

var MonitorView = choc.klass({
    initialize: function(monitor) {
        this.monitor = monitor;
        this.projectViews = monitor.projects.map(function(project) {
            return new ProjectView(project);
        });
    },

    render: function() {
        var dom = this.dom = $('#monitor');
        this.projectViews.each(function(projectView) {
            dom.append(projectView.render());
        });
    }
});
