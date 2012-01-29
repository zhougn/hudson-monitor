describe('monitor', function() {
    describe('create', function() {
        it('should create monitor and projects from given options', function() {
            var serverUrl = 'http://test.url';
            var projectName = 'unit_test';
            var projectUrl = '{1}/job/{2}/api/json'.assign(serverUrl, projectName);

            var monitor = Monitor.create({
                url: serverUrl,
                projects: [
                    {name: projectName}
                ]
            });

            expect(monitor.projects.length).toBe(1);
            var project = monitor.projects[0];
            expect(project.name).toBe(projectName);
            expect(project.options.url).toBe(projectUrl);
        });
    });
});
