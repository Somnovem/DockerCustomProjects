const ComputerVisionClient =
    require("@azure/cognitiveservices-computervision").ComputerVisionClient;
const ApiKeyCredentials = require("@azure/ms-rest-js").ApiKeyCredentials;

const KEY = "";
const ENDPOINT = "";

const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({ inHeader: { "Ocp-Apim-Subscription-Key": KEY } }),
    ENDPOINT
);

const descUrl = "https://zhmurapv111.blob.core.windows.net/avatars/img 01514.jpg";

computerVisionClient.describeImage(descUrl)
    .then(res => {
        console.log(res);
    })
    .catch(err => {
        console.error(err);
    });


