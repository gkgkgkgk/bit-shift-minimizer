// example array of bitstates
const bitStates = ["000", "001", "010", "011", "100", "101", "110", "111"];

const columns = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
[0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],
[0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
[0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
];

const permutate = (arr, l) => {
    let arrs = [];
    let counter = null;
    let sol = null;

    for (let i = 0; i < arr.length; i++) {
        let r = permutate(arr.slice(0, i).concat(arr.slice(i + 1)));

        if (!r.length) {
            arrs.push([arr[i]].slice(0, l));
        }
        else {
            for (let j = 0; j < r.length; j++) {
                arrs.push([arr[i]].concat(r[j]).slice(0, l));
            }
        }
    }

    return arrs;
}


const getMins = arrs => arrs.map(x => {
    return { "jumps": calculateBitJumps(x), x }
}).sort((a, b) => { return a.jumps - b.jumps }).filter((x, i, arr) => x.jumps == arr[0].jumps);




const calculateBitJumps = map => {
    let counter = 0;

    let invalidStates = getInvalidStates(map);

    for (let i = 0; i < map.length; i++) {
        let currentValue = map[i].split('');

        let jump = (map[i + 1] ? map[i + 1] : map[0]).split('');
        let doubleJump = (map[i + 2] ? map[i + 2] : map[0]).split('');


        counter += currentValue.reduce((acc, x, j) => {
            if (x != jump[j]) acc++;
            if (x != doubleJump[j]) acc++;
            return acc;
        }, 0);
    }

    for (let i = 0; i < invalidStates.length; i++) {
        let reset = map[0].split('');
        let iState = invalidStates[i].split('');
        counter += iState.reduce((acc, x, j) => {
            if (x != reset[j]) acc++;
            return acc;
        }, 0);
    }

    return counter;
}


const generateRows = states => {
    let rows = [];

    for (let i = 0; i < Math.pow(2, columns.length); i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
            row[j] = columns[j][i];
        }
        rows[i] = row;
    }

    return rows;
};

const getQNext = (row, states) => {
    let a1 = row[0];
    let a0 = row[1];
    let q2 = row[2];
    let q1 = row[3];
    let q0 = row[4];

    let r = { row, states, finalRow: [], qNext: null };

    if (!states.x.includes(`${q2}${q1}${q0}`)) {
        r.finalRow = [a1, a0, q2, q1, q0, "INVALID STATE"];
        r.qNext = "INVALID STATE";
        return r;
    }
    else if (a1 + a0 == 2) {
        r.finalRow = [a1, a0, q2, q1, q0, "INVALID INPUT"];
        r.qNext = "INVALID INPUT";
        return r;
    }
    else if (a1 + a0 == 0) {
        r.finalRow = [a1, a0, q2, q1, q0, q2, q1, q0];
        r.qNext = [q2, q1, q0];
        return r;
    }
    else {
        let index = 0
        let qNext = states.x[0];

        for (let i = 0; i < states.x.length; i++) {
            if (states.x[i] == `${q2}${q1}${q0}`) {
                index = i;
            }
        }

        if (a0 == 1) {
            if (index + 1 >= states.x.length) {
                qNext = states.x[0];
            }
            else {
                qNext = states.x[index + 1];
            }
        }
        else if (a1 == 1) {
            if (index + 2 >= states.x.length) {
                qNext = states.x[0];
            }
            else {
                qNext = states.x[index + 2];
            }
        }
        qNext = qNext.split('');
        r.finalRow = [a1, a0, q2, q1, q0, parseInt(qNext[2]), parseInt(qNext[1]), parseInt(qNext[0])];
        r.qNext = qNext;
        return r;
    }

}

const getCSVTable = (rows, columns, states) => {
    let s = "";
    let columnString = "";

    for (let i = 0; i < columns.length; i++) {
        columnString += `${columns[i] + (i == columns.length - 1 ? "" : ",")}`;
    }

    s += columnString + "\n";

    for (let i = 0; i < rows.length; i++) {
        let r = "";
        let qNext = getQNext(rows[i], states);
        for (let j = 0; j < qNext.finalRow.length; j++) {
            r += `${qNext.finalRow[j] + (j == qNext.finalRow.length - 1 ? "" : ",")}`
        }
        s += r + "\n";
    }

    return s;
}

const getInvalidStates = map => {
    return bitStates.filter(s => {
        let contains = false;
        for (let i = 0; i < map.length; i++) {
            if (map[i] == s) {
                contains = true;
            }
        }
        return !contains;
    })
}

let mins = getMins(permutate(bitStates, 6));

const findLeastBitChanges = () => {
    let states = permutate(bitStates, 6);
    let statesWJumps = [];
    for (let i = 0; i < states.length; i++) {
        statesWJumps[i] = { jumps: calculateBitJumps(states[i]), x: states[i], invalidStates: getInvalidStates(states[i]) };
    }

    let bits = [["000", "000"], ["000", "101"], ["001", "000"], ["001", "101"], ["010", "000"], ["010", "101"]];

    for (let i = 0; i < statesWJumps.length; i++) {
        let counter = 0;
        for (let j = 0; j < statesWJumps[i].x.length; j++) {
            let currentValue = statesWJumps[i].x[j].split('');
            for (let k = 0; k < currentValue.length; k++) {
                let b1 = bits[j][0].split('')[k];
                let b2 = bits[j][1].split('')[k];
                if (currentValue[k] != b1) counter++;
                if (currentValue[k] != b2) counter++;
            }
        }

        statesWJumps[i].totalJumps = statesWJumps[i].jumps + counter;
    }
    return statesWJumps;
}


console.log(findLeastBitChanges().sort((a, b) => { return ((a.totalJumps) - (b.totalJumps)) }).filter((a) => a.totalJumps == 31).length);
//console.log(findLeastBitChanges().filter((a) => a.x[1] == '010' && a.x[0] == '000' && a.x[2] == '011' && a.x[3] == '111').sort((a,b) => {return a.totalJumps - b.totalJumps}));


//console.log(mins);

// console.log(getQNext(generateRows({})[19], mins[0]));

// console.log(getCSVTable(generateRows({}), ["a1", "a0", "q2", "q1", "q0", "q2'", "q1'", "q0'"], mins[4]));
//console.log(getMins(permutate(bitStates, 6)).filter(arr => (arr.x[0] == "000" && arr.x[1] == "101")));
