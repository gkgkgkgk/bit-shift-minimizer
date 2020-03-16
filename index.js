const fs = require("fs");

// example array of bitstates
const keyStates = ["$0.00", "$0.50", "$1.00", "$1.50", "$2.00", "$2.50", "Unallowed", "Unallowed"];
const bitStates = ["000", "001", "010", "011", "100", "101", "110", "111"];


const permutate = (arr, l) => {
    let arrs = [];

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

const arrayEquivilance = (arr1, arr2) => {

    if (arr1.length != arr2.length) return false;

    return arr1.every((x, i) => x == arr2[i]);

}

const getNextVendingMachine = table => {
    const map = ["010", "100", "000", "101", "001", "011"]; //getMins(permutate(bitStates, 6)).filter(x => x.x[0] == "000" && x.x[1] == "101" && x.x[2] == "001")[0].x;
    console.log(map);
    const sortMap = [...map].sort();
    const sortGMap = [...bitStates].sort();


    console.log("SM");

    console.log(sortMap);

    console.log(sortGMap);

    let unallowed = sortMap.reduce((acc, x, i) => {
        if (x != sortGMap[i]) {
            acc.push(sortGMap.splice(i, 1)[0].split(""));
        }
        return acc
    }, []);

    if (sortGMap.length != sortMap.length) {
        let arr = sortGMap.slice(sortMap.length, sortGMap.length);
        arr = arr.map(x => { return x.split('') });
        unallowed = unallowed.concat(arr);
    }


    const answerTable = table.map((row, i) => {

        if (i == 0) return ["Q'0", "Q'1", "Q'2"]

        inputRow = row.map(x => "" + x);

        if (unallowed.some(x => arrayEquivilance(x, inputRow.slice(4)))) return ['x', 'x', 'x'];

        if (inputRow[3] == '1') return map[0].split("");

        if (inputRow[2] == '1' || arrayEquivilance(inputRow.slice(0, 4), ['1', '1', '0', '0']) || arrayEquivilance(inputRow.slice(0, 4), ['0', '0', '0', '0'])) return inputRow.slice(4);

        if (inputRow[0] == '1' && inputRow[1] == '0') {
            const currentMap = inputRow.slice(4).join("");
            return map[map.indexOf(currentMap) + 1] ? map[map.indexOf(currentMap) + 1].split("") : map[0].split("");
        }

        if (inputRow[0] == '0' && inputRow[1] == '1') {
            const currentMap = inputRow.slice(4).join("");
            return map[map.indexOf(currentMap) + 2] ? map[map.indexOf(currentMap) + 2].split("") : map[0].split("");
        }

    });

    const fullTable = (table.map((x, i) => [...x.map(k => "" + k), ...answerTable[i]]));

    return [fullTable, [...map, ...unallowed]];



}

const makeStateTable = (key, nextFunc) => {
    let table = [key]

    for (let i = 0; i < Math.pow(2, key.length); i++) {
        let row = key.map((x, j) => i % Math.pow(2, key.length - j) >= Math.pow(2, key.length - j) / 2 ? 1 : 0);
        table.push(row);
    }

    const vals = nextFunc(table);

    const fullTable = vals[0];
    const mapping = vals[1];

    const mapStr = mapping.map((x, i) => `${keyStates[i]} : ${mapping[i]}`).join("\n");


    const tableStr = fullTable.map(x => x.join(",")).join("\n");

    fs.writeFile('Output.csv', tableStr, err => { if (err) throw err; });
    fs.writeFile('map.txt', mapStr, err => { if (err) throw err; });


    return fullTable;
}



const generateKMap = (table, inputKeys, outputKeys) => {

    // max 5 elemens in input keys

    const transpose = matrix => matrix.reduce(
        ($, row) => row.map((_, i) => [...($[i] || []), row[i]]),
        []
    );


    let tempTable = table.slice(1);

    tempTable = tempTable.filter(row => (row[2] == 0 && row[3] == 0));

    tempTable = [table[0], ...tempTable];


    const tempTableStr = tempTable.map(x => x.join(",")).join("\n");

    fs.writeFile("KMAP_TABLE.csv", tempTableStr, err => { if (err) throw err; });

    let newTable = transpose(tempTable);


    const TQTable = newTable.filter((x, i) => inputKeys.includes(x[0]));
    const TATable = newTable.filter((x, i) => outputKeys.includes(x[0]));

    const QTable = transpose(TQTable);
    const ATable = transpose(TATable);


    const geneate1D = (QT, AT) => {
        // QT must be length of 4

        const order = ["00", "01", "11", "10"];

        let kmaps = AT.map(x => [[], [], [], []]);

        QT.forEach((row, i) => {
            let y = "" + row[0] + row[1];
            let x = "" + row[2] + row[3];

            y = order.indexOf(y);
            x = order.indexOf(x);


            for (let j = 0; j < kmaps.length; j++) {
                kmaps[j][y][x] = AT[i][j];
            }
        });

        return kmaps;

    }

    let table1Key = [];
    let table2Key = [];

    const QTable1 = transpose(transpose(QTable.filter((x, i) => { if (x[4] == 0) table1Key.push(i); return x[4] == 0; })).slice(0, 4))
    const QTable2 = transpose(transpose(QTable.filter((x, i) => { if (x[4] == 1) table2Key.push(i); return x[4] == 1; })).slice(0, 4))

    const ATable1 = ATable.filter((x, i) => table1Key.includes(i));
    const ATable2 = ATable.filter((x, i) => table2Key.includes(i));


    // console.log(ATable1);

    let kmaps1 = geneate1D(QTable1, ATable1);
    let kmaps2 = geneate1D(QTable2, ATable2);

    console.log(kmaps1[0]);
    console.log(kmaps2[0]);




}


// console.log(getMins(permutate(bitStates,6)).filter(x=>x.x[0] == "000" && x.x[1] == "101" && x.x[2] == "001")[0]);


const table = makeStateTable(['A', 'B', 'C', 'D', 'Q0', 'Q1', 'Q2'], getNextVendingMachine);


generateKMap(table, ['A', 'B', "Q0", "Q1", "Q2"], ["Q'0", "Q'1", "Q'2"]); 