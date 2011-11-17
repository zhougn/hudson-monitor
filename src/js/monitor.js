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
                setInterval(self._refreshJobMonitors.bind(self), self._interval);
            }
        });
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
    initialize: function(name, url) {
        this._url = url + 'api/json';
        this._name = name;
        this._blameList = JSON.parse(localStorage[name + '-blameList'] || '[]');
        this._buildUI();
        this.refresh();
        this._userAvatarMapping = {};
    },

    refresh: function() {
        var self = this;
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
                          '<div class="blame">' +
                            '<ul>' +
                            '</ul>' +
                          '</div>' +
                        '</li>';
        this.$dom = $(template.substitute({name:this._name}));
        this.$blameList = this.$dom.find('.blame > ul');
    },

    _drawAndSaveBlameList: function() {
        var self=this;
        if(self._blameList.length > 4) {
            self.$blameList.append("<li>好多人<li>");
        } else {
            self._blameList.each(function(user){
                var avatar = self._userAvatarMapping[user];
                if(!!!avatar) {
                    avatar = {type:"image", file:"/img/avatars/avatar00.png"};
                    avatar.file = avatar.file.replace(/avatar00/, "rpm0" + user.length+5);
                }
                var $li = $('<li>');
                $li.append($('<div>').text(user).addClass('user'));
                if(avatar.type == 'image') {
                    $li.append($('<img>').attr('src', avatar.file));
                }
                self.$blameList.append($li);
            });
        }
        localStorage[self._name + '-blameList'] = JSON.stringify(this._blameList);
    },

    _refreshBlameList: function() {
        this.$blameList.empty();
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
        this.$dom.removeClass('success building fail').addClass(this._status());
    },

    _status: function() {
        return JobStatuses[this._job.color];
    },

    _is_failure: function() {
        return this._status() == 'fail';
    },

    _is_successs: function() {
        return this._status() == 'success';
    }
});
