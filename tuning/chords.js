const chordTypes = {

    "0": { "root": 0, "type": "Unison", "tuning": "1"},

// ------------- INTERVALS ------------------------

    "0,1": { "root": 0, "type": "Minor Second", "tuning": "15:16"},
    "0,2": { "root": 0, "type": "Major Second", "tuning": "8:9"}, // greater tone
    "0,3": { "root": 0, "type": "Minor Third", "tuning": "5:6"}, // just is 5:6, septimal is 6:7
    "0,4": { "root": 0, "type": "Major Third", "tuning": "4:5"},
    "0,5": { "root": 0, "type": "Perfect Fourth", "tuning": "3:4"},
    "0,6": { "root": 0, "type": "Tritone"},
    "0,7": { "root": 0, "type": "Perfect Fifth", "tuning": "2:3"},
    "0,8": { "root": 0, "type": "Minor Sixth"},
    "0,9": { "root": 0, "type": "Major Sixth"},
    "0,10": { "root": 0, "type": "Minor Seventh"},
    "0,11": { "root": 0, "type": "Major Seventh"},
    //"0,12": { "root": 0, "type": "Octave"},
    //"0,13": { "root": 0, "type": "Minor Ninth"},
    //"0,14": { "root": 0, "type": "Major Ninth"},

// ------------- TRIADS ---------------------------

    "0,4,7": { "root": 0, "type": "Major", "tuning": "4:5:6"},
    "0,3,8": { "root": 2, "type": "Major (first inversion)", "tuning": "5:6:8"},
    "0,5,9": { "root": 1, "type": "Major (second inversion)", "tuning": "6:8:10"},
    "0,3,7": { "root": 0, "type": "Minor", "tuning": "10:12:15"}, // just minor triad
    "0,4,9": { "root": 2, "type": "Minor (first inversion)"},
    "0,5,8": { "root": 1, "type": "Minor (second inversion)"},
    "0,3,6": { "root": 0, "type": "Diminished", "tuning": "5:6:7"}, // also "25:30:36"
    "0,4,8": { "root": 0, "type": "Augmented", "tuning": "8:10:13"}, // perfect augmented
    "0,4,10": { "root": 0, "type": "Dominant Seventh (fifth omitted)", "tuning": "4:5:7"},

// -------------- TETRADS -------------------------

    "0,4,7,10": { "root": 0, "type": "Dominant Seventh", "tuning": "4:5:6:7"},
    "0,3,6,8": { "root": 3, "type": "Dominant Seventh (first inversion)", "tuning": "5:6:7:8"},
    "0,3,5,9": { "root": 2, "type": "Dominant Seventh (second inversion)", "tuning": "6:7:8:10"},
    "0,2,6,9": { "root": 1, "type": "Dominant Seventh (third inversion)", "tuning": "7:8:10:12"},
    "0,3,7,10": { "root": 0, "type": "Minor Seventh", "tuning": "10:12:15:18"}, // note there is also septimal tuning
    "0,4,7,9": { "root": 3, "type": "Minor Seventh (first inversion)"},
    "0,3,5,8": { "root": 2, "type": "Minor Seventh (second inversion)"},
    "0,2,5,9": { "root": 1, "type": "Minor Seventh (third inversion)"},
    "0,3,6,10": { "root": 0, "type": "Half-diminished Seventh", "tuning": "5:6:7:9"},
    "0,3,7,9": { "root": 3, "type": "Half-diminished Seventh (first inversion)", "tuning": "6:7:9:10"},
    "0,4,6,9": { "root": 2, "type": "Half-diminished Seventh (second inversion)"},
    "0,2,5,8": { "root": 1, "type": "Half-diminished Seventh (third inversion)"},
    "0,4,7,11": { "root": 0, "type": "Major Seventh", "tuning": "8:10:12:15" },
    "0,3,7,8": { "root": 3, "type": "Major Seventh (first inversion)", "tuning": "10:12:15:16" },
    "0,4,5,9": { "root": 2, "type": "Major Seventh (second inversion)", "tuning": "12:15:16:20" },
    "0,1,5,8": { "root": 1, "type": "Major Seventh (third inversion)", "tuning": "15:16:20:24" },
    "0,2,4,10": { "root": 0, "type": "Dominant Ninth (fifth omitted)", "tuning": "8:9:10:14" }

};


const chordTunings = {

// --------------- INTERVALS ----------------------

    "1": "Perfect Octave",
    "1/3": "Perfect Fifth / Fourth",
    "3/5": "Just Minor Third / Major Sixth",
    "1/5": "Just Major Third / Minor Sixth",
    "5/7": "Harmonic Tritone",
    "3/7": "Septimal Minor Third / Major Sixth",
    "1/7": "Harmonic Minor Seventh / Supermajor Second",
    "5/9": "Just Minor Seventh / Lesser Tone",
    "1/9": "Greater Tone / Pythagorean Minor Seventh",
    "7/9": "Greater Major Third",
    "5/11": "Lesser Undecimal Neutral Second (11th-related)",
    "9/11": "Neutral Third",
    "1/13": "Minor Sixth (13th-related)",
    "7/15": "Septimal Minor Second",
    "1/15": "Just Minor Second / Major Seventh",

// ----------------- TRIADS -----------------------

    "1/3/5":"Just Major",
    "1/5/7": "Dominant Seventh (fifth omitted)",
    "3/5/7": "Perfect Diminished",
    "3/7/9": "Dominant Ninth (root and third omitted)",
    "1/5/13": "Perfect Augmented",
    "3/5/15": "Just Minor",
    "6/15/19": "Greater Augmented",
    "1/5/25": "Just Augmented",
    "1/3/19": "19-Limit Minor",
    "9/15/25": "Just Diminished",
    "1/5/27": "Supertonic Minor",
    "1/27/45": "45-Limit Diminished",
    "1/27/81": "Pythagorean Minor",

// ---------------- TETRADS --------------------------

    "1/3/5/7": "Dominant Seventh",
    "3/5/7/9": "Half-diminished Seventh",
    "1/5/7/9": "Dominant Ninth (fifth omitted)",
    "1/3/5/9": "Added Ninth",
    "1/3/5/15": "Just Major Seventh",
    "3/5/9/15": "Just Minor Seventh / Major Sixth",
    "3/7/9/21": "Septimal Minor Seventh / Major Sixth",
    "9/15/25/45": "45-Limit Half-diminished Seventh",
    "3/5/15/75": "Minor-major Seventh",
    "5/9/25/125": "Augmented Dominant Seventh",
    "27/45/75/125": "Diminished Seventh"

};

// divides a number by two as many times as possible
function removeOctave(number) {
    var num = parseInt(number);
    while (num % 2 == 0) {
        num /= 2;
    }
    return num;
};

// lower all notes to their lowest possible octave in the harmonic series
function reduceChord(chord) {
    // lower notes and sort
    var ratios = chord.split("/").map(removeOctave).sort((a, b) => a - b);
    // remove duplicates
    var ratios = [...new Set(ratios)];
    // return result
    return ratios.join("/");
}