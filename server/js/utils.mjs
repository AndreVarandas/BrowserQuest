import sanitizer from 'sanitizer';
import {Orientations} from "../../shared/js/gametypes.mjs";

const Utils = {
    sanitize: function (string) {
        return sanitizer.escape(sanitizer.sanitize(string));
    },

    random: function (range) {
        return Math.floor(Math.random() * range);
    },

    randomRange: function (min, max) {
        return min + (Math.random() * (max - min));
    },

    randomInt: function (min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    },

    clamp: function (min, max, value) {
        if (value < min) {
            return min;
        } else if (value > max) {
            return max;
        } else {
            return value;
        }
    },

    randomOrientation: function () {
        let r = this.random(4);

        switch (r) {
            case 0:
                return Orientations.LEFT;
            case 1:
                return Orientations.RIGHT;
            case 2:
                return Orientations.UP;
            case 3:
                return Orientations.DOWN;
            default:
                return Orientations.LEFT;
        }
    },

    Mixin: function (target, source) {
        if (source) {
            Object.keys(source).forEach(key => {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            });
        }
        return target;
    },

    distanceTo: function (x, y, x2, y2) {
        const distX = Math.abs(x - x2);
        const distY = Math.abs(y - y2);

        return (distX > distY) ? distX : distY;
    }
};

export default Utils;
