const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const Sentry = require('@sentry/node');
const he = require('he');

const puppeteer = require('puppeteer-core');

const jsdom = require("jsdom");
const RecipeClipper = require('@julianpoy/recipe-clipper');

const INTERCEPT_PLACEHOLDER_URL = "https://example.com/intercept-me";
const sanitizeHtml = require('sanitize-html');

const disconnectPuppeteer = (browser) => {
  try {
    browser.disconnect();
  } catch(e) {
    Sentry.captureException(e);
  }
};

const clipRecipe = async clipUrl => {
  let browser;
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: `ws://${process.env.BROWSERLESS_HOST}:${process.env.BROWSERLESS_PORT}?stealth&blockAds&--disable-web-security`
    });

    const page = await browser.newPage();

    await page.setBypassCSP(true);

    await page.setRequestInterception(true);
    page.on('request', async interceptedRequest => {
      if (interceptedRequest.url() === INTERCEPT_PLACEHOLDER_URL) {
        try {
          const response = await fetch(process.env.INGREDIENT_INSTRUCTION_CLASSIFIER_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: interceptedRequest.postData(),
          });

          const text = await response.text();

          interceptedRequest.respond({
            content: 'application/json',
            body: text
          });
        } catch(e) {
          console.log("Error while classifying", e);
          request.abort();
        }
      } else {
        interceptedRequest.continue();
      }
    });

    try {
      await page.goto(clipUrl, {
        waitUntil: "networkidle2",
        timeout: 25000
      });
    } catch(err) {
      err.status = 400;

      Sentry.withScope(scope => {
        scope.setExtra('clipUrl', clipUrl);
        Sentry.captureException(err);
      });

      throw err;
    }

    await page.evaluate(`() => {
      try {
        // Force lazyload for content listening to scroll
        window.scrollTo(0, document.body.scrollHeight);
      } catch(e) {}

      try {
        // Fix UMD for sites that define reserved names globally
        window.define = null;
        window.exports = null;
      } catch(e) {}
    }`);

    await page.addScriptTag({ path: './node_modules/@julianpoy/recipe-clipper/dist/recipe-clipper.umd.js' });
    const recipeData = await page.evaluate((interceptUrl) => {
      return window.RecipeClipper.clipRecipe({
        mlClassifyEndpoint: interceptUrl,
      });
    }, INTERCEPT_PLACEHOLDER_URL);

    disconnectPuppeteer(browser);

    return recipeData;
  } catch (e) {
    disconnectPuppeteer(browser);

    throw e;
  }
};

const replaceBrWithBreak = (html) => {
  return html.replaceAll(new RegExp("<br( \/)?>", 'g'), '\n');
}

const clipRecipeJSDOM = async url => {
  const response = await fetch(url);

  const document = await response.text();

  const dom = new jsdom.JSDOM(document);

  const { window } = dom;

  Object.defineProperty(window.Element.prototype, 'innerText', {
    get() {
      const html = replaceBrWithBreak(this.innerHTML);
      return sanitizeHtml(html, {
        allowedTags: [], // remove all tags and return text content only
        allowedAttributes: {}, // remove all tags and return text content only
      });
    }
  });

  window.fetch = fetch;

  return await RecipeClipper.clipRecipe({
    window,
    mlClassifyEndpoint: process.env.INGREDIENT_INSTRUCTION_CLASSIFIER_URL,
  });
};

const objDiffKeys = (obj1, obj2) => {
  obj1 = obj1 || {};
  obj2 = obj2 || {};

  const keys = [...new Set([
    ...Object.keys(obj1),
    ...Object.keys(obj2),
  ])];

  return keys.filter(key => obj1[key] !== obj2[key]);
}

router.get('/', async (req, res, next) => {
  try {
    const url = (req.query.url || "").trim();
    if (!url) {
      return res.status(400).send("Must provide a URL");
    }

    const [clipRecipeResult, clipRecipeJSDOMResult] = await Promise.allSettled([
      clipRecipe(url),
      clipRecipeJSDOM(url),
    ]);

    const recipeData = clipRecipeResult.value || {};
    const recipeDataJSDOM = clipRecipeJSDOMResult.value || {};

    const differentKeys = objDiffKeys(recipeData, recipeDataJSDOM);
    const diff = differentKeys.reduce((acc, key) => {
      acc[key] = {
        recipeData: recipeData[key],
        recipeDataJSDOM: recipeDataJSDOM[key],
      }
      return acc;
    }, {});

    // Merge results (browser overrides JSDOM due to accuracy)
    const results = recipeDataJSDOM;
    Object.entries(recipeData).forEach((entry) => {
      if(entry[1]) results[entry[0]] = entry[1];
    });

    // Decode all html entities from fields
    Object.entries(results).forEach((entry) => {
      results[entry[0]] = he.decode(entry[1]);
    });

    res.status(200).json(results);
  } catch(e) {
    next(e);
  }
});

module.exports = router;

