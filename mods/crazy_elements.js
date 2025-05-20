// Utility Functions

const random = function(min, max){
    return min + (Math.random() * (max - min));
}

/**
 * Returns a random float between 0 and `range`, not including `range`.
 * Generates multiple numbers based on `rerolls` and chooses the one closest to `target`.
 * @param {object} params
 * @param {number} params.range
 * @param {number} params.target
 * @param {number} params.rerolls
 */
const biasedRandom = function({range, target, rerolls}){
  const numbers = [];
  for (let i = 0; i < rerolls; i++){
    numbers.push(Math.random() * range);
  }
  
  let result = numbers[0];
  for (let i = 1; i < numbers.length; i++){ // Intentionally skips the first number in the array, because result is initialized to that number already
    const oldDifference = Math.abs(target - result);
    const newDifference = Math.abs(target - numbers[i]);
    if (newDifference < oldDifference){
      result = numbers[i];
    }
  }

  return result;
}

/**
 * Returns a random float between 0 and `range`, not including `range`.
 * Generates multiple numbers based on `rerolls` and chooses the one closest to `target`, wrapping around between 0 and `range`.
 * @param {object} params
 * @param {number} params.range
 * @param {number} params.target
 * @param {number} params.rerolls
 */
const biasedWrapAroundRandom = function({range, target, rerolls}){
  const numbers = [];
  for (let i = 0; i < rerolls; i++){
    numbers.push(Math.random() * range);
  }
  
  let result = numbers[0];
  for (let i = 1; i < numbers.length; i++){ // Intentionally skips the first number in the array, because result is initialized to that number already
    const oldDifference = Math.abs(wrapDifference(target, result, range));
    const newDifference = Math.abs(wrapDifference(target, numbers[i], range));
    if (newDifference < oldDifference){
      result = numbers[i];
    }
  }

  return result;
}

const wrapDifference = function(from, to, wrapPoint){
  let difference = to - from;
  const halfWrapPoint = wrapPoint / 2;

  if (difference > halfWrapPoint){
    difference -= wrapPoint;
  } else if (difference < -halfWrapPoint){
    difference += wrapPoint;
  }

  return difference;
}

//  Color Functions

/**
 * @param {string} rgbString A string in the form 'rgb(r,g,b)'
 */
const getRgbArrayFromString = function(rgbString){
  rgbStringParts = rgbString
    .slice(4, rgbString.length-1) // Remove the 'rgb(' and ')'
    .split(',');

  return [
    parseInt(rgbStringParts[0]),
    parseInt(rgbStringParts[1]),
    parseInt(rgbStringParts[2]),
  ]
}

const hslArrayFromPixel = function(pixel){
  return rgbToHsl(getRgbArrayFromString(pixel.color));
}

const hslToRgbString = function([h, s, l]){
  let [r, g, b] = hslToRgb([h, s, l]);
  // The staining logic breaks if the rgb values aren't integers
  r = Math.floor(r);
  g = Math.floor(g);
  b = Math.floor(b);
  return `rgb(${r}, ${g}, ${b})`;
}

// Found these at https://www.30secondsofcode.org/js/s/rgb-hex-hsl-hsb-color-format-conversion/
const rgbToHsl = ([r, g, b]) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};
const hslToRgb = ([h, s, l]) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
};

// End of Color Functions

const emitFire = function(pixel, xOffset = 0, yOffset = 1, spawnElement = "fire", chance = 0.025){ // Taken from behaviors.MOLTEN and tweaked a bit
  const x = pixel.x + xOffset;
  const y = pixel.y + yOffset;
  if (Math.random() < chance && isEmpty(x, y)) {
    createPixel(spawnElement, x, y);
    pixelMap[x][y].temp = pixel.temp;
    if (elements[pixel.element].fireColor) {
        pixelMap[x][y].color = pixelColorPick(pixelMap[x][y],elements[pixel.element].fireColor);
    }
  }
}

/**
 * Runs passed in functions in a random order
 * until one of them returns true.
 * @returns true if one of the input functions returns true, otherwise false
 */
const tryRandomOrder = function(...funcs){
  shuffleArray(funcs);
  for(let i = 0; i < funcs.length; i++){
    const result = funcs[i]();
    if (result) {
      return true;
    }
  }

  return false;
}

const getPixelOrNull = function(x, y){
  if (isEmpty(x, y, true)){
    return null;
  } else {
    return pixelMap[x][y];
  }
}

