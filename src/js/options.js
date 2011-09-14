var monitorOptions = {
    init: function() {
        this._$jobsSection = $('#jobs_section');
        this._$serverUrl = $('#server_url');

        this._$serverUrl.val(localStorage['serverUrl'] || '');

        this._bindEvents();
    },

    _bindEvents: function() {
        $('#scan_server').click(this._scanServer.bind(this));
        $('#ok').click(this._saveSettings.bind(this));
    },

    _scanServer: function() {
        var serverUrl = this._$serverUrl.val();
        if(serverUrl === '') {return;}

        var jobTemplate = '<p><label><input type="checkbox" name="job" value="{jobName}" {checked} />{jobName}</label></p>';
        var self = this;
        jQuery.ajax({
            url: serverUrl,
            dataType: 'json',
            success: function(data) {
                self._$jobsSection.empty();
                var monitoringJobs = JSON.parse(localStorage['jobs'] || '[]');
                data.jobs.each(function(job) {
                    var properties = {jobName:job.name};
                    if(monitoringJobs.contains(job.name)) {
                        properties['checked'] = 'checked="checked"';
                    }
                    self._$jobsSection.append(jobTemplate.substitute(properties));
                });
            }
        });
    },

    _saveSettings: function() {
        localStorage['serverUrl'] = this._$serverUrl.val();
        var jobsToMonitor = this._$jobsSection.find('input[name=job]:checked').map(function() { return this.value; }).toArray();
        localStorage['jobs'] = JSON.stringify(jobsToMonitor);
        chrome.tabs.create({'url':chrome.extension.getURL('monitor.html')});
        window.close();
    }
};
