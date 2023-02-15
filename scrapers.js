const puppeteer = require('puppeteer');

async function scrapePage(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const[el] = await page.$x('/html/body/div[2]/div[1]/section/div[1]/div/div/div[1]/div/h1/span');
    const text = await el.getProperty('textContent');
    const rawTxt = await text.jsonValue();

    console.log({rawTxt});
}

scrapePage('https://www.amsoil.ca/lookup/auto-and-light-truck/2013/acura/ilx/1-5l-4-cyl-engine-code-lea2-e/?volume=metric-volume');