elements.hyper_powder = {
  color: "#ef409c",
  behavior: [
    ["XX","XX","XX","XX","XX"],
    ["XX","XX","XX","XX","XX"],
    ["XX","XX","XX","XX","XX"],
    ["XX","XX","XX","XX","XX"],
    ["M2","XX","M1","XX","M2"],
  ],
  category: "special",
  state: "solid",
  density: 1602,

  tempHigh: 1700,
  stateHigh: "molten_hyper_powder",
}

elements.hyper_fluid = {
  color: "#b31cff",
  behavior: [
    ["XX","XX","XX","XX","XX"],
    ["XX","XX","XX","XX","XX"],
    ["M2","XX","XX","XX","M2"],
    ["XX","XX","XX","XX","XX"],
    ["M1","XX","M1","XX","M1"],
  ],
  category: "special",
  state: "liquid",
  density: 997,

  tempHigh: 100,
  stateHigh: "hyper_steam",
}

elements.hyper_steam = {
  color: "#de9cff",
  behavior: [
    ["M2","XX","M1","XX","M2"],
    ["XX","XX","XX","XX","XX"],
    ["M1","XX","XX","XX","M1"],
    ["XX","XX","XX","XX","XX"],
    ["M2","XX","M1","XX","M2"],
  ],

  temp: 150,
  tempLow: 95,
  stateLow: "hyper_fluid",
  category: "gases",
  state: "gas",
  density: 0.6,
}

elements.molten_hyper_powder = {
  color: "#ef8340",
  behavior: elements.hyper_fluid.behavior,
  tick: (pixel) => {
    emitFire(pixel, 0, -2, "hyper_fire");
  },
  category: "states",
  hidden: "true",
  state: "liquid",
  density: 1520,

  tempLow: 1700,
  stateLow: "hyper_powder",
}

elements.hyper_fire = {
  color: "#f0a171",
  behavior: [
    ["M1","XX","M1","XX","M1"],
    ["XX","XX","XX","XX","XX"],
    ["M2","XX","XX","XX","M2"],
    ["XX","XX","XX","XX","XX"],
    ["XX","XX","M2","XX","XX"],
  ],
  tick: (pixel) => {
    if (Math.random() < 0.1 ) { 
      changePixel(pixel,"hyper_smoke")
    }
  },

  category: "energy",
  hidden: true,

  glow: true,
  temp: 600,
  state: "gas",
  density: 0.1,
  ignoreAir: true,
  noMix: true,
}

elements.hyper_smoke = {
  color: "#380638",
  behavior: [
    ["M2","XX","M1","XX","M2"],
    ["XX","XX","XX","XX","XX"],
    ["M1","XX","DL%5","XX","M1"],
    ["XX","XX","XX","XX","XX"],
    ["M2","XX","M1","XX","M2"],
  ],

  hidden: true,

  temp: 114,
  tempHigh: 1000,
  stateHigh: "hyper_fire",
  category: "gases",
  state: "gas",
  density: 1180,
  stain: 0.075,
  noMix: true
}

elements.knight_powder = {
  color: "#bf439e",
  behavior: [
    ["XX","XX","XX","XX","XX"],
    ["XX","XX","XX","XX","XX"],
    ["XX","XX","XX","XX","XX"],
    ["M2","XX","XX","XX","M2"],
    ["XX","M1","XX","M1","XX"],
  ],
  category: "special",
  state: "solid",
  density: 1602,

  tempHigh: 1700,
  stateHigh: "molten_knight_powder"
}

elements.knight_fluid = {
  color: "#5e43bf",
  behavior: [
    ["XX","XX","XX","XX","XX"],
    ["M2","XX","XX","XX","M2"],
    ["XX","XX","XX","XX","XX"],
    ["M2","XX","XX","XX","M2"],
    ["XX","M1","XX","M1","XX"],
  ],
  category: "special",
  state: "liquid",
  density: 997,

  tempHigh: 100,
  stateHigh: "knight_steam",
}

elements.knight_steam = {
  color: "#a893f5",
  behavior: [
    ["XX","M1","XX","M1","XX"],
    ["M1","XX","XX","XX","M1"],
    ["XX","XX","XX","XX","XX"],
    ["M1","XX","XX","XX","M1"],
    ["XX","M1","XX","M1","XX"],
  ],

  temp: 150,
  tempLow: 95,
  stateLow: "knight_fluid",
  category: "gases",
  state: "gas",
  density: 0.6,
}

