const { BlobServiceClient } = require('@azure/storage-blob');

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const accountConnectionString = process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING;

if (!accountName) throw Error('Azure Storage accountName not found');
if (!accountKey) throw Error('Azure Storage accountKey not found');

module.exports = async function (containerName, blobName, content) {
    const blobServiceClient = BlobServiceClient.fromConnectionString(accountConnectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    if (!(await containerClient.exists())) {
        await containerClient.create();
    }

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.upload(content, content.length, { overwrite: true });

    console.debug(`File  was uploaded to blob storage as "${blobName}" successfully.`);
}