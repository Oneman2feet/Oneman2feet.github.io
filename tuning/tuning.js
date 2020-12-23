// globals
var synth;
var tune;
var activeNotes = {};
var fundamental = {
    "frequency": undefined,
    "semitonesFromC3": undefined
};
var currentChord = {
    "midi": {}, // mapping of midi to integer
    "integer": "" // comma delimited integer notation
};

// returns [0,11] for pitch class
function toPitchClass(semitones) {
    return ((semitones % 12) + 12) % 12;
}

// play higher frequencies softer
function volOfFreq(freq) {
    var vol = Math.min(1, 15000 / Math.pow(freq, 2));
    return vol;
}

function setFundamental(freq, semitones) {
    fundamental['frequency'] = freq;
    fundamental['semitonesFromC3'] = semitones;
    tune.tonicize(freq);
    var equal = Tone.Frequency("C3").transpose(semitones);
    document.getElementById("fundamental").innerHTML = "<strong>" + equal.toNote() + "</strong> " + differenceInCents(freq, equal.toFrequency()) + " <em>(" + freq.toFixed(2) + ")</em>";
}

function adjustFundamental(ratio, semitones) {
    var freq = fundamental['frequency'] * ratio;
    var semi = parseInt(fundamental['semitonesFromC3']) + parseInt(semitones);
    setFundamental(freq, semi);
}

function differenceInCents(a, b) {
    var cents = Math.round(1200 * Math.log(a / b) / Math.log(2));
    cents = (cents < 0 ? "" : "+") + cents; // add +/-
    return cents;
}

function updateMetrics() {
    updateNotes();
    updateNoteRatios();
    updateChordNames();
    updateChordTunings();
}

function updateNotes() {
    var notes = [];
    for (key in activeNotes) {
        if (activeNotes[key]) {
            var equal = Tone.Frequency(key).toFrequency();
            var cents = differenceInCents(activeNotes[key], equal);
            notes.push({
                "name": key,
                "freq": activeNotes[key],
                "cents": cents
            });
        }
    }
    notes.sort((a, b) => b.freq - a.freq); // high notes first
    notes = notes.map((el) => "<tr><td>" + el.name+"</td><td>" + el.cents + "</td></tr>").join("");
    document.getElementById("notes").innerHTML = notes;
}

function updateNoteRatios() {
    var notes = [];
    var ratios = "";
    for (key in activeNotes) {
        if (activeNotes[key]) {
            notes.push(activeNotes[key]);
        }
    }
    notes.sort((a, b) => a - b);
    if (notes.length > 1) {
        var lowest = notes[0];
        notes = notes.map(note => new Fraction(note / lowest).simplify());
        var den = 1;
        for (note in notes) {
            den *= notes[note].d;
        }
        notes = notes.map(note => Math.round(note * den)); // rounding for floating point errors

        var gcd = math.gcd.apply(null, notes); // reduce ration by gcd
        notes = notes.map(note => note / gcd);
        ratios = notes.join("/");
    }
    document.getElementById("ratios").innerHTML = ratios;
}

function updateChordNames() {
    var notes = [];
    for (key in activeNotes) {
        if (activeNotes[key]) {
            notes.push(Tone.Frequency(key).toMidi());
        }
    }
    notes.sort();
    var bass = notes[0];
    // make mapping of midi notes to integer notation
    currentChord.midi = {};
    for (note in notes) {
        currentChord.midi[notes[note]] = toPitchClass(notes[note] - bass);
    }
    // reduce to integer notation, drop all notes to the same octave
    currentChord.integer = [...new Set(notes.map(note => currentChord.midi[note]))].sort((a, b) => a - b).join(",");
    var chordType = chordTypes[currentChord.integer];
    if (chordType) {
        // find out what note is the root using the midi mapping
        var rootInt = currentChord.integer.split(",")[chordType.root];
        var rootMidi = Object.keys(currentChord.midi).find(key => currentChord.midi[key]==rootInt);
        var root = Tone.Frequency(rootMidi, "midi").toNote().replace(/[0-9]/g, "");
        document.getElementById("chordtype").innerHTML = root + " " + chordType.type;
    }
    else {
        document.getElementById("chordtype").innerHTML = "";
    }
}

function updateChordTunings() {
    var ratios = document.getElementById("ratios").innerHTML;
    var chordTuning = chordTunings[reduceChord(ratios)];
    if (chordTuning) {
        document.getElementById("chordtuning").innerHTML = chordTuning;
    }
    else {
        document.getElementById("chordtuning").innerHTML = "";
    }
}

