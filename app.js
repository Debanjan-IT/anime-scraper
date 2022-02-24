const express = require('express')
const puppeteer = require('puppeteer');
var bodyParser = require('body-parser')
var cors = require('cors')
var app = express()

app.use(cors())
app.use(bodyParser.json())
const port = process.env.PORT || 3030

app.post('/get_data', async (req, res) => {
    const data = await getData(req.body.url)
    res.send(data)
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})


async function getData(purl) {
    const url = purl;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const episodes = await page.evaluate(() => {
        var retData = []
        const data = document.querySelectorAll("#episode_related > li > a")
        const links = data.forEach(element => {
            retData.push({
                link: element.href
            })
        })
        return retData
    })
    page.close()
    var episodes_video_link = []
    for (let i = 0; i < episodes.length; i++) {
        const newTabForSearch = await browser.newPage()
        await newTabForSearch.goto(episodes[i].link)
        const episode_data = await newTabForSearch.evaluate(() => {
            return document.querySelector("#playerframe").src
        })
        episodes_video_link.push({
            episode_number: i + 1,
            video_link: episode_data
        })
    }
    await browser.close();
    return episodes_video_link
}