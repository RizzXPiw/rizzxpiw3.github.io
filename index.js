var express = require("express"),
    cors = require("cors"),
    secure = require("ssl-express-www");
const PORT = process.env.PORT || 3000;
var path = require("path");
var { color } = require("./lib/color.js");

var apirouter = require("./routes/chat");

var app = express();
app.enable("trust proxy");
app.set("json spaces", 2);
app.use(cors());
app.use(secure);
app.use(express.static("public"));

/* Set public folder for static files
app.use(express.static(path.join(__dirname, "public")));
*/

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});


// Serve CSS and JS files from views folder
app.use('/css', express.static(path.join(__dirname, 'views/css')));
app.use('/js', express.static(path.join(__dirname, 'views/js')));

// Serve index.html at /chat
app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Use /chat for API routes
app.use("/chat", apirouter);

app.listen(PORT, () => {
    console.log(color("Server running on port " + PORT, "green"));
});

module.exports = app;
