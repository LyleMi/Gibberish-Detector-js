'use strict';

const fs = require('fs');
const gib_detect = require('./gib_detect.js');
let lines = fs.readFileSync('test.txt').toString('utf8').split('\n');

function checkRate(nubmer) {
    var re = /^[0-9a-zA-Z]*$/g;
    if (!re.test(nubmer)) {
        return false;
    } else {
        return true;
    }
}

for (var i = 0; i < lines.length; i++) {

    if(!checkRate(lines[i])) {
        continue;
    }

    if (gib_detect.gib_dect(lines[i])) {
        console.log(lines[i]);
    }
    // console.log(lines[i], gib_detect.gib_dect(lines[i]));
}