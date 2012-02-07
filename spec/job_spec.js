describe("Job", function() {
    function createJob() {
        return new Job({name: 'unit_test', url: 'http://test.url/job/unit_test/api/json'});
    }

    describe("notifyBuildChange", function() {
        it("should trigger build change event when last and previous hudson build are updated", function() {
            var datas = [
                {
                    eventName: 'buildStart',
                    hudsonJob: {
                        lastBuild: {building: true, result: null, number: 1},
                        previousBuild: null
                    }
                },
                {
                    eventName: 'buildStart',
                    hudsonJob: {
                        lastBuild: {building: true, result: null, number: 2},
                        previousBuild: {building: false, result: 'SUCCESS', number: 1}
                    }
                },
                {
                    eventName: 'startFixing',
                    hudsonJob: {
                        lastBuild: {building: true, result: null, number: 2},
                        previousBuild: {building: false, result: 'FAILURE', number: 1}
                    }
                },
                {
                    eventName: 'buildFixed',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'SUCCESS', number: 2},
                        previousBuild: {building: false, result: 'FAILURE', number: 1}
                    }
                },
                {
                    eventName: 'buildBroken',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'FAILURE', number: 2},
                        previousBuild: {building: true, result: 'SUCCESS', number: 1}
                    }
                },
                {
                    eventName: 'buildBroken',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'FAILURE', number: 1},
                        previousBuild: null
                    }
                },
                {
                    eventName: 'stillFailure',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'FAILURE', number: 2},
                        previousBuild: {building: false, result: 'FAILURE', number: 1}
                    }
                },
                {
                    eventName: 'buildSuccess',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'SUCCESS', number: 2},
                        previousBuild: {building: false, result: 'SUCCESS', number: 1}
                    }
                },
                {
                    eventName: 'buildSuccess',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'SUCCESS', number: 1},
                        previousBuild: null
                    }
                }
            ];

            datas.each(function(data) {
                var eventTriggered = false;
                var job = createJob();
                job.on(data.eventName, function() { eventTriggered = true; });
                job.hudsonJob = data.hudsonJob;

                job.notifyBuildChange();

                expect(eventTriggered).toBe(true, 'event: ' + data.eventName);
            });

        });
    });

    describe("isBuildChanged", function() {
        it("should tell whether there is a build change", function() {
            var job = createJob();
            job.hudsonJob = {lastBuild: {number: 1}, lastCompleteBuild: null};

            expect(job.isBuildChanged({lastBuild: {number: 1}, lastCompleteBuild: null})).toBe(false);
            expect(job.isBuildChanged({lastBuild: {number: 1}, lastCompleteBuild: {number: 1}})).toBe(true);
            expect(job.isBuildChanged({lastBuild: {number: 2}, lastCompleteBuild: {number: 1}})).toBe(true);
        });
    });
});
