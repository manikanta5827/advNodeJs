const passport = require("passport");
const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const sessionFactory = require("./factories/sessionFactory");
const userFactory = require("./factories/userFactory");
jest.setTimeout(20000);

let browser, page;
beforeEach(async () => {
  try {
    browser = await puppeteer.launch({
      headless: false,
    });
    page = await browser.newPage();
    await page.goto("http://localhost:3000");
  } catch (error) {
    console.log(error);
  }
});

afterEach(async () => {
  await browser.close();
});
afterAll(async () => {
  await mongoose.disconnect();
});
test("open browser", async () => {
  try {
    const text = await page.$eval("a.brand-logo", (el) => el.innerHTML);
    expect(text).toEqual("Blogster");
  } catch (error) {
    console.error("Error during test:", error);
  }
});

test("Oauth", async () => {
 
  await page.click(".right a");

  const url = await page.url();
  // console.log(url);
  expect(url).toMatch("accounts.google.com");
});

test("check logout button on login", async () => {
  const user = await userFactory();
  
  const { session, sig } = sessionFactory(user);
  console.log();
  

  // Set cookies
  await page.setCookie(
    { name: 'session', value: session },
    { name: 'session.sig', value: sig }
  );
 
  await page.goto("http://localhost:3000");

  await page.waitFor('a[href="/auth/logout"]');
  const link = await page.$eval('a[href="/auth/logout"]', (el) => el.href);
 
  expect(link).toEqual("http://localhost:3000/auth/logout");
  
});
