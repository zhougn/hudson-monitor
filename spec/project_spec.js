describe("Project", function() {
    var lastBuild = 2;
    var nextBuild = 3;
    var project;

    beforeEach(function() {
        project = new Project({name: 'project', url: 'http://test.url/job/unit_test/api/json'});
        project.lastBuild = lastBuild;
        project.status = 'successful';
    });

    describe("update", function() {
        it("should update building info when there is a new build", function() {
            project.update({
                color: 'red',
                lastBuild: {number: nextBuild}
            });

            expect(project.lastBuild).toBe(nextBuild);
            expect(project.status).toBe('failed');
        });
    });
});
