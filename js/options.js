var monitorOptions = {
    init: function() {
        this._$projectsSection = $('#projects_section');
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

        var projectTemplate = '<p><label><input type="checkbox" name="project" value="{projectName}" {checked} />{projectName}</label></p>';
        var self = this;
        jQuery.ajax({
            url: serverUrl,
            dataType: 'json',
            success: function(data) {
                self._$projectsSection.empty();
                var selectedProjects = JSON.parse(localStorage['projects'] || '[]');
                data.jobs.each(function(job) {
                    var properties = {projectName:job.name};
                    if(selectedProjects.contains(job.name)) {
                        properties['checked'] = 'checked="checked"';
                    }
                    self._$projectsSection.append(projectTemplate.substitute(properties));
                });
            }
        });
    },

    _saveSettings: function() {
        localStorage['serverUrl'] = this._$serverUrl.val();
        var projectsToSelect = this._$projectsSection.find('input[name=project]:checked').map(function() { return this.value; }).toArray();
        localStorage['projects'] = JSON.stringify(projectsToSelect);
        chrome.tabs.create({'url':chrome.extension.getURL('monitor.html')});
    }
};
