let express = require('express');
let app = express();

app.use(express.json());
const urlencodedParser = express.urlencoded({extended: false});
app.post("/api/tickets", urlencodedParser, require ('./controllers/tickets/create').create)
app.listen(80, () => {
    console.log("http server started");
});
