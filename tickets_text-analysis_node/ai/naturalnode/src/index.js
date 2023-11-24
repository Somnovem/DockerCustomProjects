const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

const clothingKeywords = ['clothing', 'shoes', 'hat', 'dress', 'shirt', 'pants', 'suit'];
const animalsKeywords = ['dog', 'cat', 'hamster', 'turtle', 'snake', 'cockroach', 'neighbor'];

function isClothingRelated(message) {
    const tokens = tokenizer.tokenize(message.toLowerCase());
    const stemmedTokens = tokens.map(token => stemmer.stem(token));

    return clothingKeywords.some(keyword => stemmedTokens.includes(stemmer.stem(keyword)));
}

function isAnimalRelated(message) {
    const tokens = tokenizer.tokenize(message.toLowerCase());
    const stemmedTokens = tokens.map(token => stemmer.stem(token));

    return animalsKeywords.some(keyword => stemmedTokens.includes(stemmer.stem(keyword)));

}

const RABBITMQ_DEFAULT_USER = process.env.RABBITMQ_DEFAULT_USER || 'root';
const RABBITMQ_DEFAULT_PASS = process.env.RABBITMQ_DEFAULT_PASS || 'password';
const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER || 'rabbit.mq';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_CONNECTION_URI = `amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@${RABBITMQ_SERVER}:${RABBITMQ_PORT}`;

const RABBITMQ_QUEUE_NOTIFICATIONS = process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notifications';
const RABBITMQ_QUEUE_NATURAL_NODE = process.env.RABBITMQ_QUEUE_NATURAL_NODE || 'natural.node';

const amqp = require ('amqplib/callback_api.js');
let socketEmitter = require('./helpers/socket_emitter');

amqp.connect(RABBITMQ_CONNECTION_URI, {}, async (errorConnect, connection) => {
    if (errorConnect) {
        console.error(errorConnect);
        process.exit(-1);
    }

    console.debug("connect RabbitMQ OK");

    await connection.createChannel(async (errorChannel, channel) => {
        if (errorChannel) {
            console.error(errorChannel);
            process.exit(-1);
        }

        await channel.assertQueue(RABBITMQ_QUEUE_NATURAL_NODE, {}, (errorQueue) => {
            if (errorQueue) {
                console.error(errorQueue);
                process.exit(-1);
            }
            console.debug("natural node queue asserted");

            channel.consume(RABBITMQ_QUEUE_NATURAL_NODE,  async (data) => {
               let ticket = JSON.parse(data.content.toString());
               console.debug(ticket);

                if (isClothingRelated(ticket.question)) {
                    socketEmitter('admin.tickets.update.' + ticket.id, {
                        message: " Запрос про одежду ",
                        ticket: ticket
                    } )
                } else if (isAnimalRelated(ticket.question)) {
                    socketEmitter('admin.tickets.update.' + ticket.id, {
                        message: " Запрос про животных ",
                        ticket: ticket
                    } )
                } else {
                    socketEmitter('admin.tickets.update.' + ticket.id, {
                        message: " Запрос не определен ",
                        ticket: ticket
                    } )
                }

                channel.ack(data);
            });
        });
    });
});
