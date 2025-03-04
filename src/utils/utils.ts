import { Page, Browser } from "puppeteer";

export const PUPPETEER_CONFIG = {
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--window-size=1920,1080",
  ],
};

export const PAGE_CONFIG = {
  viewport: { width: 1920, height: 1080 },
  timeout: 60000,
};

export async function setupPage(browser: Browser, url: string): Promise<Page> {
  const page = (await browser.pages())[0];
  await page.setViewport(PAGE_CONFIG.viewport);

  log(`Acessando página ${url}...`);
  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: PAGE_CONFIG.timeout,
  });

  return page;
}

export async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function log(
  message: string,
  type: "info" | "error" | "success" = "info"
) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️";
  console.log(`[${timestamp}] ${prefix} ${message}`);
}
