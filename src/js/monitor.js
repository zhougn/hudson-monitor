var Monitor = choc.klass({
    initialize: function(projects) {
        this.projects = projects || [];
    }
});

Object.merge(Monitor, {
    create: function(options) {
        var projectUrlTemplate = '{1}/job/{2}/api/json';
        var projects = (options.projects || []).map(function(projectOption) {
            projectOption = Object.merge({
                url: projectUrlTemplate.assign(options.url, projectOption.name)
            }, projectOption);
            return new Project(projectOption);
        });
        return new Monitor(projects);
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
        var $dom = this.$dom = $('#monitor');
        this.projectViews.each(function(projectView) {
            $dom.append(projectView.render());
        });
    }
});