elements.molten_knight_powder = {
  color: "#bf7943",
  behavior: elements.knight_fluid.behavior,
  tick: (pixel) => {
    emitFire(pixel, 0, -2, "knight_fire");
  },
  category: "states",
  hidden: "true",
  state: "liquid",
  density: 1520,

  tempLow: 1700,
  stateLow: "knight_powder",
}

elements.knight_fire = {
  color: "#f08e43",
  behavior: [
    ["XX","M1","XX","M1","XX"],
    ["M1","XX","XX","XX","M1"],
    ["XX","XX","XX","XX","XX"],
    ["M2","XX","XX","XX","M2"],
    ["XX","M2","XX","M2","XX"],
  ],
  tick: (pixel) => {
    if (Math.random() < 0.1 ) { 
      changePixel(pixel,"knight_smoke")
    }
  },

  category: "energy",
  hidden: true,

  glow: true,
  temp: 600,
  state: "gas",
  density: 0.1,
  ignoreAir: true,
  noMix: true,
}

elements.knight_smoke = {
  color: "#2e0f26",
  behavior: [
    ["XX","M1","XX","M1","XX"],
    ["M1","XX","XX","XX","M1"],
    ["XX","XX","DL%5","XX","XX"],
    ["M1","XX","XX","XX","M1"],
    ["XX","M1","XX","M1","XX"],
  ],

  hidden: true,

  temp: 114,
  tempHigh: 1000,
  stateHigh: "knight_fire",
  category: "gases",
  state: "gas",
  density: 1180,
  stain: 0.075,
  noMix: true
}


/**
 * @param {Array<Pixel>} pixels
 */
const rainbowSort = function(pixels){
  const mainPixel = pixels[1]; // The pixel all the others are compared against
  const swapScores = pixels.map((pixel) => {
    if (mainPixel.stuck){ // Choose a random order if the pixel is stuck in a loop
      mainPixel.stuck = false;
      return Math.random();
    }
    if (pixel === mainPixel){
      return 0;
    }

    // TODO: Make another version that doesn't wrap around here
    let score = wrapDifference(hslArrayFromPixel(pixel)[0], hslArrayFromPixel(mainPixel)[0], 360);
    return score;
  });

  const swapIndices = checkSwapIndices(swapScores);

  if (swapIndices.length === 2){
    const pixel1 = pixels[swapIndices[0]];
    const pixel2 = pixels[swapIndices[1]];

    // Check if the pixel is stuck in a loop of swapping between the same two spots repeatedly
    if (pixel1.lastSwappedPixel != pixel2 && pixel2.lastSwappedPixel != pixel1){
      swapPixels(pixel1, pixel2);
      pixel1.lastSwappedPixel = pixel2;
      pixel2.lastSwappedPixel = pixel1;
    } else {
      mainPixel.stuck = true;
    };
    
  }

}

/**
 * Takes an array of three numbers and returns an array of either 2 or 0 numbers,
 * representing indices that must be swapped to put the array in either increasing or decreasing order
 */
const checkSwapIndices = function([a, b, c]){
  if (a > b && b < c){
    if (a > c){
      return [1,2]
    } else {
      return [0,1]
    }
  }
  if (a < b && b > c){
    if (a > c){
      return [0,1]
    } else {
      return [1,2]
    }
  }

  return [];
}

elements.liquid_rainbow = {
  color: [
    "#ff0000",
    "#ff8000",
    "#ffff00",
    "#80ff00",
    "#00ff00",
    "#00ff80",
    "#00ffff",
    "#0080ff",
    "#0000ff",
    "#8000ff",
    "#ff00ff",
    "#ff0080",
    "#ff0000",
  ],

  onPlace: function(pixel){
    pixel.color = hslToRgbString([Math.random() * 360, 100, 50]);
  },

  tick: function(pixel){
    let horizontalPixels = [];
    let verticalPixels = [];

    for (let x = -1; x <= 1; x++){
      const checkedPixel = getPixelOrNull(pixel.x + x, pixel.y);
      if (checkedPixel?.element === pixel.element){
        horizontalPixels.push(checkedPixel);
      } else {
        horizontalPixels = null;
        break;
      }
    }

    for (let y = -1; y <= 1; y++){
      const checkedPixel = getPixelOrNull(pixel.x, pixel.y + y);
      if (checkedPixel?.element === pixel.element){
        verticalPixels.push(checkedPixel);
      } else {
        verticalPixels = null;
        break;
      }
    }

    tryRandomOrder(
      () => {
        if (horizontalPixels){
          rainbowSort(horizontalPixels);
        }
      },
      () => {
        if (verticalPixels){
          rainbowSort(verticalPixels);
        }
      }
    )
  },

  reactions: {
    glue: {elem1: "congealing_liquid_rainbow", elem2: null},
  },

  state: "liquid",
  behavior: behaviors.LIQUID,
  category: "liquids",
  density: 497,
  stain: 0.08,
}

