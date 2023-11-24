const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');
const {readFileSync} = require("fs");
require('dotenv').config()

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const accountConnectionString = process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING;

if (!accountName) throw Error('Azure Storage accountName not found');
if (!accountKey) throw Error('Azure Storage accountKey not found');

const sharedKeyCredential
    = new StorageSharedKeyCredential(accountName, accountKey);

const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    sharedKeyCredential
);

async function uploadFileToBlobStorage(containerName, blobName, filePath) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(accountConnectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    if (!(await containerClient.exists())) {
        await containerClient.create();
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const content = readFileSync(filePath);
    await blockBlobClient.upload(content, content.length, { overwrite: true });

    console.log(`File "${filePath}" was uploaded to blob storage as "${blobName}" successfully.`);
}

async function main() {
    const containerName = 'avatars';
    const blobName = 'Lab325.jpg'; // Имя файла

    const containerClient = await blobServiceClient.getContainerClient(containerName);

    uploadFileToBlobStorage(containerName, blobName, './Lab325.jpg')
        .catch((error) => console.error(error));
}

main()
    .then(() => console.log(`done`))
    .catch((ex) => console.log(ex.message));