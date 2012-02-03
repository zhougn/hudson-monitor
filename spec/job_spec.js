describe("Job", function() {
    describe("update", function() {
        var currentHudsonJob = {lastBuild: {number: 2}, lastCompleteBuild: {number: 2}};
        var job;
        beforeEach(function() {
            job = new Job({name: 'unit_test', url: 'http://test.url/job/unit_test/api/json'});
            job.hudsonJob = currentHudsonJob;
        });

        it("should update hudson job when build changed", function() {
            var newHudsonJob = {lastBuild: {number: 3}, lastCompleteBuild: {number: 2}};

            job.update(newHudsonJob);

            expect(job.hudsonJob).toBe(newHudsonJob);
        });

        it("should NOT update hudson job when build not changed", function() {
            var oldHudsonJob = job.hudsonJob;
            var newHudsonJob = Object.clone(oldHudsonJob);

            job.update(newHudsonJob);

            expect(job.hudsonJob).toBe(oldHudsonJob);
        });
    });
});