// given an anchor note, tune the current chord
// using the chord types dictionary
function tuneDynamically(anchor, notes, noteToPlay) {
    var chordInt = currentChord.integer;
    var dynamicTuning = chordTypes[chordInt].tuning;
    var anchorInt = currentChord.midi[anchor.midi];

    // based on the frequency ratios of the dynamic tuning
    // and the anchor note and frequency
    // compute the frequencies needed for the chord
    var anchorIndex = chordInt.split(",").findIndex(el => el==anchorInt);
    var anchorRatio = dynamicTuning.split(":")[anchorIndex];
    var harmonicSeriesFundamental = anchor.freq / anchorRatio;

    // for each note in the chord, compute the adjusted frequency to use
    for (note in notes) {
        var currentName = notes[note].name;
        var currentMidi = notes[note].midi;
        var currentInt = currentChord.midi[currentMidi]
        var currentIndex = chordInt.split(",").findIndex(el => el==currentInt);
        var currentRatio = dynamicTuning.split(":")[currentIndex];
        var currentFreq = harmonicSeriesFundamental * currentRatio;

        // calculate cents difference and change octaves as needed
        var equal = Tone.Frequency(currentName).toFrequency();

        while (parseInt(differenceInCents(currentFreq, equal)) > 600) {
            currentFreq /= 2;
        }

        while (parseInt(differenceInCents(currentFreq, equal)) < -600) {
            currentFreq *= 2;
        }

        // always play this note if this is the noteToPlay
        if (activeNotes[currentName]==noteToPlay) {
            synth.triggerAttack(currentFreq, Tone.now(), volOfFreq(currentFreq));
            activeNotes[currentName] = currentFreq;
        }
        else if (parseInt(differenceInCents(currentFreq, activeNotes[currentName]))!==0)//activeNotes[currentName]!=currentFreq)
        {
            console.log("adjusting note from " + activeNotes[currentName] + " to " + currentFreq);
            // TODO: change pitch without triggering a new attack
            synth.triggerRelease(activeNotes[currentName], Tone.now());
            synth.triggerAttack(currentFreq, Tone.now(), volOfFreq(currentFreq));
            activeNotes[currentName] = currentFreq;
        }
    }
}

function updateDynamicTuning(noteToPlay) {
    if (chordTypes[currentChord.integer]
        && chordTypes[currentChord.integer]
        && chordTypes[currentChord.integer].tuning) {
        var notes = [];
        for (key in activeNotes) {
            if (activeNotes[key]) {
                notes.push({"name": key, "pitchClass": toPitchClass(Tone.Frequency(key).toMidi()), "midi": Tone.Frequency(key).toMidi(), "freq": activeNotes[key]});
            }
        }
        // if the fundamental is being played, anchor around it
        var tonic = toPitchClass(fundamental['semitonesFromC3']);
        var anchor = notes.find(el => el.pitchClass == tonic);
        if (anchor) {
            tuneDynamically(anchor, notes, noteToPlay);
        }
        else {
            // if tonic is not present, anchor on the justly tuned fifth
            var dominant = toPitchClass(parseInt(fundamental['semitonesFromC3']) + 7);
            var anchor = notes.find(el => el.pitchClass == dominant);
            if (anchor) {
                // tune the anchor justly first
                var just = fundamental.frequency / 2 * 3;

                // calculate cents difference and change octaves as needed
                var equal = Tone.Frequency(anchor.name).toFrequency();

                while (parseInt(differenceInCents(just, equal)) > 600) {
                    just /= 2;
                }

                while (parseInt(differenceInCents(just, equal)) < -600) {
                    just *= 2;
                }

                anchor.freq = just;
                tuneDynamically(anchor, notes, noteToPlay);
            }
            else {
                // third option is to anchor around subdominant
                var subdominant = toPitchClass(parseInt(fundamental['semitonesFromC3']) + 5);
                var anchor = notes.find(el => el.pitchClass == subdominant);
                if (anchor) {
                    // tune the anchor justly first
                    var just = fundamental.frequency / 3 * 4;

                    // calculate cents difference and change octaves as needed
                    var equal = Tone.Frequency(anchor.name).toFrequency();

                    while (parseInt(differenceInCents(just, equal)) > 600) {
                        just /= 2;
                    }

                    while (parseInt(differenceInCents(just, equal)) < -600) {
                        just *= 2;
                    }

                    anchor.freq = just;
                    tuneDynamically(anchor, notes, noteToPlay);
                }
                else {
                    if (noteToPlay!==undefined) {
                        synth.triggerAttack(noteToPlay, Tone.now(), volOfFreq(noteToPlay));//, e.velocity);
                    }
                }
            }
        }
    }
    else if (noteToPlay!==undefined) {
        synth.triggerAttack(noteToPlay, Tone.now(), volOfFreq(noteToPlay));//, e.velocity);
    }
}

