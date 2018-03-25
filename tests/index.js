
describe("Test group for front-app", function(){

    it("should return a second pow", function(){
        expect(Math.pow(2,2)).toBe(4);
    })

    it("should return a third pow", function(){
        expect(Math.pow(2,3)).toBe(8);
    })

    it("shouldn't be a squad", function(){
        expect(Math.pow(2,3)).not.toBe(4);
        expect(+prompt("")).toBeGreaterThan(6)
    })

})

