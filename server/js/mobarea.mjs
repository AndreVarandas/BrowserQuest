import Area from './area.mjs';
import _ from 'underscore';
import {Entities, getKindFromString} from '../../shared/js/gametypes.mjs';
import Mob from './mob.mjs';

class MobArea extends Area {
    constructor(id, nb, kind, x, y, width, height, world) {
        super(id, x, y, width, height, world);
        this.nb = nb;
        this.kind = kind;
        this.respawns = [];
        this.setNumberOfEntities(this.nb);
    }

    spawnMobs() {
        for (let i = 0; i < this.nb; i++) {
            this.addToArea(this._createMobInsideArea());
        }
    }

    _createMobInsideArea() {
        const k = getKindFromString(this.kind);
        const pos = this._getRandomPositionInsideArea();
        const mob = new Mob('1' + this.id + '' + k + '' + this.entities.length, k, pos.x, pos.y);

        mob.onMove(this.world.onMobMoveCallback.bind(this.world));

        return mob;
    }

    respawnMob(mob, delay) {
        this.removeFromArea(mob);

        setTimeout(() => {
            const pos = this._getRandomPositionInsideArea();

            mob.x = pos.x;
            mob.y = pos.y;
            mob.isDead = false;
            this.addToArea(mob);
            this.world.addMob(mob);
        }, delay);
    }

    initRoaming() {
        setInterval(() => {
            _.each(this.entities, mob => {
                const canRoam = (Utils.random(20) === 1);

                if (canRoam) {
                    if (!mob.hasTarget() && !mob.isDead) {
                        const pos = this._getRandomPositionInsideArea();
                        mob.move(pos.x, pos.y);
                    }
                }
            });
        }, 500);
    }

    createReward() {
        const pos = this._getRandomPositionInsideArea();

        return {x: pos.x, y: pos.y, kind: Entities.CHEST};
    }
}

export default MobArea;
