import { Entities } from "../../shared/js/gametypes.mjs";

define(['mobs', 'items', 'npcs', 'warrior', 'chest'], function(Mobs, Items, NPCs, Warrior, Chest) {

    var EntityFactory = {};

    EntityFactory.createEntity = function(kind, id, name) {
        if(!kind) {
            log.error("kind is undefined", true);
            return;
        }
    
        if(!_.isFunction(EntityFactory.builders[kind])) {
            throw Error(kind + " is not a valid Entity type");
        }
    
        return EntityFactory.builders[kind](id, name);
    };

    //===== mobs ======

    EntityFactory.builders = [];

    EntityFactory.builders[Entities.WARRIOR] = function(id, name) {
        return new Warrior(id, name);
    };

    EntityFactory.builders[Entities.RAT] = function(id) {
        return new Mobs.Rat(id);
    };

    EntityFactory.builders[Entities.SKELETON] = function(id) {
        return new Mobs.Skeleton(id);
    };

    EntityFactory.builders[Entities.SKELETON2] = function(id) {
        return new Mobs.Skeleton2(id);
    };

    EntityFactory.builders[Entities.SPECTRE] = function(id) {
        return new Mobs.Spectre(id);
    };
    
    EntityFactory.builders[Entities.DEATHKNIGHT] = function(id) {
        return new Mobs.Deathknight(id);
    };

    EntityFactory.builders[Entities.GOBLIN] = function(id) {
        return new Mobs.Goblin(id);
    };

    EntityFactory.builders[Entities.OGRE] = function(id) {
        return new Mobs.Ogre(id);
    };

    EntityFactory.builders[Entities.CRAB] = function(id) {
        return new Mobs.Crab(id);
    };

    EntityFactory.builders[Entities.SNAKE] = function(id) {
        return new Mobs.Snake(id);
    };

    EntityFactory.builders[Entities.EYE] = function(id) {
        return new Mobs.Eye(id);
    };

    EntityFactory.builders[Entities.BAT] = function(id) {
        return new Mobs.Bat(id);
    };

    EntityFactory.builders[Entities.WIZARD] = function(id) {
        return new Mobs.Wizard(id);
    };

    EntityFactory.builders[Entities.BOSS] = function(id) {
        return new Mobs.Boss(id);
    };

    //===== items ======
 
    EntityFactory.builders[Entities.SWORD2] = function(id) {
        return new Items.Sword2(id);
    };

    EntityFactory.builders[Entities.AXE] = function(id) {
        return new Items.Axe(id);
    };

    EntityFactory.builders[Entities.REDSWORD] = function(id) {
        return new Items.RedSword(id);
    };

    EntityFactory.builders[Entities.BLUESWORD] = function(id) {
        return new Items.BlueSword(id);
    };

    EntityFactory.builders[Entities.GOLDENSWORD] = function(id) {
        return new Items.GoldenSword(id);
    };

    EntityFactory.builders[Entities.MORNINGSTAR] = function(id) {
        return new Items.MorningStar(id);
    };

    EntityFactory.builders[Entities.MAILARMOR] = function(id) {
        return new Items.MailArmor(id);
    };

    EntityFactory.builders[Entities.LEATHERARMOR] = function(id) {
        return new Items.LeatherArmor(id);
    };

    EntityFactory.builders[Entities.PLATEARMOR] = function(id) {
        return new Items.PlateArmor(id);
    };

    EntityFactory.builders[Entities.REDARMOR] = function(id) {
        return new Items.RedArmor(id);
    };

    EntityFactory.builders[Entities.GOLDENARMOR] = function(id) {
        return new Items.GoldenArmor(id);
    };

    EntityFactory.builders[Entities.FLASK] = function(id) {
        return new Items.Flask(id);
    };
    
    EntityFactory.builders[Entities.FIREPOTION] = function(id) {
        return new Items.FirePotion(id);
    };

    EntityFactory.builders[Entities.BURGER] = function(id) {
        return new Items.Burger(id);
    };
    
    EntityFactory.builders[Entities.CAKE] = function(id) {
        return new Items.Cake(id);
    };

    EntityFactory.builders[Entities.CHEST] = function(id) {
        return new Chest(id);
    };

    //====== NPCs ======

    EntityFactory.builders[Entities.GUARD] = function(id) {
        return new NPCs.Guard(id);
    };

    EntityFactory.builders[Entities.KING] = function(id) {
        return new NPCs.King(id);
    };

    EntityFactory.builders[Entities.VILLAGEGIRL] = function(id) {
        return new NPCs.VillageGirl(id);
    };

    EntityFactory.builders[Entities.VILLAGER] = function(id) {
        return new NPCs.Villager(id);
    };
    
    EntityFactory.builders[Entities.CODER] = function(id) {
        return new NPCs.Coder(id);
    };

    EntityFactory.builders[Entities.AGENT] = function(id) {
        return new NPCs.Agent(id);
    };

    EntityFactory.builders[Entities.RICK] = function(id) {
        return new NPCs.Rick(id);
    };

    EntityFactory.builders[Entities.SCIENTIST] = function(id) {
        return new NPCs.Scientist(id);
    };

    EntityFactory.builders[Entities.NYAN] = function(id) {
        return new NPCs.Nyan(id);
    };

    EntityFactory.builders[Entities.PRIEST] = function(id) {
        return new NPCs.Priest(id);
    };
    
    EntityFactory.builders[Entities.SORCERER] = function(id) {
        return new NPCs.Sorcerer(id);
    };

    EntityFactory.builders[Entities.OCTOCAT] = function(id) {
        return new NPCs.Octocat(id);
    };
    
    EntityFactory.builders[Entities.BEACHNPC] = function(id) {
        return new NPCs.BeachNpc(id);
    };
    
    EntityFactory.builders[Entities.FORESTNPC] = function(id) {
        return new NPCs.ForestNpc(id);
    };
    
    EntityFactory.builders[Entities.DESERTNPC] = function(id) {
        return new NPCs.DesertNpc(id);
    };
    
    EntityFactory.builders[Entities.LAVANPC] = function(id) {
        return new NPCs.LavaNpc(id);
    };
    
    return EntityFactory;
});