window.onload = function() {
    // Controls
    [...document.getElementsByName("temperament")].forEach((elem) => {
        elem.onclick = () => {
            tune.loadScale(elem.value);
        };
    });

    [...document.getElementsByName("tonic")].forEach((elem) => {
        elem.onclick = () => {
            // elem.value is the number of semitones above C3
            var semitones = elem.value
            // set fundamental using equal temperament
            var freq = Tone.Frequency("C3").transpose(semitones).toFrequency();
            setFundamental(freq, semitones);
        };
    });

    document.getElementById("clearNotes").onclick = function() {
        synth.releaseAll();
        activeNotes = {};
        updateMetrics();
    }

    document.getElementById("volslider").oninput = function() {
        synth.volume.value =  8.3 + 1000 / (-this.value-20); // y-intercept of -40, x-intercept of 0
    }

    // Start audio system
    document.getElementById("enterBtn").addEventListener('click', async () => {
        await Tone.start();

        // create a synth and connect it to the main output (your speakers)
        synth = new Tone.PolySynth().toDestination();

        synth.set({
            "envelope": {
                "attack": 0.1,
                "decay": 0
            },
            "oscillator": {
                "type": "custom", // set to "custom" for partials to be used
                "partialCount": 16,
                "partials": [
                    1, 0.1, 0.2, 0.1, 0.2, 0.01,
                    0.008, 0.008, 0.0025, 0.004, 0.0025, 0.0025, 0.004, 0.0025, 0.0005, 0.0025
                ]
            }
        });

        // set the volume
        synth.volume.value = 8.3 + 1000 / (-document.getElementById("volslider").value-20);

        // create a Tune.js instance
        tune = new Tune();

        // Load the selected scale
        var scale = document.querySelector('input[name="temperament"]:checked').value;
        tune.loadScale(scale);

        // Set the fundamental using equal temperament and checked tonic
        var semitones = document.querySelector('input[name="tonic"]:checked').value;
        var freq = Tone.Frequency("C3").transpose(semitones).toFrequency();
        setFundamental(freq, semitones);

        // change UI
        document.getElementById("enterScreen").className = "entered";
    });
}

WebMidi.enable(function (err) {
    console.log(WebMidi.inputs);
    console.log(WebMidi.outputs);

    // Retrieve an input by name, id or index
    //var input = WebMidi.getInputByName("MPKmini2");
    var input = WebMidi.getInputByName("loopMIDI Port");

    // Listen for a 'note on' message on all channels
    input.addListener('noteon', "all",
        function (e) {
            // convert from midi to scale
            var note = tune.note(e.note.number - fundamental['semitonesFromC3'] - 60, 1);

            // keep track of this note
            var notename = e.note.name + e.note.octave;
            if (activeNotes[notename]) {
                console.log("this key is already pressed: " + notename);
                synth.triggerRelease([activeNotes[notename]], Tone.now());
            }
            else {
                activeNotes[notename] = note;
            }

            // play note
            //synth.triggerAttack(note, Tone.now(), volOfFreq(note));//, e.velocity);

            updateMetrics();

            // dynamic tuning
            if (document.getElementById("dynamic").checked) {
                updateDynamicTuning(note); // this also plays the note
                updateMetrics();
            }
            else {
                synth.triggerAttack(note, Tone.now(), volOfFreq(note));//, e.velocity);
            }
        }
    );

    // Listen for a 'note off' message on all channels
    input.addListener('noteoff', "all",
        function (e) {
            // release the note(s) that are currently held from this midi key
            var notename = e.note.name + e.note.octave;
            if (activeNotes[notename]) {
                synth.triggerRelease([activeNotes[notename]], Tone.now());
                delete activeNotes[notename];
            }
            else {
                console.log("released note that was not pressed: " + notename);
            }

            updateMetrics();

            // dynamic tuning
            if (document.getElementById("dynamic").checked) {
                updateDynamicTuning();
                updateMetrics();
            }
        }
    );
});