// Add some reactions to make liquid rainbow
// The temperature has to be high because the liquid light makes it way colder
elements.liquid_light.reactions["water"] = {elem1: "liquid_rainbow", elem2: "liquid_rainbow", temp1: 150, temp2: 150};
elements.liquid_light.reactions["salt_water"] = {elem1: "liquid_rainbow", elem2: ["liquid_rainbow", "salt"], temp1: 150, temp2: 150};
elements.liquid_light.reactions["sugar_water"] = {elem1: "liquid_rainbow", elem2: ["liquid_rainbow", "sugar"], temp1: 150, temp2: 150};
elements.liquid_light.reactions["pool_water"] = {elem1: "liquid_rainbow", elem2: ["liquid_rainbow", "liquid_rainbow", "liquid_rainbow", "chlorine"], temp1: 150, temp2: 150};
elements.liquid_light.reactions["seltzer"] = {elem1: "liquid_rainbow", elem2: ["liquid_rainbow", "foam"], temp1: 150, temp2: 150};

elements.liquid_light.reactions["milk"] = {elem1: "liquid_rainbow", elem2: "liquid_rainbow", temp1: 150, temp2: 150,
  func: (pixel1, pixel2) => {
    pixel1.color = hslToRgbString([Math.random() * 360, 100, 80]);
    pixel2.color = hslToRgbString([Math.random() * 360, 100, 80]);
  }
};
elements.liquid_light.reactions["soap"] = {elem1: "liquid_rainbow", elem2: ["liquid_rainbow", "soap", "bubble"], temp1: 150, temp2: 150,
  func: (pixel1, pixel2) => {
    pixel1.color = hslToRgbString([Math.random() * 360, 40, 90]);
    pixel2.color = hslToRgbString([Math.random() * 360, 40, 90]);
  }
};
elements.liquid_light.reactions["cream"] = {elem1: "liquid_rainbow", elem2: "liquid_rainbow", temp1: 150, temp2: 150,
  func: (pixel1, pixel2) => {
    pixel1.color = hslToRgbString([Math.random() * 360, 75, 80]);
    pixel2.color = hslToRgbString([Math.random() * 360, 75, 80]);
  }
};
elements.liquid_light.reactions["ink"] = {elem1: "liquid_rainbow", elem2: "liquid_rainbow", temp1: 150, temp2: 150,
  func: (pixel1, pixel2) => {
    pixel1.color = hslToRgbString([Math.random() * 360, 100, 20]);
    pixel2.color = hslToRgbString([Math.random() * 360, 100, 20]);
  }
};
elements.liquid_light.reactions["blood"] = {elem1: "liquid_rainbow", elem2: "liquid_rainbow", temp1: 150, temp2: 150,
  func: (pixel1, pixel2) => {
    pixel1.color = hslToRgbString([biasedWrapAroundRandom({range: 360, target: 0, rerolls: 4}), 100, 50]);
    pixel2.color = hslToRgbString([biasedWrapAroundRandom({range: 360, target: 0, rerolls: 4}), 100, 50]);
  }
};
elements.liquid_light.reactions["dirty_water"] = {elem1: "liquid_rainbow", elem2: "liquid_rainbow", temp1: 150, temp2: 150,
  func: (pixel1, pixel2) => {
    pixel1.color = hslToRgbString([Math.random() * 360, random(81, 100), random(28, 50)]);
    pixel2.color = hslToRgbString([Math.random() * 360, random(81, 100), random(28, 50)]);
  }
};


elements.congealing_liquid_rainbow = {
  tick: function(pixel){
    pixel.life ??= 50;
    pixel.glueCount ??= 0;
    if (pixel.glueCount > 0){
      for (coords of squareCoords){
        const otherPixel = getPixelOrNull(pixel.x + coords[0], pixel.y + coords[1]);
        if (otherPixel?.element == "liquid_rainbow"){
          otherPixel.element = pixel.element;
          pixel.glueCount--;
        } else if (otherPixel?.element == "congealed_liquid_rainbow"){
          if (otherPixel.glueCount < pixel.glueCount){
            otherPixel.glueCount++;
            pixel.glueCount--;
          }
        }
      }
    }

    pixel.life--;
    if (pixel.life <= 0){
      pixel.element = "dye";
    }
  },

  reactions: {
    glue: {elem2: null, func: (pixel1) => {pixel1.glueCount++}}
  },

  color: [
    "#ff9999",
    "#ff8999",
    "#ffff99",
    "#89ff99",
    "#99ff99",
    "#99ff89",
    "#99ffff",
    "#9989ff",
    "#9999ff",
    "#8999ff",
    "#ff99ff",
    "#ff9989",
    "#ff9999",
  ],
  state: "liquid",
  behavior: behaviors.LIQUID,
  category: "states",
  hidden: true,
  density: 497,
  stain: 0.08,
}

