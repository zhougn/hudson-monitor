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
        setInterval(this.refreshJobs.bind(this), this.refreshInterval);
        setInterval(this.reportJobs.bind(this), this.reportInterval);
    },

    refreshJobs: function() {
        this.monitor.refresh();
    },

    reportJobs: function() {
        this.monitor.report();
    }
});
