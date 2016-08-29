'use strict';

const fs = require('fs');


let accepted_chars = 'abcdefghijklmnopqrstuvwxyz '

let k = accepted_chars.length;

let pos = {};

for (let i = 0; i < k; i++) {
    pos[accepted_chars[i]] = i;
}

let trainFile = 'big.txt';
let goodFile = 'good.txt';
let badFile = 'bad.txt';
let modelFile = 'gib_model.json';

function normalize(line) {
    var arr = line.toLowerCase().split('');
    return arr.filter(function(item) {
        return accepted_chars.indexOf(item) > -1;
    });
}

function train() {

    //Assume we have seen 10 of each character pair.  This acts as a kind of
    //prior or smoothing factor.  This way, if we see a character transition
    //live that we've never observed in the past, we won't assume the entire
    //string has 0 probability.
    let log_prob_matrix = Array();

    for (let i = 0; i < k; i++) {
        let temp = Array();
        for (let j = 0; j < k; j++) {
            temp.push(10);
        }
        log_prob_matrix.push(temp);
    }

    //Count transitions from big text file, taken 
    //from http://norvig.com/spell-correct.html
    let lines = fs.readFileSync(trainFile).toString('utf8').split('\n');
    //
    for (var key in lines) {
        //Return all n grams from l after normalizing
        var filtered_line = normalize(lines[key]);
        var a = false;
        for (var b in filtered_line) {
            if (a !== false) {
                log_prob_matrix[pos[a]][pos[filtered_line[b]]] += 1;
            }
            a = filtered_line[b];
        }
    }

    //Normalize the counts so that they become log probabilities.  
    //We use log probabilities rather than straight probabilities to avoid
    //numeric underflow issues with long texts.
    //This contains a justification:
    //http://squarecog.wordpress.com/2009/01/10/dealing-with-underflow-in-joint-probability-calculations/
    for (var i in log_prob_matrix) {
        var s = log_prob_matrix[i].reduce(function(a, b) {
            return a + b;
        });
        for (var j in log_prob_matrix[i]) {
            log_prob_matrix[i][j] = Math.log(log_prob_matrix[i][j] / s);
        }
    }

    //Find the probability of generating a few arbitrarily choosen good and
    //bad phrases.
    let good_lines = fs.readFileSync(goodFile).toString('utf8').split('\n');
    let good_probs = Array();
    for (var key in good_lines) {
        good_probs.push(averageTransitionProbability(good_lines[key], log_prob_matrix));
    }

    let bad_lines = fs.readFileSync(badFile).toString('utf8').split('\n');
    let bad_probs = Array();
    for (var key in bad_lines) {
        bad_probs.push(averageTransitionProbability(bad_lines[key], log_prob_matrix));
    }

    //Assert that we actually are capable of detecting the junk.
    let min_good_probs = Math.min.apply(null, good_probs);
    let max_bad_probs = Math.max.apply(null, bad_probs);
    if (min_good_probs <= max_bad_probs) {
        return false;
    }

    //And pick a threshold halfway between the worst good and best bad inputs.
    let threshold = (min_good_probs + max_bad_probs) / 2;
    
    console.log('good', good_probs);
    console.log('bad', bad_probs);
    console.log('th', threshold);
    
    //save matrix
    fs.writeFileSync(modelFile, JSON.stringify({
        'matrix': log_prob_matrix,
        'threshold': threshold
    }));
    return true;
}

function averageTransitionProbability(line, log_prob_matrix) {
    //Return the average transition prob from line through log_prob_mat.
    let log_prob = 1.0;
    let transition_ct = 0;

    var filtered_line = normalize(line);
    var a = false;

    for (var b in filtered_line) {
        if (a !== false) {
            log_prob += log_prob_matrix[pos[a]][pos[filtered_line[b]]];
            transition_ct += 1;
        }
        a = filtered_line[b];
    }

    return Math.exp(log_prob / (transition_ct || 1));
}

//train();

exports.averageTransitionProbability = averageTransitionProbability;