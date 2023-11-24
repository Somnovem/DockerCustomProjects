let express = require('express');
let app = express();

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use(express.json());
const urlencodedParser = express.urlencoded({extended: false});

let uploadAvatar = require ('./controllers/avatar')
app.post("/api/azure/upload/avatar", urlencodedParser, uploadAvatar)

app.listen(80, () => {
    console.log("http file-upload server started");
});
