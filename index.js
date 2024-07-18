import express from "express";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const isUrlValid = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch (err) {
        return false;
    }
}

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "urlform.html"));
});

app.post("/shorten", (req, res) => {
    let isValidUrl = isUrlValid(req.body.longurl);

    if (!isValidUrl) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid longurl"
        });
    }

    let shortUrl = nanoid(6);

    const urlsFromFile = fs.readFileSync('urls.json', 'utf-8');
    const urlsjson = JSON.parse(urlsFromFile);

    urlsjson[shortUrl] = req.body.longurl;

    fs.writeFileSync("urls.json", JSON.stringify(urlsjson));

    res.json({
        success: true,
        shorturl: `http://localhost:10000/${shortUrl}`
    });
});

app.get('/:shortUrl', (req, res) => {
    const { shortUrl } = req.params;
    const urls = fs.readFileSync('urls.json', "utf-8");
    const urlsjson = JSON.parse(urls);
    const longURL = urlsjson[shortUrl];

    if (!longURL) {
        return res.end("Invalid Short URL");
    }
    res.redirect(longURL);
});

app.listen(10000, () => {
    console.log("Server is up and running at port 10000");
});
