import _ from 'underscore';
import { Messages as TypeMessages} from '../../shared/js/gametypes.mjs';

class Message {
}

class Spawn extends Message {
    constructor(entity) {
        super();
        this.entity = entity;
    }

    serialize() {
        const spawn = [TypeMessages.SPAWN];
        return spawn.concat(this.entity.getState());
    }
}

class Despawn extends Message {
    constructor(entityId) {
        super();
        this.entityId = entityId;
    }

    serialize() {
        return [TypeMessages.DESPAWN, this.entityId];
    }
}

class Move extends Message {
    constructor(entity) {
        super();
        this.entity = entity;
    }

    serialize() {
        return [TypeMessages.MOVE, this.entity.id, this.entity.x, this.entity.y];
    }
}

class LootMove extends Message {
    constructor(entity, item) {
        super();
        this.entity = entity;
        this.item = item;
    }

    serialize() {
        return [TypeMessages.LOOTMOVE, this.entity.id, this.item.id];
    }
}

class Attack extends Message {
    constructor(attackerId, targetId) {
        super();
        this.attackerId = attackerId;
        this.targetId = targetId;
    }

    serialize() {
        return [TypeMessages.ATTACK, this.attackerId, this.targetId];
    }
}

class Health extends Message {
    constructor(points, isRegen) {
        super();
        this.points = points;
        this.isRegen = isRegen;
    }

    serialize() {
        const health = [TypeMessages.HEALTH, this.points];
        if (this.isRegen) {
            health.push(1);
        }
        return health;
    }
}

class HitPoints extends Message {
    constructor(maxHitPoints) {
        super();
        this.maxHitPoints = maxHitPoints;
    }

    serialize() {
        return [TypeMessages.HP, this.maxHitPoints];
    }
}

class EquipItem extends Message {
    constructor(player, itemKind) {
        super();
        this.playerId = player.id;
        this.itemKind = itemKind;
    }

    serialize() {
        return [TypeMessages.EQUIP, this.playerId, this.itemKind];
    }
}

class Drop extends Message {
    constructor(mob, item) {
        super();
        this.mob = mob;
        this.item = item;
    }

    serialize() {
        const drop = [TypeMessages.DROP, this.mob.id, this.item.id, this.item.kind, _.pluck(this.mob.hatelist, 'id')];
        return drop;
    }
}

class Chat extends Message {
    constructor(player, message) {
        super();
        this.playerId = player.id;
        this.message = message;
    }

    serialize() {
        return [TypeMessages.CHAT, this.playerId, this.message];
    }
}

class Teleport extends Message {
    constructor(entity) {
        super();
        this.entity = entity;
    }

    serialize() {
        return [TypeMessages.TELEPORT, this.entity.id, this.entity.x, this.entity.y];
    }
}

class Damage extends Message {
    constructor(entity, points) {
        super();
        this.entity = entity;
        this.points = points;
    }

    serialize() {
        return [TypeMessages.DAMAGE, this.entity.id, this.points];
    }
}

class Population extends Message {
    constructor(world, total) {
        super();
        this.world = world;
        this.total = total;
    }

    serialize() {
        return [TypeMessages.POPULATION, this.world, this.total];
    }
}

class Kill extends Message {
    constructor(mob) {
        super();
        this.mob = mob;
    }

    serialize() {
        return [TypeMessages.KILL, this.mob.kind];
    }
}

class List extends Message {
    constructor(ids) {
        super();
        this.ids = ids;
    }

    serialize() {
        const list = this.ids;
        list.unshift(TypeMessages.LIST);
        return list;
    }
}

class Destroy extends Message {
    constructor(entity) {
        super();
        this.entity = entity;
    }

    serialize() {
        return [TypeMessages.DESTROY, this.entity.id];
    }
}

class Blink extends Message {
    constructor(item) {
        super();
        this.item = item;
    }

    serialize() {
        return [TypeMessages.BLINK, this.item.id];
    }
}

const Messages = {
    Spawn,
    Despawn,
    Move,
    LootMove,
    Attack,
    Health,
    HitPoints,
    EquipItem,
    Drop,
    Chat,
    Teleport,
    Damage,
    Population,
    Kill,
    List,
    Destroy,
    Blink
};

export default Messages;
