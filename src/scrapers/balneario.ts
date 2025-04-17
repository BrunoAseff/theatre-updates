import puppeteer, { Page, Browser } from "puppeteer";
import { Movie, GistContent } from "../types";
import {
  autoScroll,
  log,
  sleep,
  PUPPETEER_CONFIG,
  setupPage,
} from "../utils/utils";

const BALNEARIO_URL = "https://www.balneariocamboriushopping.com.br/cinema";

async function getMovieDetails(page: Page, name: string) {
  await page.evaluate((movieName: string) => {
    const movieElements = Array.from(
      document.querySelectorAll("app-single-movie h3")
    );
    const targetElement = movieElements
      .find((el) => el.textContent?.trim() === movieName)
      ?.closest("app-single-movie");
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, name);

  await sleep(2000);

  const movieInfo = await page.evaluate((movieName: string) => {
    const movieElements = Array.from(
      document.querySelectorAll("app-single-movie")
    );
    const movieElement = movieElements.find(
      (el) => el.querySelector("h3")?.textContent?.trim() === movieName
    );

    if (!movieElement) return null;

    const coverImageUrl =
      movieElement
        .querySelector(".movie-poster-area img")
        ?.getAttribute("src") || "";
    const genre =
      movieElement
        .querySelector("ul.movie-time li:first-child")
        ?.textContent?.trim() || "";
    const duration =
      movieElement
        .querySelector("ul.movie-time li:nth-child(2)")
        ?.textContent?.trim() || "";
    const description =
      movieElement.querySelector("p")?.textContent?.trim() || "";
    const readMoreButton = movieElement.querySelector(
      ".read-more"
    ) as HTMLElement;
    const hasDetails =
      readMoreButton && !readMoreButton.getAttribute("href")?.includes("#");

    return { coverImageUrl, genre, duration, description, hasDetails };
  }, name);

  return movieInfo;
}

async function getExtendedDetails(page: Page, browser: Browser, name: string) {
  await page.evaluate((movieName: string) => {
    const movieElements = Array.from(
      document.querySelectorAll("app-single-movie")
    );
    const movieElement = movieElements.find(
      (el) => el.querySelector("h3")?.textContent?.trim() === movieName
    );
    const readMoreButton = movieElement?.querySelector(
      ".read-more"
    ) as HTMLElement;
    if (readMoreButton) readMoreButton.click();
  }, name);

  await sleep(3000);

  try {
    await page.waitForFunction(
      () => {
        const el = document.querySelector(".sinopse");
        return el?.textContent?.length ?? 0 > 0;
      },
      { timeout: 5000 }
    );

    const detailedInfo = await page.evaluate(() => ({
      description:
        document.querySelector(".sinopse")?.textContent?.trim() || "",
      duration:
        document
          .querySelector(".duration")
          ?.textContent?.replace("Duração:", "")
          .trim() || "",
    }));

    const trailerLink = await getTrailerLink(page, browser);

    return { ...detailedInfo, trailerLink };
  } catch (error) {
    log(`Não foi possível carregar detalhes extras para ${name}`, "error");
    return null;
  }
}

async function getTrailerLink(page: Page, browser: Browser): Promise<string> {
  const popupPromise = new Promise<string>(async (resolve) => {
    browser.once("targetcreated", async (target) => {
      const newPage = await target.page();
      if (newPage) {
        const url = newPage.url();
        await newPage.close();
        resolve(url);
      } else {
        resolve("");
      }
    });

    setTimeout(() => resolve(""), 5000);
  });

  await page.evaluate(() => {
    const trailerButton = document.querySelector("#ver-trailer") as HTMLElement;
    if (trailerButton) trailerButton.click();
  });

  return popupPromise;
}

export async function scrapeBalneario(gistData: GistContent): Promise<{
  newMovies: Movie[];
  removedMovies: Movie[];
}> {
  const browser = await puppeteer.launch(PUPPETEER_CONFIG);

  try {
    const page = await setupPage(browser, BALNEARIO_URL);

    const previousMovies = gistData.balneario.movies;
    const previousMovieNames = new Set(
      previousMovies.map((movie) => movie.name)
    );
    const currentMovieNames = new Set<string>();
    const newMovies: Movie[] = [];

    await autoScroll(page);
    await sleep(2000);

    log("Buscando filmes em cartaz...");
    const movieNames = await page.$$eval("app-single-movie h3", (elements) =>
      elements.map((el) => el.textContent?.trim() || "")
    );

    log(`Encontrados ${movieNames.length} filmes no total.`);

    for (const name of movieNames) {
      currentMovieNames.add(name);

      if (!previousMovieNames.has(name)) {
        log(`Processando novo filme: ${name}`);

        try {
          const movieInfo = await getMovieDetails(page, name);

          if (!movieInfo) {
            log(`Não foi possível encontrar informações para ${name}`, "error");
            continue;
          }

          let description = movieInfo.description;
          let duration = movieInfo.duration;
          let trailerLink = "";

          if (movieInfo.hasDetails) {
            log(`Buscando detalhes adicionais para ${name}...`);
            const extendedInfo = await getExtendedDetails(page, browser, name);

            if (extendedInfo) {
              description = extendedInfo.description;
              duration = extendedInfo.duration;
              trailerLink = extendedInfo.trailerLink;

              if (trailerLink) {
                log(`Trailer encontrado para ${name}`, "success");
              }
            }

            await page.goBack();
            await sleep(6000);
          }

          const movie: Movie = {
            name,
            coverImageUrl: movieInfo.coverImageUrl,
            description,
            duration: duration.replace(/[^0-9h min]/g, "").trim(),
            genre: movieInfo.genre,
            trailerLink,
          };

          newMovies.push(movie);
          log(`Filme ${name} processado com sucesso`, "success");
          await page.goBack();
        } catch (error) {
          log(`Erro ao processar o filme ${name}: ${error}`, "error");
          continue;
        }
      }
    }

    const removedMovies = previousMovies.filter(
      (movie) => !currentMovieNames.has(movie.name)
    );

    if (removedMovies.length > 0) {
      log(
        `Filmes que saíram de cartaz: ${removedMovies
          .map((m) => m.name)
          .join(", ")}`,
        "info"
      );
    }

    log(
      `Scraping concluído. ${newMovies.length} novos filmes encontrados.`,
      "success"
    );
    return { newMovies, removedMovies };
  } catch (error) {
    log(`Erro ao fazer scraping do Balneário: ${error}`, "error");
    throw error;
  } finally {
    await browser.close();
  }
}
