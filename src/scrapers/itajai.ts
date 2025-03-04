import puppeteer, { Page } from "puppeteer";
import { Movie, GistContent } from "../types";
import { log, sleep, PUPPETEER_CONFIG, setupPage } from "../utils/utils";

const ITAJAI_URL = "https://itajaishopping.com.br/cinema/";

function normalizeMovieName(fullName: string): string {
  const parts = fullName.split("–").map((part) => part.trim());
  return parts
    .filter(
      (part) =>
        !part.includes("2D") &&
        !part.includes("3D") &&
        !part.includes("DUB") &&
        !part.includes("LEG")
    )
    .join(" ")
    .trim();
}

interface MovieBasicInfo {
  link: string;
  fullName: string;
  coverImageUrl: string;
}

async function getBasicMovieInfo(page: Page): Promise<MovieBasicInfo[]> {
  log("Buscando cards de filmes...");
  return page.evaluate(() => {
    const movies = Array.from(
      document.querySelectorAll("article.card-cinema_wrapper")
    );
    return movies.map((movie) => ({
      link:
        movie.querySelector("a.card-cinema-large")?.getAttribute("href") || "",
      fullName:
        movie.querySelector(".card-cinema-large__title")?.textContent?.trim() ||
        "",
      coverImageUrl:
        movie
          .querySelector(".card-cinema-large__poster")
          ?.getAttribute("src") || "",
    }));
  });
}

async function getMovieDetails(page: Page, movieInfo: MovieBasicInfo) {
  await page.goto(movieInfo.link, {
    waitUntil: "networkidle2",
    timeout: 30000,
  });

  const details = await page.evaluate(() => {
    const metas = Array.from(document.querySelectorAll(".metas li"));
    return {
      duration: metas[0]?.textContent?.trim() || "",
      genre: metas[metas.length - 1]?.textContent?.trim() || "",
      description:
        document.querySelector(".sinopse")?.textContent?.trim() || "",
      trailerLink:
        document
          .querySelector(".lightbox-trigger")
          ?.getAttribute("href")
          ?.trim()
          .replace(/\s+/g, "") || "",
      coverImageUrl:
        document
          .querySelector(".filme-imagem img")
          ?.getAttribute("src")
          ?.trim() || "",
    };
  });

  return details;
}

export async function scrapeItajai(gistData: GistContent): Promise<{
  newMovies: Movie[];
  removedMovies: Movie[];
}> {
  const browser = await puppeteer.launch(PUPPETEER_CONFIG);

  try {
    const page = await setupPage(browser, ITAJAI_URL);

    const previousMovies = gistData.itajai.movies;
    const previousMovieNames = new Set(
      previousMovies.map((movie) => normalizeMovieName(movie.name))
    );
    const currentMovieNames = new Set<string>();
    const newMovies: Movie[] = [];

    const moviesBasicInfo = await getBasicMovieInfo(page);
    log(`Encontrados ${moviesBasicInfo.length} filmes no total.`);

    // Agrupar filmes por nome normalizado para evitar duplicatas
    const moviesByName = new Map<string, MovieBasicInfo>();
    for (const movieInfo of moviesBasicInfo) {
      const normalizedName = normalizeMovieName(movieInfo.fullName);
      if (!moviesByName.has(normalizedName)) {
        moviesByName.set(normalizedName, movieInfo);
      }
    }

    log(`${moviesByName.size} filmes únicos após remover duplicatas.`);

    for (const [normalizedName, movieInfo] of moviesByName) {
      currentMovieNames.add(normalizedName);

      if (!previousMovieNames.has(normalizedName)) {
        log(`Processando novo filme: ${normalizedName}`);

        try {
          const details = await getMovieDetails(page, movieInfo);

          const movie: Movie = {
            name: normalizedName,
            coverImageUrl: details.coverImageUrl || movieInfo.coverImageUrl,
            description: details.description,
            duration: details.duration,
            genre: details.genre,
            trailerLink: details.trailerLink,
          };

          log(`Detalhes coletados para ${normalizedName}:`, "success");
          log(`- Gênero: ${movie.genre}`);
          log(`- Duração: ${movie.duration}`);
          if (movie.trailerLink) {
            log(`- Trailer encontrado`, "success");
          }

          newMovies.push(movie);

          log("Voltando para a página principal...");
          await page.goto(ITAJAI_URL, {
            waitUntil: "networkidle2",
            timeout: 30000,
          });

          await sleep(2000);
        } catch (error) {
          log(`Erro ao processar o filme ${normalizedName}: ${error}`, "error");
          continue;
        }
      }
    }

    const removedMovies = previousMovies.filter(
      (movie) => !currentMovieNames.has(normalizeMovieName(movie.name))
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
    log(`Erro ao fazer scraping do Shopping Itajaí: ${error}`, "error");
    throw error;
  } finally {
    await browser.close();
  }
}
