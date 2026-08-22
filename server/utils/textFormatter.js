/**
 * HOISTING DEMONSTRATION:
 * 
 * 1. Function Declarations: Hoisted to the top of their scope.
 *    This allows us to call `capitalizeTitle` BEFORE it is declared in the code.
 * 
 * 2. `var`: Hoisted but initialized as `undefined`.
 * 
 * 3. `let` / `const`: Hoisted but remain in the Temporal Dead Zone (TDZ).
 *    Accessing them before declaration throws a ReferenceError.
 */

// --- 1. Function Declaration Hoisting ---
// Safe to call before declaration!
const sampleTitle = capitalizeTitle("this is a test title");
console.log("Function Hoisting test:", sampleTitle);

// --- 2. var Hoisting ---
// Returns undefined, doesn't throw an error.
console.log("Var Hoisting test:", hoistedVar);
var hoistedVar = "I am a var";

// --- 3. let/const Temporal Dead Zone (TDZ) ---
// If we uncommented the next line, it would throw: ReferenceError: Cannot access 'hoistedLet' before initialization
// console.log("Let Hoisting test:", hoistedLet);
let hoistedLet = "I am a let";

// The function declaration itself:
export function capitalizeTitle(title) {
    if (!title) return '';
    return title
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

