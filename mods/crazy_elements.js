// Utility Functions

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
    const [r, g, b] = hslToRgb([Math.random() * 360, 100, 50]);
    pixel.color = `rgb(${r}, ${g}, ${b})`;
  },

  tick: function(pixel){
    const rgbArray = getRgbArrayFromString(pixel.color);
    const hslArray = rgbToHsl(rgbArray);
    const otherPixel = getPixelOrNull(pixel.x + 1, pixel.y);

    if (otherPixel && otherPixel.element === pixel.element){
      const otherPixelHslArray = rgbToHsl(getRgbArrayFromString(otherPixel.color));
      if (otherPixelHslArray[0] > hslArray[0]){
        swapPixels(pixel, otherPixel);
      }
    }
  },

  state: "liquid",
  behavior: behaviors.LIQUID,
  category: "liquids",
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
