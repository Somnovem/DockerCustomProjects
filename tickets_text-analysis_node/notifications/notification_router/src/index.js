const RABBITMQ_DEFAULT_USER = process.env.RABBITMQ_DEFAULT_USER || 'root';
const RABBITMQ_DEFAULT_PASS = process.env.RABBITMQ_DEFAULT_PASS || 'password';
const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER || 'rabbit.mq';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_CONNECTION_URI = `amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@${RABBITMQ_SERVER}:${RABBITMQ_PORT}`;
const RABBITMQ_QUEUE_NOTIFICATIONS = process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notifications';
const RABBITMQ_QUEUE_NOTIFICATIONS_EMAIL = process.env.RABBITMQ_QUEUE_NOTIFICATIONS_EMAIL || 'notifications.email';
const RABBITMQ_QUEUE_TEXT_BLOB = process.env.RABBITMQ_QUEUE_TEXT_BLOB || 'text.textblob';
const RABBITMQ_QUEUE_NATURAL_NODE = process.env.RABBITMQ_QUEUE_NATURAL_NODE || 'natural.node';

const amqp = require ('amqplib/callback_api.js');
let socketEmitter = require('./helpers/socket_emitter');

amqp.connect(RABBITMQ_CONNECTION_URI, {}, async (errorConnect, connection) => {
    if (errorConnect) {
        console.error(errorConnect);
        process.exit(-1);
    }
    console.debug("connect RabbitMQ ok");

    await connection.createChannel(async (errorChannel, channel) => {
        if (errorChannel) {
            console.error(errorChannel);
            process.exit(-1);
        }

        await channel.assertQueue(RABBITMQ_QUEUE_NOTIFICATIONS, {}, (errorQueue) => {
            if (errorQueue) {
                console.error(errorQueue);
                process.exit(-1);
            }
            console.debug("Notifications queue asserted");

            channel.consume(RABBITMQ_QUEUE_NOTIFICATIONS,  async (data) => {
               let notification = JSON.parse(data.content.toString());
               let ticket = notification.data.ticket;
               console.debug(notification);

               switch (notification.name) {
                   case 'tickets.create':
                       socketEmitter('admin.tickets.create', { ticket: ticket });
                       channel.sendToQueue(RABBITMQ_QUEUE_TEXT_BLOB, Buffer.from(JSON.stringify(ticket)));
                       console.log("Send to" + RABBITMQ_QUEUE_TEXT_BLOB);

                       setTimeout(() => {
                           console.log('TimeOut');
                           socketEmitter('admin.tickets.update.' + ticket.id, {
                               message: " Внутри системы что то обновилось",
                               ticket: ticket
                           } );
                           channel.sendToQueue(RABBITMQ_QUEUE_NATURAL_NODE, Buffer.from(JSON.stringify(ticket)));
                       }, 1000);


                       break;
                   case 'ai.computer.vision':
                       socketEmitter(notification.name, notification.data);
                       channel.sendToQueue(RABBITMQ_QUEUE_NOTIFICATIONS_EMAIL, Buffer.from(JSON.stringify(notification)));
                       break;
                   case 'user.login':
                       socketEmitter(notification.name, notification.data);
                       channel.sendToQueue(RABBITMQ_QUEUE_NOTIFICATIONS_EMAIL, Buffer.from(JSON.stringify(notification)));
                       break;
               }

                channel.ack(data);
            });
        });
    });
});
