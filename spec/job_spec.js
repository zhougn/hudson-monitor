describe("Job", function() {
    function createJob() {
        return new Job({name: 'unit_test', url: 'http://test.url/job/unit_test/api/json'});
    }

    describe("notifyBuildChange", function() {
        it("should trigger build change event when last and previous hudson build are updated", function() {
            var datas = [
                {
                    type: 'buildStart',
                    hudsonJob: {
                        lastBuild: {building: true, result: null, number: 1},
                        previousBuild: null
                    }
                },
                {
                    type: 'buildStart',
                    hudsonJob: {
                        lastBuild: {building: true, result: null, number: 2},
                        previousBuild: {building: false, result: 'SUCCESS', number: 1}
                    }
                },
                {
                    type: 'startFixing',
                    hudsonJob: {
                        lastBuild: {building: true, result: null, number: 2},
                        previousBuild: {building: false, result: 'FAILURE', number: 1}
                    }
                },
                {
                    type: 'buildFixed',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'SUCCESS', number: 2},
                        previousBuild: {building: false, result: 'FAILURE', number: 1}
                    }
                },
                {
                    type: 'buildBroken',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'FAILURE', number: 2},
                        previousBuild: {building: true, result: 'SUCCESS', number: 1}
                    }
                },
                {
                    type: 'buildBroken',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'FAILURE', number: 1},
                        previousBuild: null
                    }
                },
                {
                    type: 'stillFailure',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'FAILURE', number: 2},
                        previousBuild: {building: false, result: 'FAILURE', number: 1}
                    }
                },
                {
                    type: 'buildSuccess',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'SUCCESS', number: 2},
                        previousBuild: {building: false, result: 'SUCCESS', number: 1}
                    }
                },
                {
                    type: 'buildSuccess',
                    hudsonJob: {
                        lastBuild: {building: false, result: 'SUCCESS', number: 1},
                        previousBuild: null
                    }
                }
            ];

            datas.each(function(data) {
                var buildChanged = false;
                var job = createJob();
                job.on('buildChanged', function(type) { buildChanged = true; });
                job.hudsonJob = data.hudsonJob;

                job.notifyBuildChange();

                expect(buildChanged).toBe(true);
                expect(job.buildChangedType()).toBe(data.type, 'build changed type: ' + data.type);
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
