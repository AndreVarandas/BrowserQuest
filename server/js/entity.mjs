import Messages from './message.mjs';
import Utils from './utils.mjs';

class Entity {
    constructor(id, type, kind, x, y) {
        this.id = parseInt(id);
        this.type = type;
        this.kind = kind;
        this.x = x;
        this.y = y;
    }

    destroy() {
        // Implementation of destroy method
    }

    _getBaseState() {
        return [
            this.id,
            this.kind,
            this.x,
            this.y
        ];
    }

    getState() {
        return this._getBaseState();
    }

    spawn() {
        return new Messages.Spawn(this);
    }

    despawn() {
        return new Messages.Despawn(this.id);
    }

    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    getPositionNextTo(entity) {
        let pos = null;
        if (entity) {
            pos = {};
            let r = Utils.random(4);

            pos.x = entity.x;
            pos.y = entity.y;
            if (r === 0) pos.y -= 1;
            if (r === 1) pos.y += 1;
            if (r === 2) pos.x -= 1;
            if (r === 3) pos.x += 1;
        }
        return pos;
    }
}

export default Entity;
