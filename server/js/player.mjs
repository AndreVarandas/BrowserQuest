import _ from "underscore";
import Messages from "./message.mjs";
import Utils from "./utils.mjs";
import Properties from "./properties.mjs";
import Formulas from "./formulas.mjs";
import Character from "./character.mjs";
import { check } from "./format.mjs";
import {
  Entities,
  getKindAsString,
  getMessageTypeAsString,
  isArmor,
  isHealingItem,
  isItem,
  isWeapon,
} from "../../shared/js/gametypes.mjs";

class Player extends Character {
  constructor(connection, worldServer) {
    super(connection.id, "player", Entities.WARRIOR, 0, 0);

    this.server = worldServer;
    this.connection = connection;
    this.hasEnteredGame = false;
    this.isDead = false;
    this.haters = {};
    this.lastCheckpoint = null;
    this.disconnectTimeout = null;

    this.connection.listen(message => {
      const action = parseInt(message[0]);

      log.debug("Received: " + message);
      if (!check(message)) {
        self.connection.close(
          "Invalid " +
            getMessageTypeAsString(action) +
            " message format: " +
            message
        );
        return;
      }

      if (!self.hasEnteredGame && action !== Messages.HELLO) {
        // HELLO must be the first message
        self.connection.close("Invalid handshake message: " + message);
        return;
      }
      if (self.hasEnteredGame && !self.isDead && action === Messages.HELLO) {
        // HELLO can be sent only once
        self.connection.close("Cannot initiate handshake twice: " + message);
        return;
      }

      self.resetTimeout();

      if (action === Messages.HELLO) {
        var name = Utils.sanitize(message[1]);

        // If name was cleared by the sanitizer, give a default name.
        // Always ensure that the name is not longer than a maximum length.
        // (also enforced by the maxlength attribute of the name input element).
        self.name = name === "" ? "lorem ipsum" : name.substr(0, 15);

        self.kind = Entities.WARRIOR;
        self.equipArmor(message[2]);
        self.equipWeapon(message[3]);
        self.orientation = Utils.randomOrientation();
        self.updateHitPoints();
        self.updatePosition();

        self.server.addPlayer(self);
        self.server.enter_callback(self);

        self.send([
          Messages.WELCOME,
          self.id,
          self.name,
          self.x,
          self.y,
          self.hitPoints,
        ]);
        self.hasEnteredGame = true;
        self.isDead = false;
      } else if (action === Messages.WHO) {
        message.shift();
        self.server.pushSpawnsToPlayer(self, message);
      } else if (action === Messages.ZONE) {
        self.zone_callback();
      } else if (action === Messages.CHAT) {
        var msg = Utils.sanitize(message[1]);

        // Sanitized messages may become empty. No need to broadcast empty chat messages.
        if (msg && msg !== "") {
          msg = msg.substr(0, 60); // Enforce maxlength of chat input
          self.broadcastToZone(new Messages.Chat(self, msg), false);
        }
      } else if (action === Messages.MOVE) {
        if (self.move_callback) {
          var x = message[1],
            y = message[2];

          if (self.server.isValidPosition(x, y)) {
            self.setPosition(x, y);
            self.clearTarget();

            self.broadcast(new Messages.Move(self));
            self.move_callback(self.x, self.y);
          }
        }
      } else if (action === Messages.LOOTMOVE) {
        if (self.lootmove_callback) {
          self.setPosition(message[1], message[2]);

          var item = self.server.getEntityById(message[3]);
          if (item) {
            self.clearTarget();

            self.broadcast(new Messages.LootMove(self, item));
            self.lootmove_callback(self.x, self.y);
          }
        }
      } else if (action === Messages.AGGRO) {
        if (self.move_callback) {
          self.server.handleMobHate(message[1], self.id, 5);
        }
      } else if (action === Messages.ATTACK) {
        var mob = self.server.getEntityById(message[1]);

        if (mob) {
          self.setTarget(mob);
          self.server.broadcastAttacker(self);
        }
      } else if (action === Messages.HIT) {
        var mob = self.server.getEntityById(message[1]);
        if (mob) {
          var dmg = Formulas.dmg(self.weaponLevel, mob.armorLevel);

          if (dmg > 0) {
            mob.receiveDamage(dmg, self.id);
            self.server.handleMobHate(mob.id, self.id, dmg);
            self.server.handleHurtEntity(mob, self, dmg);
          }
        }
      } else if (action === Messages.HURT) {
        var mob = self.server.getEntityById(message[1]);
        if (mob && self.hitPoints > 0) {
          self.hitPoints -= Formulas.dmg(mob.weaponLevel, self.armorLevel);
          self.server.handleHurtEntity(self);

          if (self.hitPoints <= 0) {
            self.isDead = true;
            if (self.firepotionTimeout) {
              clearTimeout(self.firepotionTimeout);
            }
          }
        }
      } else if (action === Messages.LOOT) {
        var item = self.server.getEntityById(message[1]);

        if (item) {
          var kind = item.kind;

          if (isItem(kind)) {
            self.broadcast(item.despawn());
            self.server.removeEntity(item);

            if (kind === Entities.FIREPOTION) {
              self.updateHitPoints();
              self.broadcast(self.equip(Entities.FIREFOX));
              self.firepotionTimeout = setTimeout(function () {
                self.broadcast(self.equip(self.armor)); // return to normal after 15 sec
                self.firepotionTimeout = null;
              }, 15000);
              self.send(new Messages.HitPoints(self.maxHitPoints).serialize());
            } else if (isHealingItem(kind)) {
              var amount;

              switch (kind) {
                case Entities.FLASK:
                  amount = 40;
                  break;
                case Entities.BURGER:
                  amount = 100;
                  break;
              }

              if (!self.hasFullHealth()) {
                self.regenHealthBy(amount);
                self.server.pushToPlayer(self, self.health());
              }
            } else if (isArmor(kind) || isWeapon(kind)) {
              self.equipItem(item);
              self.broadcast(self.equip(kind));
            }
          }
        }
      } else if (action === Messages.TELEPORT) {
        var x = message[1],
          y = message[2];

        if (self.server.isValidPosition(x, y)) {
          self.setPosition(x, y);
          self.clearTarget();

          self.broadcast(new Messages.Teleport(self));

          self.server.handlePlayerVanish(self);
          self.server.pushRelevantEntityListTo(self);
        }
      } else if (action === Messages.OPEN) {
        var chest = self.server.getEntityById(message[1]);
        if (chest && chest instanceof Chest) {
          self.server.handleOpenedChest(chest, self);
        }
      } else if (action === Messages.CHECK) {
        var checkpoint = self.server.map.getCheckpoint(message[1]);
        if (checkpoint) {
          self.lastCheckpoint = checkpoint;
        }
      } else {
        if (self.message_callback) {
          self.message_callback(message);
        }
      }
    });

    this.connection.onClose(() => {
      if (self.firepotionTimeout) {
        clearTimeout(self.firepotionTimeout);
      }
      clearTimeout(self.disconnectTimeout);
      if (self.exit_callback) {
        self.exit_callback();
      }
    });

    this.connection.sendUTF8("go"); // Notify client that the HELLO/WELCOME handshake can start
  }

