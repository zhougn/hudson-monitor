describe("Job", function() {
    describe("notify build change", function() {
        it("should trigger build change event when last and previous hudson build are updated", function() {
            var datas = [
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
                    eventName: 'stillFailure',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'FAILURE', number: 2},
                        previousBuild: {building: false, result: 'FAILURE', number: 1}
                    }
                },
                {
                    eventName: 'stillSuccess',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'SUCCESS', number: 2},
                        previousBuild: {building: false, result: 'SUCCESS', number: 1}
                    }
                }
            ];

            datas.each(function(data) {
                var eventTriggered = false;
                var job = new Job({name: 'unit_test', url: 'http://test.url/job/unit_test/api/json'});
                job.on(data.eventName, function() { eventTriggered = true; });
                job.hudsonJob = data.hudsonJob;

                job.notifyBuildChange();

                expect(eventTriggered).toBe(true, 'event: ' + data.eventName);
            });

        });
    });
});
