describe('monitor', function() {
    describe('create', function() {
        it('should create monitor and jobs from given options', function() {
            var serverUrl = 'http://test.url';
            var jobName = 'unit_test';
            var jobUrl = '{1}/job/{2}/'.assign(serverUrl, jobName);

            var monitor = Monitor.create({
                url: serverUrl,
                jobs: [
                    {name: jobName}
                ]
            });

            expect(monitor.jobs.length).toBe(1);
            var job = monitor.jobs[0];
            expect(job.name).toBe(jobName);
            expect(job.options.url).toBe(jobUrl);
        });
    });
});
