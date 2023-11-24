const REDIS_SOCKET_HOST = process.env.REDIS_SOCKET_HOST || 'redis.sockets';
const REDIS_SOCKET_PORT = process.env.REDIS_SOCKET_PORT || 6379;
const REDIS_SOCKET_CONNECTION_STRING = `redis://${REDIS_SOCKET_HOST}:${REDIS_SOCKET_PORT}`;
const { Emitter } = require("@socket.io/redis-emitter");
const { createClient } = require("redis"); // not included, needs to be explicitly installed
let io;

const redisClient = createClient({
    url: REDIS_SOCKET_CONNECTION_STRING});

redisClient.on('connect', () => {
    console.debug('Connection to Redis server OK');
});

redisClient.connect().then(() => {
    io = new Emitter(redisClient);
})
    .catch((err) => {
       console.error(err);
       process.exit(-1);
    });

module.exports = (eventName, eventData) => {
    io.emit(eventName, JSON.stringify(eventData));
};
