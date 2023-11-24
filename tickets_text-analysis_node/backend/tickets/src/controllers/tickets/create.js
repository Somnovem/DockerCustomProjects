
let sendNotification = require('../../helpers/send_notification');
let socketEmitter = require('../../helpers/socket_emitter');
let uuid = require('uuid');

// Получить секретный ключ для создания токена
const JWT_KEY = process.env.JWT_KEY;

// Модуль, который принимает Http Request и Http Response
exports.create = function (request, response) {
    // Если пользователь ничего не прислал - возвращаю статус 400
    if(!request.body) return response.sendStatus(400);

    // Получаю данные из тела запроса
    console.log(request.body);
    let ticket = request.body;
    ticket.id = uuid.v4();

    // В этой точке я считаю, что в базу данных у меня уже записан тикет

    sendNotification('tickets.create', {
        ticket: ticket
    });

    // // Плохая практика - отсылать сообщение (нотификацию) прямо на клиента
    // // В этом случае усложняется горизонтальное масштабирование - расширение правил для этого сообщения
    // // НО это допускается для малых проектов.
    // socketEmitter('tickets.create', {
    //     // На случай изменения набора информации
    //     ticket: ticket
    // });

    // Возвращаю статус 200 (все прошло ОК) и результат работы
    // В данном случае - возвращать нужно 201 - потому что была создана новая сущность
    return response.status(201).json(ticket);
}