  destroy() {
    let self = this;

    this.forEachAttacker(function (mob) {
      mob.clearTarget();
    });
    this.attackers = {};

    this.forEachHater(function (mob) {
      mob.forgetPlayer(self.id);
    });
    this.haters = {};
  }

  getState() {
    const basestate = this._getBaseState(),
      state = [this.name, this.orientation, this.armor, this.weapon];

    if (this.target) {
      state.push(this.target);
    }

    return basestate.concat(state);
  }

  send(message) {
    this.connection.send(message);
  }

  broadcast(message, ignoreSelf) {
    if (this.broadcast_callback) {
      this.broadcast_callback(
        message,
        ignoreSelf === undefined ? true : ignoreSelf
      );
    }
  }

  broadcastToZone(message, ignoreSelf) {
    if (this.broadcastzone_callback) {
      this.broadcastzone_callback(
        message,
        ignoreSelf === undefined ? true : ignoreSelf
      );
    }
  }

  onExit(callback) {
    this.exit_callback = callback;
  }

  onMove(callback) {
    this.move_callback = callback;
  }

  onLootMove(callback) {
    this.lootmove_callback = callback;
  }

  onZone(callback) {
    this.zone_callback = callback;
  }

  onOrient(callback) {
    this.orient_callback = callback;
  }

  onMessage(callback) {
    this.message_callback = callback;
  }

  onBroadcast(callback) {
    this.broadcast_callback = callback;
  }

  onBroadcastToZone(callback) {
    this.broadcastzone_callback = callback;
  }

  equip(item) {
    return new Messages.EquipItem(this, item);
  }

  addHater(mob) {
    if (mob) {
      if (!(mob.id in this.haters)) {
        this.haters[mob.id] = mob;
      }
    }
  }

  removeHater(mob) {
    if (mob && mob.id in this.haters) {
      delete this.haters[mob.id];
    }
  }

  forEachHater(callback) {
    _.each(this.haters, function (mob) {
      callback(mob);
    });
  }

  equipArmor(kind) {
    this.armor = kind;
    this.armorLevel = Properties.getArmorLevel(kind);
  }

  equipWeapon(kind) {
    this.weapon = kind;
    this.weaponLevel = Properties.getWeaponLevel(kind);
  }

  equipItem(item) {
    if (item) {
      log.debug(this.name + " equips " + getKindAsString(item.kind));

      if (isArmor(item.kind)) {
        this.equipArmor(item.kind);
        this.updateHitPoints();
        this.send(new Messages.HitPoints(this.maxHitPoints).serialize());
      } else if (isWeapon(item.kind)) {
        this.equipWeapon(item.kind);
      }
    }
  }

  updateHitPoints() {
    this.resetHitPoints(Formulas.hp(this.armorLevel));
  }

  updatePosition() {
    if (this.requestpos_callback) {
      const pos = this.requestpos_callback();
      this.setPosition(pos.x, pos.y);
    }
  }

  onRequestPosition(callback) {
    this.requestpos_callback = callback;
  }

  resetTimeout() {
    clearTimeout(this.disconnectTimeout);
    this.disconnectTimeout = setTimeout(
      this.timeout.bind(this),
      1000 * 60 * 15
    ); // 15 min.
  }

  timeout() {
    this.connection.sendUTF8("timeout");
    this.connection.close("Player was idle for too long");
  }
}

export default Player;
