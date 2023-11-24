const MINIO_ACCESS_KEY=process.env.MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY=process.env.MINIO_SECRET_KEY;

const MINIO_ENDPOINT=process.env.MINIO_ENDPOINT || 'http://localhost';
const MINIO_PORT=process.env.MINIO_PORT || 9000;

const Minio = require('minio');

const minioClient = new Minio.Client({
    endPoint: MINIO_ENDPOINT,
    port: parseInt(MINIO_PORT),
    useSSL: false,
    accessKey: MINIO_ACCESS_KEY,
    secretKey: MINIO_SECRET_KEY,
});

module.exports = minioClient;
