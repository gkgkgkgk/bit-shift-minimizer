
# bit-shift-minimizer

This script finds the minimum amount of bit-jumps in a sequence of binary numbers, therefore optimizing the boolean algebra generated from karnaugh maps.

  

## The Algorithm

  

The code is here is a bit sloppy, and can definitely be more generalized, but it does the job pretty quickly and efficiently.

  
This line initializes an array that contains all of the possible states that can be used for the project.
```const bitStates = ["000", "001", "010", "011", "100", "101", "110", "111"];```
  
  Instead of automatically generating the columns in the truth table, I generated one in notepad++ and copied it into the code. It was just faster and easier considering it will be the same every time the code is run.
```
const columns = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],

[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],

[0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1],

[0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1],

[0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]

];
``` 


  
 This function ``permutate()`` takes an  array of objects and returns ever possible permutation of those objects in the array. 
```
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
```

   The function ``calculateBitJumps()`` takes a mapping as an input and calculates the amount of bit shifts within that mapping. ``Jump`` and ``doubleJump`` are the states that are one away and two away from the current state (the states can either move one or two forward). A ``reduce`` function is used to calculate the total amount of times the bits are different between a current state and a potential next state.
```
const calculateBitJumps = map => {
	let counter = 0;
	let invalidStates = getInvalidStates(map); // get all of the invalid states for this mapping

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
```

  
  
``getInvalidStates()`` is a small function that finds the invalid states for a mapping.
```
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
```
 This function actually uses all of the previous functions to output an array with mappings that have calculated total amounts of bit shifts.
```
const  findLeastBitChanges  = () => {
	let  states  =  permutate(bitStates, 6);
	let  statesWJumps  = [];
	
	for (let  i  =  0; i  <  states.length; i++) {
		statesWJumps[i] = { jumps: calculateBitJumps(states[i]), x: states[i], invalidStates: getInvalidStates(states[i]) };
	}

	// these bits represent the output bits
	let  bits  = [["000", "000"], ["000", "101"], ["001", "000"], ["001", "101"], ["010", "000"], ["010", "101"]];

	// get jumps between mapping and outputs
	for (let  i  =  0; i  <  statesWJumps.length; i++) {
		let  counter  =  0;

		for (let  j  =  0; j  <  statesWJumps[i].x.length; j++) {
			let  currentValue  =  statesWJumps[i].x[j].split('');
			
			for (let  k  =  0; k  <  currentValue.length; k++) {
				let  b1  =  bits[j][0].split('')[k];
				let  b2  =  bits[j][1].split('')[k];
				
				if (currentValue[k] !=  b1) counter++;
				if (currentValue[k] !=  b2) counter++;

			}
		}

		statesWJumps[i].totalJumps  =  statesWJumps[i].jumps  +  counter;
	}
	return  statesWJumps;
}
```