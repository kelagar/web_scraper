const puppeteer = require("puppeteer");
var XMLHttpRequest = require("xhr2");
var xhr = new XMLHttpRequest();
const request = require("request-promise");
const years = [];
const finalResult = [];

init();
// initTest();

async function init() {
  let yearsResult = await getYears();
  yearsResult = [2013]; //limit search by year
  for (let year in yearsResult) {
    let makes = await getMakes(yearsResult[year]);
    for (let make in makes) {
      let models = await getModels(yearsResult[year], makes[make]);
      for (let model in models) {
        let engines = await getEngines(
          yearsResult[year],
          makes[make],
          models[model]
        );
        for (let engine in engines) {
          let obj = {
            year: yearsResult[year],
            make: makes[make],
            model: models[model],
            query: "https://www.amsoil.ca" + engines[engine],
          };

          finalResult.push(obj);
        }
      }
    }
  }

  for (let vehicle in finalResult) {
    let scrape = await scrapePage(finalResult[vehicle].query);

    finalResult[vehicle].Engine_Fuel = scrape.Engine_Fuel;
    finalResult[vehicle].Capacity = scrape.Capacity;
    finalResult[vehicle].Price = scrape.Price;
  }

  console.log(finalResult);
}

//test function
async function initTest() {
  let engines = await getEngines(2013, "Audi", "Q5");
  for (let engine in engines) {
    let obj = {
      year: 2013,
      make: "Audi",
      model: "Q5",
      query: "https://www.amsoil.ca" + engines[engine],
    };
    finalResult.push(obj);
  }

  for (let vehicle in finalResult) {
    let scrape = await scrapePage(finalResult[vehicle].query);

    finalResult[vehicle].Engine_Fuel = scrape.Engine_Fuel;
    finalResult[vehicle].Capacity = scrape.Capacity;
    finalResult[vehicle].Price = scrape.Price;
  }

  //   console.log(finalResult);
}

async function scrapePage(url) {
  return new Promise(async function (resolve, reject) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36",
    });
    await page.goto(url);

    //declare details
    let dtls = {};

    //Get Engine Fuel
    let [engineFuel] = await page.$x(
      "/html/body/div[2]/div[1]/section/div[1]/div/div/div[1]/div/h1/span"
    );
    if (engineFuel) {
      let engineFueltext = await engineFuel.getProperty("textContent");
      let engineFuelRawTxt = await engineFueltext.jsonValue();
      dtls.Engine_Fuel = engineFuelRawTxt;
    }

    //Get Capacity
    let [capacity] = await page.$x(
      "//*[@class='item-spec__alert item-spec__alert--blue is-active']/table/tbody/tr[2]/td[2]"
    );
    if (capacity) {
      let capacityText = await capacity.getProperty("textContent");
      let capacityRawTxt = await capacityText.jsonValue();
      dtls.Capacity = capacityRawTxt;
    }

    //Get Retail Price
    let [price] = await page.$x("//*[@name='vk.KitTotalPrice']");
    if (price) {
      let priceText = await price.getProperty("textContent");
      let priceRawTxt = await priceText.jsonValue();
      dtls.Price = priceRawTxt;
    }

    resolve(dtls);
  });
}

//Get Years
async function getYears() {
  return new Promise(function (resolve, reject) {
    const data = JSON.stringify({
      url: "https://www.amsoil.ca/lookup/getyears/?type=auto-and-light-truck&year=2013",
    });

    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        var result = JSON.parse(JSON.parse(this.response).body);
        for (var i = 0; i < result.length; i++) {
          years.push(result[i].Value);
        }
        resolve(years);
      } else {
        // console.log("error");
      }
    });

    xhr.open("POST", "https://scrapeninja.p.rapidapi.com/scrape");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader(
      "X-RapidAPI-Key",
      "2d19715f9amsh7bd65a7f6219f2bp119e32jsnf4cc5e3027ec"
    );
    xhr.setRequestHeader("X-RapidAPI-Host", "scrapeninja.p.rapidapi.com");

    xhr.send(data);
  });
}

//get Makes
async function getMakes(year) {
  let makes = [];
  return new Promise(function (resolve, reject) {
    const data = JSON.stringify({
      url:
        "https://www.amsoil.ca/lookup/getmakes/?type=auto-and-light-truck&year=" +
        year,
    });
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        var result = JSON.parse(JSON.parse(this.response).body);
        for (var i = 0; i < result.length; i++) {
          makes.push(result[i].Value);
        }
        resolve(makes);
      } else {
        // console.log("error");
      }
    });

    xhr.open("POST", "https://scrapeninja.p.rapidapi.com/scrape");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader(
      "X-RapidAPI-Key",
      "2d19715f9amsh7bd65a7f6219f2bp119e32jsnf4cc5e3027ec"
    );
    xhr.setRequestHeader("X-RapidAPI-Host", "scrapeninja.p.rapidapi.com");

    xhr.send(data);
  });
}

//get Models
async function getModels(year, make) {
  let models = [];

  return new Promise(function (resolve, reject) {
    const data = JSON.stringify({
      url:
        "https://www.amsoil.ca/lookup/getmodels/?type=auto-and-light-truck&year=" +
        year +
        "&make=" +
        make,
    });
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        var result = JSON.parse(JSON.parse(this.response).body);
        for (var i = 0; i < result.length; i++) {
          models.push(result[i].Value);
        }
        resolve(models);
      } else {
        // console.log("error");
      }
    });

    xhr.open("POST", "https://scrapeninja.p.rapidapi.com/scrape");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader(
      "X-RapidAPI-Key",
      "2d19715f9amsh7bd65a7f6219f2bp119e32jsnf4cc5e3027ec"
    );
    xhr.setRequestHeader("X-RapidAPI-Host", "scrapeninja.p.rapidapi.com");

    xhr.send(data);
  });
}

//get Engines
async function getEngines(year, make, model) {
  let engines = [];

  return new Promise(function (resolve, reject) {
    const data = JSON.stringify({
      url:
        "https://www.amsoil.ca/lookup/getengines/?type=auto-and-light-truck&year=" +
        year +
        "&make=" +
        make +
        "&model=" +
        model,
    });
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        var result = JSON.parse(JSON.parse(this.response).body);
        for (var i = 0; i < result.length; i++) {
          engines.push(result[i].Value);
        }
        resolve(engines);
      } else {
        // console.log("error");
      }
    });

    xhr.open("POST", "https://scrapeninja.p.rapidapi.com/scrape");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.setRequestHeader(
      "X-RapidAPI-Key",
      "2d19715f9amsh7bd65a7f6219f2bp119e32jsnf4cc5e3027ec"
    );
    xhr.setRequestHeader("X-RapidAPI-Host", "scrapeninja.p.rapidapi.com");

    xhr.send(data);
  });
}
