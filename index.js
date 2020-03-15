// example array of bitstates
const bitStates = ["000", "001", "010", "011", "100", "101", "110", "111"];


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
    return counter;
}

console.log(getMins(permutate(bitStates, 6)));
