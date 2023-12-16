import url from "url";
import http from "http";
import Utils from "./utils.mjs";
import _ from "underscore";
import { WebSocketServer } from "ws";

const { info } = console;

/**
 * Abstract Server and Connection classes
 */
class Server {
  constructor(port) {
    this.port = port;
  }

  onConnect(callback) {
    this.connection_callback = callback;
  }

  onError(callback) {
    this.error_callback = callback;
  }

  broadcast(message) {
    throw "Not implemented";
  }

  forEachConnection(callback) {
    _.each(this._connections, callback);
  }

  addConnection(connection) {
    this._connections[connection.id] = connection;
  }

  removeConnection(id) {
    delete this._connections[id];
  }

  getConnection(id) {
    return this._connections[id];
  }
}

class Connection {
  constructor(id, connection, server) {
    this._connection = connection;
    this._server = server;
    this.id = id;
  }

  onClose(callback) {
    this.close_callback = callback;
  }

  listen(callback) {
    this.listen_callback = callback;
  }

  broadcast(message) {
    this._server.broadcast(message);
  }

  send(message) {
    this._connection.send(JSON.stringify(message));
  }

  sendUTF8(data) {
    this._connection.send(data);
  }

  close(logError) {
    info(
      "Closing connection to " +
        this._connection.remoteAddress +
        ". Error: " +
        logError
    );

    this._connection.close();
  }
}

/**
 * MultiVersionWebsocketServer
 */
class MultiVersionWebsocketServer extends Server {
  constructor(port) {
    super(port);
    this._connections = {};
    this._counter = 0;
    this._httpServer = null;
    this._wsServer = null;
    this._init();
  }

  _init() {
    const self = this;

    this._httpServer = http.createServer(function (request, response) {
      const path = url.parse(request.url).pathname;
      switch (path) {
        case "/status":
          if (self.status_callback) {
            response.writeHead(200);
            response.write(self.status_callback());
            break;
          }
          break;
        default:
          response.writeHead(404);
      }
      response.end();
    });

    this._httpServer.listen(this.port, function () {
      info("Server is listening on port " + self.port);
    });

    this._wsServer = new WebSocketServer({
      server: this._httpServer,
    }); // Create WebSocket server

    this._wsServer.on("connection", function (connection) {
      // handle connection errors
      connection.on("error", function (error) {
        console.error("Connection error: " + error.toString());
      });

      // Add remoteAddress property
      connection.remoteAddress = connection._socket.remoteAddress;

      // Create a new Connection object for this client
      const c = new Connection(self._createId(), connection, self);

      if (self.connection_callback) {
        self.connection_callback(c);
      }

      // Add the connection to the server
      self.addConnection(c);

      // Listen for messages from this client
      connection.on("message", function (message) {
        if (c.listen_callback) {
          c.listen_callback(JSON.parse(message));
        }
      });

      // Remove the connection when it closes
      connection.on("close", function (connection) {
        if (self.close_callback) {
          self.close_callback();
        }

        self.removeConnection(c.id);
      });
    });
  }

  _createId() {
    return "5" + Utils.random(99) + "" + this._counter++;
  }

  broadcast(message) {
    this.forEachConnection(function (connection) {
      connection.send(message);
    });
  }

  onRequestStatus(status_callback) {
    this.status_callback = status_callback;
  }
}

export { MultiVersionWebsocketServer };
