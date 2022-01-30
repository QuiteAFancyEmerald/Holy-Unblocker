const colours = ["red", "orange", "yellow", "dodgerblue", "limegreen", "darkorchid", "hotpink"],
shapes = ["minus", "circle", "triangle", "plus", "square", "hexagon", "dot"],
BOARD_SIZE = 8,
score = {
  set(n) {
    score.number = n;
    squareElem.dataset.score = n;
  },
  add(n) {
    this.set(n + this.number);
  }
};
class Tile {
  constructor(x, y, colour, entering = false) {
    this.colour = -1;

    this.element = document.createElement("span");
    this.element.addEventListener("click", e => {
      if (selectedTile === 'DONTSELECT');
      else if (selectedTile) {
        if (selectedTile.x === this.x && Math.abs(selectedTile.y - this.y) === 1
            || selectedTile.y === this.y && Math.abs(selectedTile.x - this.x) === 1) {
          let lastPositions = {
            me: [this.x, this.y],
            selectedTile: [selectedTile.x, selectedTile.y, selectedTile.elem]
          };
          selectedTile.moveTileTo(this.x, this.y);
          this.moveTo(selectedTile.x, selectedTile.y);
          selectedTile = null;

          if (!startMurderSpree(200)) {
            selectedTile = 'DONTSELECT';
            setTimeout(() => {
              lastPositions.selectedTile[2].moveTo(lastPositions.selectedTile[0], lastPositions.selectedTile[1]);
              this.moveTo(lastPositions.me[0], lastPositions.me[1]);
              selectedTile = null;
            }, 200);
          }
          return;
        } else {
          if (selectedTile.cancel() === this) return;
        }
      }
      if (!selectedTile) {
        this.element.classList.add("active");
        selectedTile = {
          x: this.x,
          y: this.y,
          moveTileTo: (x, y) => {
            this.moveTo(x, y);
            this.element.classList.remove("active");
          },
          cancel: () => {
            this.element.classList.remove("active");
            selectedTile = null;
            return this;
          },
          elem: this
        };
      }
    }, false);

    switch (colour) {
      case "bomb":
        this.element.classList.add("bomb");
      default:
        this.element.classList.add(shapes[colour]);
        this.element.style.backgroundColor = colours[colour];
        this.colour = colour;
    }

    if (entering) this.element.classList.add("entering");
    squareElem.appendChild(this.element);

    this.x = x;
    this.y = y;
    this.moveTo(x, y);
  }
  remove(animate = true, addNewItem = true) {
    if (animate) {
      this.element.classList.add("exiting");
      this.element.addEventListener("animationend", e => {
        squareElem.removeChild(this.element);
      }, false);
    }
    else squareElem.removeChild(this.element);
    tileElems[this.y][this.x] = null, tiles[this.y][this.x] = null;
    for (let tempY = this.y; tempY--;) tileElems[tempY][this.x].moveTo(this.x, tempY + 1);
    if (addNewItem) {
      new Tile(this.x, 0, Math.floor(Math.random() * colours.length), true);
    }
    if (selectedTile && selectedTile.elem === this) selectedTile = null;
  }
  moveTo(x, y) {
    if (tileElems[this.y][this.x] === this) tileElems[this.y][this.x] = null, tiles[this.y][this.x] = null;
    this.element.style.left = ((this.x = x) * 45 + 20) + "px";
    this.element.style.top = ((this.y = y) * 45 + 20) + "px";
    tileElems[y][x] = this, tiles[y][x] = this.colour;
  }
}
function startMurderSpree(wasRightAfterTransition = false) {
  let foundMatches,
  combo = 0,
  toRemove = [];
  while ((foundMatches = checkForMatches(tiles)).length) {
    for (let i = foundMatches.length; i--;) for (let j = foundMatches[i].length; j--;) {
      let tile = tileElems[foundMatches[i][j][1]][foundMatches[i][j][0]];
      if (!toRemove.includes(tile)) {
        toRemove.push(tile);
        tiles[foundMatches[i][j][1]][foundMatches[i][j][0]] = NaN;
      }
    }
    combo++;
  }
  let killing = () => {
    for (let i = toRemove.length; i--;) toRemove[i].remove();
    score.add(toRemove.length * 100);
    startMurderSpree(400);
  };
  if (combo !== 0) {
    if (wasRightAfterTransition) setTimeout(killing, wasRightAfterTransition);
    else killing();
  }
  return combo !== 0;
}
function checkForMatches(tiles) {
  function getCoords(x, y, ywise = true, frontOffset = 0, sideOffset = 0) {
    return [x + (ywise ? sideOffset : frontOffset), y + (ywise ? frontOffset : sideOffset)];
  }
  function getTile(coords) {
    return tiles[coords[1]][coords[0]];
  }
  function areSameColour(tile1, tile2) { // -1 is wildcard; NaN is a unique tile
    return tile1 === -1 || tile2 === -1 || tile1 === tile2;
  }
  function actuallyCheckForMatches(x, y, ywise) {
    let coords = getCoords(x, y),
    colour = getTile(coords),
    matches = [coords],
    frontCoord = ywise ? y : x,
    sideCoord = ywise ? x : y;
    for (let i = 1; i < 6 && frontCoord - i >= 0; i++) {
      let coords = getCoords(x, y, ywise, -i);
      if (areSameColour(colour, getTile(coords))) matches.push(coords);
      else break;
    }
    if (matches.length >= 3) {
      let actualMatches = [matches];
      for (let i = matches.length; i--;) {
        let sideMatches = [getCoords(x, y, ywise, -i)],
        leftIsDone = false,
        rightIsDone = false;
        for (let j = 1; j < 6; j++) {
          let leftCoords = getCoords(x, y, ywise, -i, -j),
          rightCoords = getCoords(x, y, ywise, -i, j);
          if (!leftIsDone && sideCoord - j >= 0 && areSameColour(colour, getTile(leftCoords))) sideMatches.push(leftCoords);
          else leftIsDone = true;
          if (!rightIsDone && sideCoord + j < 8 && areSameColour(colour, getTile(rightCoords))) sideMatches.push(rightCoords);
          else rightIsDone = true;
          if (leftIsDone && rightIsDone) break;
        }
        if (sideMatches.length >= 3) actualMatches.push(sideMatches);
      }
      return actualMatches;
    }
    return false;
  }
  for (let y = BOARD_SIZE; y--;) for (let x = BOARD_SIZE; x--;) {
    if (y > 1) {
      let matches = actuallyCheckForMatches(x, y, true);
      if (matches) return matches;
    }
    if (x > 1) {
      let matches = actuallyCheckForMatches(x, y, false);
      if (matches) return matches;
    }
  }
  return [];
}
let squareElem = document.createElement("div"),
tiles = [],
tileElems = [];
squareElem.classList.add("grid");
for (let y = 8; y--;) {
  let row = [];
  for (let x = 8; x--;) row.push(Math.floor(Math.random() * colours.length));
  tiles.push(row);
}
let foundMatches;
while ((foundMatches = checkForMatches(tiles)).length) {
  for (let i = 3; i--;) tiles[foundMatches[0][i][1]][foundMatches[0][i][0]] = Math.floor(Math.random() * colours.length);
}
let selectedTile = null;
for (let y = 8; y--;) {
  let elemRow = [];
  tileElems[y] = elemRow;
  for (let x = 8; x--;) new Tile(x, y, tiles[y][x]);
}
document.body.appendChild(squareElem);
score.set(0);