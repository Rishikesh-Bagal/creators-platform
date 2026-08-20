/**
 * Demonstrates: Hoisting
 * 
 * In JavaScript, function declarations are hoisted to the top of their scope.
 * This allows us to call `capitalizeTitle` before it is formally defined in the code.
 */

// 1. We call the function BEFORE it is declared
const sampleTitle = capitalizeTitle("this is a test title");
console.log("Hoisting test:", sampleTitle);

// 2. We declare the function AFTER it is called
function capitalizeTitle(title) {
    if (!title) return '';
    return title
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export { capitalizeTitle };
