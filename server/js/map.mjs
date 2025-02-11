import fs from 'fs';
import _ from 'underscore';
import Utils from './utils.mjs';
import Checkpoint from './checkpoint.mjs';

class Map {
  constructor(filepath) {
    this.isLoaded = false;

    fs.exists(filepath, exists => {
      if (!exists) {
        console.error(`${filepath} doesn't exist.`);
        return;
      }

      fs.readFile(filepath, (err, file) => {
        const json = JSON.parse(file.toString());
        this.initMap(json);
      });
    });
  }

  initMap(map) {
    this.width = map.width;
    this.height = map.height;
    this.collisions = map.collisions;
    this.mobAreas = map.roamingAreas;
    this.chestAreas = map.chestAreas;
    this.staticChests = map.staticChests;
    this.staticEntities = map.staticEntities;
    this.isLoaded = true;

    this.zoneWidth = 28;
    this.zoneHeight = 12;
    this.groupWidth = Math.floor(this.width / this.zoneWidth);
    this.groupHeight = Math.floor(this.height / this.zoneHeight);

    this.initConnectedGroups(map.doors);
    this.initCheckpoints(map.checkpoints);

    if (this.ready_func) {
      this.ready_func();
    }
  }

  ready(f) {
    this.ready_func = f;
  }

  tileIndexToGridPosition(tileNum) {
    let x = 0, y = 0;

    const getX = (num, w) => num == 0 ? 0 : num % w == 0 ? w - 1 : (num % w) - 1;

    tileNum -= 1;
    x = getX(tileNum + 1, this.width);
    y = Math.floor(tileNum / this.width);

    return { x, y };
  }

  GridPositionToTileIndex(x, y) {
    return y * this.width + x + 1;
  }

  generateCollisionGrid () {
    this.grid = [];

    if (this.isLoaded) {
      let tileIndex = 0;
      for (let j, i = 0; i < this.height; i++) {
        this.grid[i] = [];
        for (j = 0; j < this.width; j++) {
          if (_.include(this.collisions, tileIndex)) {
            this.grid[i][j] = 1;
          } else {
            this.grid[i][j] = 0;
          }
          tileIndex += 1;
        }
      }
    }
  }

  isOutOfBounds(x, y) {
    return x <= 0 || x >= this.width || y <= 0 || y >= this.height;
  }

  isColliding(x, y) {
    if (this.isOutOfBounds(x, y)) {
      return false;
    }

    return this.grid[y][x] === 1;
  }

  GroupIdToGroupPosition(id) {
    const posArray = id.split("-");

    return pos(parseInt(posArray[0]), parseInt(posArray[1]));
  }

  forEachGroup(callback) {
    const width = this.groupWidth,
      height = this.groupHeight;

    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        callback(x + "-" + y);
      }
    }
  }

  getGroupIdFromPosition(x, y) {
    const w = this.zoneWidth,
      h = this.zoneHeight,
      gx = Math.floor((x - 1) / w),
      gy = Math.floor((y - 1) / h);

    return gx + "-" + gy;
  }

  getAdjacentGroupPositions(id) {
    const self = this,
      position = this.GroupIdToGroupPosition(id),
      x = position.x,
      y = position.y,
      // surrounding groups
      list = [
        pos(x - 1, y - 1),
        pos(x, y - 1),
        pos(x + 1, y - 1),
        pos(x - 1, y),
        pos(x, y),
        pos(x + 1, y),
        pos(x - 1, y + 1),
        pos(x, y + 1),
        pos(x + 1, y + 1),
      ];

    // groups connected via doors
    _.each(this.connectedGroups[id], function (position) {
      // don't add a connected group if it's already part of the surrounding ones.
      if (
        !_.any(list, function (groupPos) {
          return equalPositions(groupPos, position);
        })
      ) {
        list.push(position);
      }
    });

    return _.reject(list, function (pos) {
      return (
        pos.x < 0 ||
        pos.y < 0 ||
        pos.x >= self.groupWidth ||
        pos.y >= self.groupHeight
      );
    });
  }

  forEachAdjacentGroup(groupId, callback) {
    if (groupId) {
      _.each(this.getAdjacentGroupPositions(groupId), pos => {
        callback(pos.x + "-" + pos.y);
      });
    }
  }

  initConnectedGroups(doors) {
    this.connectedGroups = {};
    _.each(doors, door => {
      const groupId = this.getGroupIdFromPosition(door.x, door.y);
      const connectedGroupId = this.getGroupIdFromPosition(door.tx, door.ty);
      const connectedPosition = this.GroupIdToGroupPosition(connectedGroupId);

      if (groupId in this.connectedGroups) {
        this.connectedGroups[groupId].push(connectedPosition);
      } else {
        this.connectedGroups[groupId] = [connectedPosition];
      }
    });
  }

  initCheckpoints(cpList) {
    this.checkpoints = {};
    this.startingAreas = [];

    _.each(cpList, cp => {
      const checkpoint = new Checkpoint(cp.id, cp.x, cp.y, cp.w, cp.h);
      this.checkpoints[checkpoint.id] = checkpoint;
      if (cp.s === 1) {
        this.startingAreas.push(checkpoint);
      }
    });
  }

  getCheckpoint(id) {
    return this.checkpoints[id];
  }

  getRandomStartingPosition() {
    const nbAreas = _.size(this.startingAreas);
    const i = Utils.randomInt(0, nbAreas - 1);
    const area = this.startingAreas[i];

    return area.getRandomPosition();
  }
}

export default Map;

const pos = (x, y) => ({ x, y });
const equalPositions = (pos1, pos2) => pos1.x === pos2.x && pos2.y === pos2.y;
