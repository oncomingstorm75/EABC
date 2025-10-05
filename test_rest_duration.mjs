// Test rest duration calculation

const testEABC = `X:1
T:Rest Test
M:4/4
L:1/4
Q:1/4=72
K:D

% Should be 16 quarter notes of rest (8+8)
z8 | z8 |

% First actual note should be at tick 7680 (16 * 480)
w: test
D2 |
`;

const calculateDuration = (multiplier, divisor, defaultLength, ticksPerQuarter) => {
  let duration = ticksPerQuarter;
  
  if (defaultLength === '1/8') duration = ticksPerQuarter / 2;
  if (defaultLength === '1/16') duration = ticksPerQuarter / 4;
  if (defaultLength === '1/2') duration = ticksPerQuarter * 2;
  
  if (multiplier) duration *= parseInt(multiplier);
  if (divisor) duration /= parseInt(divisor.substring(1));
  
  return Math.round(duration);
};

// Test the pattern
const testLine = "z8 | z8 |";
const notePattern = /([A-Ga-g][',]*|z|\[[^\]]+\])(\d*)(\/\d+)?/g;
let noteMatch;
let tickPosition = 0;
const ticksPerQuarter = 480;

console.log("Testing line:", testLine);
console.log("Pattern:", notePattern);
console.log("");

while ((noteMatch = notePattern.exec(testLine)) !== null) {
  const [fullMatch, pitch, multiplier, divisor] = noteMatch;
  console.log("Match:", {fullMatch, pitch, multiplier, divisor});
  
  if (pitch === 'z') {
    const duration = calculateDuration(multiplier, divisor, '1/4', ticksPerQuarter);
    console.log(`  Rest: ${multiplier || '(none)'} -> duration: ${duration} ticks (${duration/480} quarter notes)`);
    tickPosition += duration;
    console.log(`  Tick position now: ${tickPosition}`);
  }
}

console.log("\nFinal tick position:", tickPosition);
console.log("Expected: 7680 ticks (16 quarter notes)");
console.log("Match:", tickPosition === 7680 ? "✅ CORRECT" : "❌ WRONG");