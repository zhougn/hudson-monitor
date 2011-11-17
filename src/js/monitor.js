var Monitor = new Class({
    _interval       : 15000,
    _jobMonitors    : [],
    _serverUrl      : localStorage['serverUrl'] || '',
    _monitoringJobs : JSON.parse(localStorage['jobs'] || '[]'),

    start: function() {
        if(this._monitorable()) { this._initJobMonitors(); }
    },

    _initJobMonitors: function() {
        var self = this;
        jQuery.ajax({
            url: self._serverUrl,
            dataType: 'json',
            success: function(data) {
                self._buildJobMonitors(data.jobs);
                setInterval(self._swtichScreen.bind(self), self._interval);
            }
        });
    },

    _swtichScreen: function() {
        console.log('switch screen');
        for(var i=0; this._jobMonitors[i]; i++) {
            if(this._jobMonitors[i].expand()) {
                return true;
            }
        }
        this._refreshJobMonitors();
    },

    _monitorable: function() {
        return this._serverUrl !== '' && this._monitoringJobs.length !== 0;
    },

    _buildJobMonitors: function(jobs) {
        var $jobs = $('#jobs');
        var self = this;
        jobs.each(function(job) {
            if(!self._monitoringJobs.contains(job.name)) {
                return;
            }
            var jobMonitor = new JobMonitor(job.name, job.url);
            $jobs.append(jobMonitor.$dom);
            self._jobMonitors.push(jobMonitor);
        });
    },

    _refreshJobMonitors: function() {
        console.log('refresh');
        this._jobMonitors.each(function(jobMonitor) {
            jobMonitor.refresh();
        });
    }
});

var JobStatuses = {
    red        : 'fail',
    blue       : 'success',
    blue_anime : 'building',
    red_anime  : 'building'
};

var JobEvents = {
    build_fail: function(oldJob, newJob) {
        return JobStatuses[oldJob.color] == 'building' && JobStatuses[newJob.color] == 'fail';
    },
    build_success: function(oldJob, newJob) {
        return JobStatuses[oldJob.color] == 'building' && JobStatuses[newJob.color] == 'success';
    }
};

var JobMonitor = new Class({
    showInBigScreen : false,

    initialize: function(name, url) {
        this._url = url + 'api/json';
        this._name = name;
        this._blameList = JSON.parse(localStorage[name + '-blameList'] || '[]');
        this._buildUI();
        this.refresh();
        this._userAvatarMapping = JSON.parse(localStorage['userAvatarMapping'] || '{}');
    },

    refresh: function() {
        var self = this;
        self.showInBigScreen = false;
        jQuery.ajax({
            url: this._url,
            dataType: 'json',
            success: function(job) {
                self._refreshJob(job);
                self._refreshUI();
                self._refreshBlameList();
            }
        });
    },

    _buildUI: function() {
        var template = '<li class="job">' +
                          '{name}' +
                        '</li>';
        this.$dom = $(template.substitute({name:this._name}));
    },

    _drawAndSaveBlameList: function() {
        var self=this;
        self.$dom.find('.blame').remove();
        var $blameList = $('<ul>');
        self.$dom.append($('<div>').addClass('blame').append($blameList).append("<div class='clear'></div>"));
        if(self._blameList.length > 4) {
            $blameList.append("<li>好多人<li>");
        } else {
            self._blameList.each(function(user){
                var avatar = self._userAvatarMapping[user];
                if(!!!avatar) {
                    avatar = {type:"image", file:"/img/avatars/avatar00.png"};
                }
                var $li = $('<li>');
                $li.append($('<div>').text(user).addClass('user'));
                if(avatar.type == 'image') {
                    $li.append($('<img>').attr('src', avatar.file));
                }
                $blameList.append($li);
            });
        }
        localStorage[self._name + '-blameList'] = JSON.stringify(this._blameList);
    },

    _refreshBlameList: function() {
        if(this._is_successs()) {
            this._blameList = [];
            this._drawAndSaveBlameList();
            return;
        }  
        if(this._is_failure()) {
            if(this._blameList.length === 0) {
                this._updateBlameList();
            } else {
                this._drawAndSaveBlameList();
            }
            return;
        }
    },

    _updateBlameList: function() {
        var self = this;
        jQuery.ajax({
            url: this._lastBuildUrl + '/api/json',
            dataType: 'json',
            success: function(lastBuildInfo) {
                lastBuildInfo.changeSet.items.each(function(item){
                    if(!self._blameList.contains(item.user)) {
                        self._blameList.push(item.user);
                    }
                });
                self._drawAndSaveBlameList();
            }
        });
    },

    _refreshJob: function(newJob) {
        if(!!this._job) {
            var oldJob = this._job;
            var self = this;
            Object.each(JobEvents, function(meetCondition, eventName) {
                if(meetCondition(oldJob, newJob)) { self._notify(eventName); }
            });
        }
        this._job = newJob;
        this._lastBuildUrl = this._job.lastBuild.url;
    },

    _notify: function(eventName) {
        var audio = document.getElementById('audio_' + eventName);
        audio.play();
    },

    _refreshUI: function() {
        this.$dom.removeClass('success building fail expand hidden').addClass(this._status());
    },

    _status: function() {
        return JobStatuses[this._job.color];
    },

    _is_failure: function() {
        return this._status() == 'fail';
    },

    _is_successs: function() {
        return this._status() == 'success';
    },

    expand: function() {
        if(this._is_failure() && !this.showInBigScreen) {
            this.$dom.removeClass('hidden').addClass('expand');
            this.$dom.siblings('.job').removeClass('expand').addClass('hidden');
            console.log('expand '+this._name);
            this.showInBigScreen = true;
            return true;
        }
        return false;
    }
});
