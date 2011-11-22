var monitorOptions = {
    settingKeys: ['serverUrl', 'jobs', 'userAvatarMapping', 'jobNameMapping'],

    init: function() {
        var serverHttpUrl = (localStorage['serverUrl'] || '').replace(/\/api\/json$/, '');
        this._$serverUrl = $('#server_url').val(serverHttpUrl);
        this._$jobsSection = $('#jobs_section');
        this._$applySection = $('#apply_section');
        this._$settingsJson = $('#settingsJson');
        this._bindEvents();
        $("#scan_server").click();
    },

    _getServerUrl: function() {
        var serverHttpUrl = this._$serverUrl.val();
        if(serverHttpUrl === '') {return;}
        return serverHttpUrl + '/api/json';
    },

    _bindEvents: function() {
        $('#scan_server').click(this._scanServer.bind(this));
        $('#ok').click(this._saveSettings.bind(this));
        this._$settingsJson.click(function(){this.select();});
        $('#importSettings').click(this._importSettings.bind(this));
        $('#exportSettings').click(this._exportSettings.bind(this));
    },

    _scanServer: function() {
        var serverUrl = this._getServerUrl();

        var jobTemplate = '<p><label><input type="checkbox" name="job" value="{jobName}" {checked} />{jobName}</label></p>';
        var self = this;
        self._$jobsSection.empty();
        self._$applySection.hide();
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
                if(self._$jobsSection.children('p').length > 0) {
                  self._$applySection.show();
                } 
            }
        });
    },

    _exportSettings: function() {
        var settings = {};
        this.settingKeys.each(function(key){
            settings[key] = localStorage[key];
        });
        this._$settingsJson.val(JSON.stringify(settings));
    },

    _importSettings: function() {
        var settingsJson = this._$settingsJson.val();
        try {
            var settings = JSON.parse(settingsJson);
            this.settingKeys.each(function(key){
              localStorage[key] = settings[key];
            });
        } catch(e) {
            alert('Invalid Input.');
        }
        this.init();
    },

    _saveSettings: function() {
        localStorage['serverUrl'] = this._getServerUrl();
        var jobsToMonitor = this._$jobsSection.find('input[name=job]:checked').map(function() { return this.value; }).toArray();
        localStorage['jobs'] = JSON.stringify(jobsToMonitor);
        chrome.tabs.create({'url':chrome.extension.getURL('monitor.html')});
        window.close();
    }
};
