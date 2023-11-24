import {defineStore} from "pinia";
import {toast} from "vue3-toastify";
import {io} from "socket.io-client";


export const useSocketMainStore = defineStore('socket.main', {
    state: () => ({
        isConnect: false, // Флаг, который говорит, есть ли соединение
        socket: null // Сам объект для соединения
    }),
    actions: {
        /**
         * Процесс установки соединения
         */
        connect() {
            if (this.isConnect) return
            this.socket = io('/')
            this.isConnect = true

            // Реакция на сообщение с сервера
            this.socket.on('socket.myNameIs', (data) => {
                toast.success('Connect to: ' + data)
            })

            //Реакция на любое сообщение
            this.socket.on('message', (data) => {
                console.log('Catch message from server:', data);
            });

            //Реакция на появление нового тикета
            this.socket.on('admin.tickets.create', (data) => {
                console.log('Catch Tickets from server:', data);
                // Эта переменная относиться к получению сообщения о новом тикете
                let message = JSON.parse(data);
                toast.dark("Срочно набери " + message.ticket.name + " по номеру телефона " + message.ticket.phone);

                // Подпишемся на сообщения от этого тикета
                // На практике тут лучше использовать rooms
                this.socket.on('admin.tickets.update.' + message.ticket.id, (data) => {
                    console.log('Update Ticket:', data);
                    // А эта переменная находится внутри callBack метода - и относится к обновлению тикета
                    let message = JSON.parse(data);
                    toast.dark(`Произошло обновление(${message.message}) в тикете ` + message.ticket.name);
                });

            });

            // Пинг с сервера
            this.socket.on('ping', (data) => {
                toast.info('Ping from server: \n' + new Date(data).toLocaleString(), {
                    theme: 'colored',
                    position: toast.POSITION.BOTTOM_RIGHT,
                    transition: "zoom",
                    autoClose: 500
                });
            });

            // Реакция на отключение связи
            this.socket.on('disconnect', (data) => {
                toast.error(data)
                this.isConnect = false
            })

        },
        on(eventName, callBack){
            this.socket.on(eventName, callBack);

        },
        off(eventName, callBack){
            this.socket.off(eventName, callBack)
        }
    }
})
