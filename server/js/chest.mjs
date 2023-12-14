import Utils from './utils.mjs';
import {Entities} from '../../shared/js/gametypes.mjs';

import Item from './item.mjs';
import {size} from "underscore"; // Assuming Item is already an ES6 class

class Chest extends Item {
    constructor(id, x, y) {
        super(id, Entities.CHEST, x, y);
    }

    setItems(items) {
        this.items = items;
    }

    getRandomItem() {
        let nbItems = size(this.items),
            item = null;

        if (nbItems > 0) {
            item = this.items[Utils.random(nbItems)];
        }
        return item;
    }
}

export default Chest;
