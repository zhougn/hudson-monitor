var audioQueue = new Class({
    _using          : false,
    _content        : [],
    _baseURL        : "http://dict.youdao.com/dictvoice?audio=",
    _workingHours   : [9, 18],
    // _defaultLang    : 'zh-CN',

    play : function() {
        if(this._using) {
            setTimeout(this.play(), 1000);
            return;
        } else {
            this._using = true;
            if(this._content.length > 0) {
                this._playFirstInQueue();
            }
            this._using = false;
            return;
        }
    },

    _playFirstInQueue : function() {
        var audio = this._content.shift();
        if(!!audio && this._inWorkingHours()) {
            console.log('playing', audio.src);
            audio.play();
        }
    },

    // contents [{str:string, lang:lang}]
    addContents : function(contents) {
        if(this._using) {
            setTimeout(this.addContents(contents), 1000);
            return;
        } else {
            this._using = true;
            if(this._content.length === 0 ) {
                this._content.push(this._defaultIntro());
            }
            for(var i=0; contents[i]; i++) {
                this._content.push(this._buildAudio(contents[i].str,contents[i].lang));
            }
            this._using = false;
            return;
        }
    }, 

    _defaultIntro : function() {
        var date = new Date();
        var str = "hudson ";
        // reporting, ";
        // str += "it's ";
        // str += date.getHours();
        // str += " ";
        // str += date.getMinutes();
        // str += " now. ";
        return this._buildAudio(str);
    },

    _buildAudio : function(str, lang) {
        var self = this;
        var playURL = this._buildAudioURL(str, lang);
        var audio = new Audio(playURL);
        audio.addEventListener('ended', function(){
            console.log('play next in queue');
            self._playFirstInQueue();
        });
        return audio;
    },

    _buildAudioURL : function(str, lang) {
        var url = this._baseURL;
        url += encodeURI(str);
        return url;
    }, 

    _inWorkingHours : function() {
        var date = new Date();
        var d = date.getDay();
        var h = date.getHours();
        return (d>=1 && d<=5) && (h>=this._workingHours[0] && h<=this._workingHours[1]);
    }, 

    blank: function() {
        return this._content.length === 0;
    },

    addAllGreen: function() {
        this.addContents([{str: "All tests are green. "}]);
    },

    addStandUpNotice: function() {
        this.addContents([{str: "Attention, time for stand up meeting. "}]);
    }

});

MonitorAudioQueue = new audioQueue();

var Monitor = new Class({
    _interval       : 15000,
    _reportInterval : 60000,
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
                setInterval(self._reportStatus.bind(self), self._reportInterval);
            }
        });
    },

    _reportStatus: function() {
        var date = new Date();
        console.log(date.toString());
        if(date.getMinutes() == 30) {
            for(var i=0; this._jobMonitors[i]; i++) {
                this._jobMonitors[i].addReport();
            }
            if( MonitorAudioQueue.blank() ) {
                MonitorAudioQueue.addAllGreen();
            }
            MonitorAudioQueue.play();
        }
        if(date.getHours() == 9 && date.getMinutes() == 55) {
            MonitorAudioQueue.addStandUpNotice();
            MonitorAudioQueue.play();
        }
    },

    _swtichScreen: function() {
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
        this._pname = 'test';
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
        var showBrief = self._blameList.length > 4;
        self._blameList.each(function(user){
            var avatar = self._userAvatarMapping[user];
            if(!!!avatar) {
                avatar = {type:"image", file:"/img/avatars/avatar00.png"};
            }
            var $li = $('<li>');
            if(showBrief) {
              $li.addClass('hideInNonExpand')
            }
            $li.append($('<div>').text(user).addClass('user'));
            if(avatar.type == 'image') {
                $li.append($('<img>').attr('src', avatar.file));
            }
            $blameList.append($li);
        });
        if(showBrief) {
            $blameList.append($('<li>').text("好多猪头").addClass("showInNonExpand"));
        }
        localStorage[self._name + '-blameList'] = JSON.stringify(this._blameList);
        if(!!self._notifyEvent) {
            self._notify(self._notifyEvent);
        }
    },

    _refreshBlameList: function() {
        if(this._is_failure() && this._blameList.length === 0) {
            this._updateBlameList();
            return;
        }
        if(this._is_success()) {
            this._blameList = [];
        }  
        this._drawAndSaveBlameList();
        return;
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
        this._notifyEvent = null;
        if(!!this._job) {
            var oldJob = this._job;
            var self = this;
            Object.each(JobEvents, function(meetCondition, eventName) {
                if(meetCondition(oldJob, newJob)) { self._notifyEvent = eventName; }
            });
        }
        this._job = newJob;
        this._lastBuildUrl = this._job.lastBuild.url;
    },

    _notify: function(eventName) {
        console.log('notify', eventName);
        if(eventName == 'build_fail') {
            this.addReport();
            MonitorAudioQueue.play();
        }
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

    _is_success: function() {
        return this._status() == 'success';
    },

    expand: function() {
        if(this._is_failure() && !this.showInBigScreen) {
            this.$dom.removeClass('hidden').addClass('expand');
            this.$dom.siblings('.job').removeClass('expand').addClass('hidden');
            this.showInBigScreen = true;
            return true;
        }
        return false;
    }, 

    addReport: function() {
        if(this._is_success()) {
            return true;
        } 
        if(this._blameList.length > 0) {
            var self = this;
            var str = this._pname + " failed. ";
            if(this._blameList.length > 4) {
                str += "all people "
            } else {
                this._blameList.each(function(user){
                    var avatar = self._userAvatarMapping[user];
                    if(!!!avatar) {
                        avatar = {pname:user+","};
                    }
                    str += avatar.pname;
                });
            }
            str += "attention."
            MonitorAudioQueue.addContents([{str:str}]);
        }
        return;
    }
});
