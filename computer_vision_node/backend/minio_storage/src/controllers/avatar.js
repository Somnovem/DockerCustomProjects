const minioClient = require('./../helpers/minio');
const bucketName = 'upload';

module.exports = function (request, response) {
    if (request.files.avatar) {
        console.debug(request.files.avatar);
        const avatarFile = request.files.avatar;
        const objectName = avatarFile.name;

        minioClient.putObject(bucketName, objectName, avatarFile.data, (err, etag) => {
            if (err) {
                console.error(err);
                return response.status(500).json({ error: 'Failed to upload avatar' });
            }
            console.log('Avatar uploaded successfully');
            return response.status(200).json({ message: 'Avatar uploaded successfully' });
        });
    }
}
