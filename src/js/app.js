var App = choc.klass({
    refreshInterval: 15000,
    reportInterval: 600000,

    start: function() {
        this.createModels();
        this.createViews();
        this.monitorView.render();
        //this.createAlerts();
        //this.scheduleJobs();
    },

    createViews: function() {
        this.monitorView = new MonitorView(this.monitor);
    },

    createModels: function() {
        var options = JSON.parse(localStorage['monitor'] || '{}');
        this.monitor = Monitor.create(options);
    },

    createAlerts: function() {
        new MonitorAlert(this.monitor);
    },

    scheduleJobs: function() {
        setInterval(this.refreshProjects.bind(this), this.refreshInterval);
        setInterval(this.reportProjects.bind(this), this.reportInterval);
    },

    refreshProjects: function() {
        this.monitor.refresh();
    },

    reportProjects: function() {
        this.monitor.report();
    }
});
