var Monitor = choc.klass({
    initialize: function(jobs) {
        this.jobs = jobs;
    }
});

var MonitorView = choc.klass({
    initialize: function() {
        this.monitor = new Monitor();
        this.dom = $('#monitor');
    },

    render: function() {
    }
});
