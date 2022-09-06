const { Console } = require('console');
const fs = require("fs");

const logr = new Console({
    stdout: fs.createWriteStream("./logs/log.txt"),
    stderr: fs.createWriteStream("./logs/error.txt")
})

module.exports = logr;