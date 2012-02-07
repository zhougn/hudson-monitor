var App = choc.klass({
    refreshInterval: 15000,
    reportInterval: 600000,

    start: function() {
        this.createModels();
        this.createViews();
        //this.createAlerts();
        this.scheduleRefreshTask();
    },

    createViews: function() {
        this.monitorView = new MonitorView(this.monitor);
        this.monitorView.render();
    },

    createModels: function() {
        var options = JSON.parse(localStorage['monitor'] || '{}');
        this.monitor = Monitor.create(options);
    },

    createAlerts: function() {
        new MonitorAlert(this.monitor);
    },

    scheduleRefreshTask: function() {
        this.monitor.refresh();
        setInterval(function() {
            this.monitor.refresh();
        }.bind(this), this.refreshInterval);
        //setInterval(this.reportJobs.bind(this), this.reportInterval);
    },

    reportJobs: function() {
        this.monitor.report();
    }
});
