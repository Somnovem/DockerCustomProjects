const ComputerVisionClient =
    require("@azure/cognitiveservices-computervision").ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const KEY = process.env.COMPUTER_VISION_KEY;
const ENDPOINT = process.env.COMPUTER_VISION_ENDPOINT;

const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": KEY } }),
    ENDPOINT
);

const RABBITMQ_DEFAULT_USER = process.env.RABBITMQ_DEFAULT_USER || 'root';
const RABBITMQ_DEFAULT_PASS = process.env.RABBITMQ_DEFAULT_PASS || 'password';
const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER || 'rabbit.mq';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_CONNECTION_URI = `amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@${RABBITMQ_SERVER}:${RABBITMQ_PORT}`;

const RABBITMQ_QUEUE_COMPUTER_VISION = process.env.RABBITMQ_QUEUE_COMPUTER_VISION || 'vision';
const RABBITMQ_QUEUE_NOTIFICATIONS = process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notifications';


const amqp = require ('amqplib/callback_api.js');

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

        await channel.assertQueue(RABBITMQ_QUEUE_COMPUTER_VISION, {}, (errorQueue) => {
            if (errorQueue) {
                console.error(errorQueue);
                process.exit(-1);
            }
            console.debug("Computer Vision queue asserted");
        });

        channel.consume(RABBITMQ_QUEUE_COMPUTER_VISION,  async (data) => {
            let img = JSON.parse(data.content.toString());

            computerVisionClient.describeImage(img.url)
                .then(res => {
                    console.log(res);
                    channel.ack(data);

                    let msg = {
                        name: 'ai.computer.vision',
                        data: res
                    }
                    channel.sendToQueue (RABBITMQ_QUEUE_NOTIFICATIONS, Buffer.from(JSON.stringify(msg)));
                })
                .catch(err => {
                    console.error(err);
                });
        });
    });
});






