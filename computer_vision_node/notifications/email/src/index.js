const RABBITMQ_DEFAULT_USER = process.env.RABBITMQ_DEFAULT_USER || 'root';
const RABBITMQ_DEFAULT_PASS = process.env.RABBITMQ_DEFAULT_PASS || 'password';
const RABBITMQ_SERVER = process.env.RABBITMQ_SERVER || 'rabbit.mq';
const RABBITMQ_PORT = process.env.RABBITMQ_PORT || 5672;
const RABBITMQ_CONNECTION_URI = `amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@${RABBITMQ_SERVER}:${RABBITMQ_PORT}`;

const RABBITMQ_QUEUE_NOTIFICATIONS_EMAIL = process.env.RABBITMQ_QUEUE_NOTIFICATIONS_EMAIL || 'notifications.email';

const MAIL_HOST = process.env.MAIL_HOST || 'smtp'
const MAIL_PORT = process.env.MAIL_PORT || 25
const MAIL_USERNAME = process.env.MAIL_USERNAME || 'noreply'
const MAIL_PASSWORD = process.env.MAIL_PASSWORD || 'password'
const MAIL_ENCRYPTION = process.env.MAIL_ENCRYPTION || null
const MAIL_FROM_ADDRESS = process.env.MAIL_FROM_ADDRESS || 'noreply'
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'TestMail'


const amqp = require ('amqplib/callback_api.js');
const nodemailer = require ('nodemailer');


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

        await channel.assertQueue(RABBITMQ_QUEUE_NOTIFICATIONS_EMAIL, {}, (errorQueue) => {
            if (errorQueue) {
                console.error(errorQueue);
                process.exit(-1);
            }
            console.debug("Notification > Email queue asserted");

            // Назначаю слушателя очереди уведомлений.
            channel.consume(RABBITMQ_QUEUE_NOTIFICATIONS_EMAIL,  async (data) => {
               let notification = JSON.parse(data.content.toString());

               console.debug(notification);


                try {
                    const transporter = nodemailer.createTransport({
                        host: MAIL_HOST,
                        port: MAIL_PORT,
                        // secure: true,
                        auth: {
                            user: MAIL_USERNAME,
                            pass: MAIL_PASSWORD,
                        },
                    });

                    const mailOptions = {
                        from: MAIL_FROM_ADDRESS,
                        to: 'keeper@ninydev.com',
                        subject: 'Hello, ',
                        text: 'Test',
                        html: '<p> Test</p> <footer>  Notification from U app </footer>',
                    };

                    const info = await transporter.sendMail(mailOptions);
                    console.debug(info);
                    channel.ack(data);
                } catch (error) {
                    console.error(error);
                }


            });


        });
    });


});
