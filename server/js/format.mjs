import _ from 'underscore';
import {Messages} from '../../shared/js/gametypes.mjs';

class FormatChecker {
    constructor() {
        this.formats = [];
        this.formats[Messages.HELLO] = ['s', 'n', 'n'];
        this.formats[Messages.MOVE] = ['n', 'n'];
        this.formats[Messages.LOOTMOVE] = ['n', 'n', 'n'];
        this.formats[Messages.AGGRO] = ['n'];
        this.formats[Messages.ATTACK] = ['n'];
        this.formats[Messages.HIT] = ['n'];
        this.formats[Messages.HURT] = ['n'];
        this.formats[Messages.CHAT] = ['s'];
        this.formats[Messages.LOOT] = ['n'];
        this.formats[Messages.TELEPORT] = ['n', 'n'];
        this.formats[Messages.ZONE] = [];
        this.formats[Messages.OPEN] = ['n'];
        this.formats[Messages.CHECK] = ['n'];
    }

    check(msg) {
        let message = msg.slice(0),
            type = message[0],
            format = this.formats[type];

        message.shift();

        if (format) {
            if (message.length !== format.length) {
                return false;
            }
            for (let i = 0, n = message.length; i < n; i++) {
                if (format[i] === 'n' && !_.isNumber(message[i])) {
                    return false;
                }
                if (format[i] === 's' && !_.isString(message[i])) {
                    return false;
                }
            }
            return true;
        } else if (type === Messages.WHO) {
            return message.length > 0 && _.all(message, param => _.isNumber(param));
        } else {
            console.error("Unknown message type: " + type);
            return false;
        }
    }
}

const checker = new FormatChecker();
export const check = checker.check.bind(checker);
