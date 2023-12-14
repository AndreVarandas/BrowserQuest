import Utils from "./utils.mjs";

const Formulas = {
    dmg: function(weaponLevel, armorLevel) {
        const dealt = weaponLevel * Utils.randomInt(5, 10);
        const absorbed = armorLevel * Utils.randomInt(1, 3);
        const dmg = dealt - absorbed;

        //console.log(`abs: ${absorbed}   dealt: ${dealt}   dmg: ${dmg}`);
        if (dmg <= 0) {
            return Utils.randomInt(0, 3);
        } else {
            return dmg;
        }
    },

    hp: function(armorLevel) {
        return 80 + ((armorLevel - 1) * 30);
    }
};

export default Formulas;
