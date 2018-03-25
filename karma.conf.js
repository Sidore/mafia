module.exports = function(config) {
    config.set({
        basePath: "./tests",
        frameworks: [ "jasmine" ],
        files : [
            { pattern: "./*.js" }
        ],
        autoWatch : true
    });
};
