
describe("Test group for front-app", () => {
    it("should return a second pow", () => {
        expect(Math.pow(2,2)).toBe(4);
    });

    it("should return a third pow", () => {
        expect(Math.pow(2,3)).toBe(8);
    });

    it("shouldn't be a squad", () => {
        expect(Math.pow(2,3)).not.toBe(4);
        expect(+prompt("")).toBeGreaterThan(6)
    });
});

