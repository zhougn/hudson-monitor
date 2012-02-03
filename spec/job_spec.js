describe("Job", function() {
    var lastBuild = 2;
    var nextBuild = 3;
    var job;

    beforeEach(function() {
        job = new Job({name: 'job', url: 'http://test.url/job/unit_test/api/json'});
        job.lastBuild = lastBuild;
        job.status = 'successful';
    });

    describe("update", function() {
        it("should update building info when there is a new build", function() {
            job.update({
                color: 'red',
                lastBuild: {number: nextBuild}
            });

            expect(job.lastBuild).toBe(nextBuild);
            expect(job.status).toBe('failed');
        });
    });
});