// Weird Voids

elements.powdered_void = {
  color: ["#262626", "#363636", "#464646", ],
  behavior: [
    ["XX","DL","XX"],
    ["DL","XX","DL"],
    ["M2","M1","M2"]
  ],
  ignore: ["void", "powdered_void"],

  hardness: 1,
  category: "special",
}

elements.void.breakInto = "powdered_void"


// ##### Negative Space Stuff #####

// Elements that negative space stuff can't move through
const negspaceBlockers = [
  "negspace_powder",
  "negspace_fluid",
  "negspace_steam",
]

/**
 * @returns true if a negspace element can move into the given space
 */
const canNegspaceMoveInto = function(x, y){
  if (isEmpty(x, y) || outOfBounds(x, y)){
    return false;
  }

  const element = pixelMap[x][y].element;
  if (negspaceBlockers.includes(element)){
    return false;
  }

  return true;
}

/**
 * Calculates x and y coordinates using 
 * the pixels coordinates with xOffset and yOffset
 * If canNegspaceMoveInto(x, y) === true,
 * moves the pixel to (x, y) by swapping with
 * the pixel there. 
 * @returns a boolean which is true if the move was successful
 */
const tryNegspaceMove = function(pixel, xOffset, yOffset){
  const x = pixel.x + xOffset;
  const y = pixel.y + yOffset;
  if (canNegspaceMoveInto(x, y)){
    const targetPixel = pixelMap[x][y];
    swapPixels(pixel, targetPixel);
    return true;
  } else {
    return false;
  }
}

elements.negspace_powder = {
  color: "#7586e6",
  tick: (pixel) => {
    if (!tryNegspaceMove(pixel, 0, 1)){
      tryRandomOrder(
        () => {return tryNegspaceMove(pixel, -1, 1)},
        () => {return tryNegspaceMove(pixel, 1, 1)},
      )
    }

    doHeat(pixel);
  },

  density: 1603,
  category: "special",
}

elements.negspace_fluid = {
  color: "#ffb921",
  tick: (pixel) => {
    if (!tryRandomOrder(
      () => {return tryNegspaceMove(pixel, -1, 1)},
      () => {return tryNegspaceMove(pixel, 0, 1)},
      () => {return tryNegspaceMove(pixel, 1, 1)},
    )){
      tryRandomOrder(
        () => {return tryNegspaceMove(pixel, -1, 0)},
        () => {return tryNegspaceMove(pixel, 1, 0)},
      )
    }

    doHeat(pixel);
  },

  tempHigh: 100,
  stateHigh: "negspace_steam",
  density: 997,
  category: "special",
}

elements.negspace_steam = {
  color: "#ffde96",
  glow: true, // Enable the gas rendering effect
  tick: (pixel) => {
    if (!tryRandomOrder(
      () => {return tryNegspaceMove(pixel, -1, 0)},
      () => {return tryNegspaceMove(pixel, 1, 0)},
      () => {return tryNegspaceMove(pixel, 0, -1)},
      // () => {return tryNegspaceMove(pixel, 0, 1)},
    )){
      tryRandomOrder(
        () => {return tryNegspaceMove(pixel, -1, -1)},
        () => {return tryNegspaceMove(pixel, -1, 1)},
        () => {return tryNegspaceMove(pixel, 1, -1)},
        () => {return tryNegspaceMove(pixel, 1, 1)},
      )
    }

    // Air Density (The reason steam floats up)
    const pixelDensity = pixel.element.density;
    if (Math.random() < (airDensity - pixelDensity)/(airDensity + pixelDensity)) {
      tryNegspaceMove(pixel, 0, -1);
    }

    doHeat(pixel); // Make heat propagation work consistently (without this, it looks like it works in some cases but not always)
  },

  temp: 150,
  tempLow: 95,
  stateLow: "negspace_fluid",
  category: "special",
  density: 0.6,
}
