import fs from "fs";
import { MultiVersionWebsocketServer } from "./ws.mjs";
import WorldServer from "./worldserver.mjs";
import _ from "underscore";
import Player from "./player.mjs";

const { info, log, error } = console;

function main(config) {
  const server = new MultiVersionWebsocketServer(config.port);
  // const metrics = config.metrics_enabled ? new Metrics(config) : null;
  const metrics = false;

  let worlds = [],
    lastTotalPlayers = 0;
  const checkPopulationInterval = setInterval(() => {
    if (metrics && metrics.isReady) {
      metrics.getTotalPlayers(totalPlayers => {
        if (totalPlayers !== lastTotalPlayers) {
          lastTotalPlayers = totalPlayers;
          _.each(worlds, world => {
            world.updatePopulation(totalPlayers);
          });
        }
      });
    }
  }, 1000);

  console.log("config.debug_level: ", config.debug_level);

  info("Starting BrowserQuest game server...");

  server.onConnect(function (connection) {
    let world; // the one in which the player will be spawned
    const connect = function () {
      if (world) {
        world.connect_callback(new Player(connection, world));
      }
    };

    if (metrics) {
      metrics.getOpenWorldCount(function (open_world_count) {
        // choose the least populated world among open worlds
        world = _.min(_.first(worlds, open_world_count), function (w) {
          return w.playerCount;
        });
        connect();
      });
    } else {
      // simply fill each world sequentially until they are full
      world = _.detect(worlds, function (world) {
        return world.playerCount < config.nb_players_per_world;
      });
      world.updatePopulation();
      connect();
    }
  });

  server.onError(function () {
    error(Array.prototype.join.call(arguments, ", "));
  });

  const onPopulationChange = function () {
    metrics.updatePlayerCounters(worlds, function (totalPlayers) {
      _.each(worlds, function (world) {
        world.updatePopulation(totalPlayers);
      });
    });
    metrics.updateWorldDistribution(getWorldDistribution(worlds));
  };

  _.each(_.range(config.nb_worlds), function (i) {
    var world = new WorldServer(
      "world" + (i + 1),
      config.nb_players_per_world,
      server
    );
    world.run(config.map_filepath);
    worlds.push(world);
    if (metrics) {
      world.onPlayerAdded(onPopulationChange);
      world.onPlayerRemoved(onPopulationChange);
    }
  });

  server.onRequestStatus(function () {
    return JSON.stringify(getWorldDistribution(worlds));
  });

  if (config.metrics_enabled) {
    metrics.ready(function () {
      onPopulationChange(); // initialize all counters to 0 when the server starts
    });
  }

  process.on("uncaughtException", function (e) {
    error("uncaughtException: " + e);
  });
}

function getWorldDistribution(worlds) {
  return worlds.map(world => world.playerCount);
}

function getConfigFile(path, callback) {
  fs.readFile(path, "utf8", (err, json_string) => {
    if (err) {
      console.error("Could not open config file:", err.path);
      callback(null);
    } else {
      callback(JSON.parse(json_string));
    }
  });
}

let defaultConfigPath = "./server/config.json",
  customConfigPath = "./server/config_local.json";

process.argv.forEach((val, index) => {
  if (index === 2) {
    customConfigPath = val;
  }
});

getConfigFile(defaultConfigPath, defaultConfig => {
  getConfigFile(customConfigPath, localConfig => {
    if (localConfig) {
      main(localConfig);
    } else if (defaultConfig) {
      main(defaultConfig);
    } else {
      console.error("Server cannot start without any configuration file.");
      process.exit(1);
    }
  });
});
