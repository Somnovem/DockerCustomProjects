const uploadFileToBlobStorage = require('./../helpers/azureStorage')
let rabbitMQ_vision = require('./../helpers/rabbit');

module.exports = function (request, response) {

    if (request.files.avatar)
    {
        console.debug(request.files.avatar);
        const avatarFile = request.files.avatar;
        const objectName = avatarFile.name;
        uploadFileToBlobStorage('avatars', objectName, avatarFile.data)
            .then(() =>{
                const img = {
                    url: "https://zhmurapv111.blob.core.windows.net/avatars/" + objectName
                }
                rabbitMQ_vision(img);
                return response.status(200).json({
                    message: "File " + objectName + " upload"
                })
            })
            .catch((err) => {
                return response.status(419).json({
                    message: err.message
                })
            });
    }
    else {
        return response.status(419).json({
            message: 'File not Found'
        })
    }
}