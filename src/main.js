
const env = require("./env").default;

let runTests = false;
let thorough = true;

for (const arg of process.argv) {
    if (arg === "--run-unit-tests") {
        runTests = true;
    }
    if (arg === "--thorough") {
        thorough = true;
    }
    if (arg === "--shallow") {
        thorough = false;
    }
}

if (runTests) {
    process.env.ITCH_LOG_LEVEL = "error";
}

let quickTests = (runTests && !thorough);
let beFast = (env.name === "production") || quickTests;

if (!beFast) {
    const logger = require("./logger").default;
    logger.info("Enabling slow but detailed stack traces");
    require("bluebird").config(
        {
            longStackTraces: true,
            warnings: true,
        }
    );

    require("source-map-support").install({
        hookRequire: true,
    });
}

if (env.name !== "test") {
    require("./util/crash-reporter").mount();
}

if (env.name === "test") {
    require("./boot/test-paths").setup();
}

if (env.name === "development") {
    global.require = require;
    setInterval(function () { }, 400);

    global.wait = function (p) {
        p
            .then((res) => console.log("Promise result: ", res))
            .catch((e) => console.log("Promise rejected: ", e))
    }
}

function main() {
    if (runTests) {
        require("./unit-tests/run-unit-tests");
    } else {
        require("./metal");
    }
}

main();
