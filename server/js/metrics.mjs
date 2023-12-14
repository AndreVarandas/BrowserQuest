import _ from 'underscore';
import Memcache from 'memcache';

class Metrics {
    constructor(config) {
        this.config = config;
        this.client = new Memcache.Client(config.memcached_port, config.memcached_host);
        this.client.connect();

        this.isReady = false;

        this.client.on('connect', () => {
            console.info("Metrics enabled: memcached client connected to " + config.memcached_host + ":" + config.memcached_port);
            this.isReady = true;
            if (this.ready_callback) {
                this.ready_callback();
            }
        });
    }

    ready(callback) {
        this.ready_callback = callback;
    }

    updatePlayerCounters(worlds, updatedCallback) {
        let numServers = _.size(this.config.game_servers);
        let playerCount = _.reduce(worlds, (sum, world) => sum + world.playerCount, 0);

        if (this.isReady) {
            this.client.set('player_count_' + this.config.server_name, playerCount, () => {
                let total_players = 0;

                _.each(this.config.game_servers, server => {
                    this.client.get('player_count_' + server.name, (error, result) => {
                        let count = result ? parseInt(result) : 0;

                        total_players += count;
                        numServers -= 1;
                        if (numServers === 0) {
                            this.client.set('total_players', total_players, () => {
                                if (updatedCallback) {
                                    updatedCallback(total_players);
                                }
                            });
                        }
                    });
                });
            });
        } else {
            console.error("Memcached client not connected");
        }
    }

    updateWorldDistribution(worlds) {
        this.client.set('world_distribution_' + this.config.server_name, worlds);
    }

    getOpenWorldCount(callback) {
        this.client.get('world_count_' + this.config.server_name, (error, result) => {
            callback(result);
        });
    }

    getTotalPlayers(callback) {
        this.client.get('total_players', (error, result) => {
            callback(result);
        });
    }
}

export default Metrics;
