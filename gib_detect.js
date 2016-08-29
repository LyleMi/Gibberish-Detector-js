'use strict';

const fs = require('fs');
const gib_detect_train = require('./gib_detect_train.js');

let model_data = JSON.parse(fs.readFileSync('gib_model.json').toString('utf8'));

function judge(line) {
    return gib_detect_train.averageTransitionProbability(line, model_data.matrix) > model_data.threshold
}

let lines = fs.readFileSync('test.txt').toString('utf8').split('\n');

for (var i = 0; i < lines.length; i++) {
    console.log(lines[i], judge(lines[i]));
}