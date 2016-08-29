'use strict';

const fs = require('fs');
const gib_detect = require('./gib_detect.js');
let lines = fs.readFileSync('test.txt').toString('utf8').split('\n');

for (var i = 0; i < lines.length; i++) {
    console.log(lines[i], gib_detect.gib_dect(lines[i]));
}