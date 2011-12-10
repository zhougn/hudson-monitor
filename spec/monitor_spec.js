describe('monitor', function() {
    describe('audio queue', function() {
        it('should tell whether now is working hour', function() {
            var queue = new AudioQueue();

            expect(queue._inWorkingHours(new Date('Fri Nov 11 2011 09:00:00 GMT+0800 (CST)'))).toBe(true);
            expect(queue._inWorkingHours(new Date('Fri Nov 11 2011 08:00:00 GMT+0800 (CST)'))).toBe(false);
            expect(queue._inWorkingHours(new Date('Fri Nov 11 2011 18:00:00 GMT+0800 (CST)'))).toBe(true);
            expect(queue._inWorkingHours(new Date('Fri Nov 11 2011 19:00:00 GMT+0800 (CST)'))).toBe(false);
            expect(queue._inWorkingHours(new Date('Sun Nov 06 2011 09:00:00 GMT+0800 (CST)'))).toBe(false);
            expect(queue._inWorkingHours(new Date('Sat Nov 12 2011 09:00:00 GMT+0800 (CST)'))).toBe(false);
        });
    });
});
