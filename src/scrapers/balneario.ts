import puppeteer from "puppeteer";
import { Movie, GistContent } from "../types";
import { autoScroll } from "../utils/utils";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function scrapeBalneario(gistData: GistContent): Promise<{
  newMovies: Movie[];
  removedMovies: Movie[];
}> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920,1080",
    ],
  });

  try {
    const page = (await browser.pages())[0];
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto("https://www.balneariocamboriushopping.com.br/cinema", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    const previousMovies = gistData.balneario.movies;
    const previousMovieNames = new Set(
      previousMovies.map((movie) => movie.name)
    );
    const currentMovieNames = new Set<string>();
    const newMovies: Movie[] = [];

    await autoScroll(page);
    await sleep(2000);

    const movieNames = await page.$$eval("app-single-movie h3", (elements) =>
      elements.map((el) => el.textContent?.trim() || "")
    );

    for (const name of movieNames) {
      currentMovieNames.add(name);
      let trailerLink = "";

      if (!previousMovieNames.has(name)) {
        console.log(`Encontrado novo filme: ${name}`);

        try {
          await page.evaluate((movieName) => {
            const movieElements = Array.from(
              document.querySelectorAll("app-single-movie h3")
            );
            const targetElement = movieElements
              .find((el) => el.textContent?.trim() === movieName)
              ?.closest("app-single-movie");
            if (targetElement) {
              targetElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }, name);

          await sleep(2000);

          const movieInfo = await page.evaluate((movieName) => {
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
              readMoreButton &&
              !readMoreButton.getAttribute("href")?.includes("#");

            return { coverImageUrl, genre, duration, description, hasDetails };
          }, name);

          if (!movieInfo) {
            console.log(`Não foi possível encontrar informações para ${name}`);
            continue;
          }

          let description = movieInfo.description;
          let duration = movieInfo.duration;

          if (movieInfo.hasDetails) {
            await page.evaluate((movieName) => {
              const movieElements = Array.from(
                document.querySelectorAll("app-single-movie")
              );
              const movieElement = movieElements.find(
                (el) =>
                  el.querySelector("h3")?.textContent?.trim() === movieName
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

              const detailedInfo = await page.evaluate(() => {
                const description =
                  document.querySelector(".sinopse")?.textContent?.trim() || "";
                const duration =
                  document
                    .querySelector(".duration")
                    ?.textContent?.replace("Duração:", "")
                    .trim() || "";
                return { description, duration };
              });

              description = detailedInfo.description;
              duration = detailedInfo.duration;

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
                const trailerButton = document.querySelector(
                  "#ver-trailer"
                ) as HTMLElement;
                if (trailerButton) trailerButton.click();
              });

              trailerLink = await popupPromise;
              console.log(`Link do trailer para ${name}:`, trailerLink);

              await sleep(2000);
            } catch (error) {
              console.log(
                `Não foi possível carregar detalhes extras para ${name}`
              );
            }

            await page.goBack();
            await sleep(3000);
            await page.waitForSelector("app-single-movie", { timeout: 5000 });
            await sleep(2000);
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
        } catch (error) {
          console.error(`Erro ao processar o filme ${name}:`, error);
          continue;
        }
      }
    }

    const removedMovies = previousMovies.filter(
      (movie) => !currentMovieNames.has(movie.name)
    );

    if (removedMovies.length > 0) {
      console.log(
        "Filmes que saíram de cartaz:",
        removedMovies.map((m) => m.name)
      );
    }

    return { newMovies, removedMovies };
  } catch (error) {
    console.error("Erro ao fazer scraping do Balneário:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
