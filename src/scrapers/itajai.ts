import puppeteer from "puppeteer";
import { Movie, GistContent } from "../types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeMovieName(fullName: string): string {
  // Remove dimensões (2D/3D) e DUB/LEG
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

export async function scrapeItajai(gistData: GistContent): Promise<{
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

    console.log("Acessando página do Shopping Itajaí...");
    await page.goto("https://itajaishopping.com.br/cinema/", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    const previousMovies = gistData.itajai.movies;
    const previousMovieNames = new Set(
      previousMovies.map((movie) => normalizeMovieName(movie.name))
    );
    const currentMovieNames = new Set<string>();
    const newMovies: Movie[] = [];

    console.log("Buscando cards de filmes...");

    // Pegar todos os links e informações básicas primeiro
    const moviesBasicInfo = await page.evaluate(() => {
      const movies = Array.from(
        document.querySelectorAll("article.card-cinema_wrapper")
      );
      return movies.map((movie) => {
        const link =
          movie.querySelector("a.card-cinema-large")?.getAttribute("href") ||
          "";
        const fullName =
          movie
            .querySelector(".card-cinema-large__title")
            ?.textContent?.trim() || "";
        const coverImageUrl =
          movie
            .querySelector(".card-cinema-large__poster")
            ?.getAttribute("src") || "";
        return { link, fullName, coverImageUrl };
      });
    });

    console.log(`Encontrados ${moviesBasicInfo.length} filmes.`);

    // Agrupar filmes por nome normalizado para evitar duplicatas
    const moviesByName = new Map<string, (typeof moviesBasicInfo)[0]>();

    for (const movieInfo of moviesBasicInfo) {
      const normalizedName = normalizeMovieName(movieInfo.fullName);
      // Se já temos uma versão deste filme, ignoramos as outras
      if (!moviesByName.has(normalizedName)) {
        moviesByName.set(normalizedName, movieInfo);
      }
    }

    console.log(`Após remover duplicatas: ${moviesByName.size} filmes únicos.`);

    // Processar apenas filmes únicos
    for (const [normalizedName, movieInfo] of moviesByName) {
      currentMovieNames.add(normalizedName);

      if (!previousMovieNames.has(normalizedName)) {
        console.log(`Encontrado novo filme: ${normalizedName}`);

        try {
          console.log(`Acessando detalhes de ${normalizedName}...`);
          await page.goto(movieInfo.link, {
            waitUntil: "networkidle2",
            timeout: 30000,
          });

          const details = await page.evaluate(() => {
            const metas = Array.from(document.querySelectorAll(".metas li"));
            const duration = metas[0]?.textContent?.trim() || "";
            const genre = metas[metas.length - 1]?.textContent?.trim() || "";
            const description =
              document.querySelector(".sinopse")?.textContent?.trim() || "";
            const trailerLink =
              document
                .querySelector(".lightbox-trigger")
                ?.getAttribute("href")
                ?.trim()
                .replace(/\s+/g, "") || "";
            const coverImageUrl =
              document
                .querySelector(".filme-imagem img")
                ?.getAttribute("src")
                ?.trim() || "";

            return {
              duration,
              genre,
              description,
              trailerLink,
              coverImageUrl,
            };
          });

          const movie: Movie = {
            name: normalizedName,
            coverImageUrl: details.coverImageUrl || movieInfo.coverImageUrl,
            description: details.description,
            duration: details.duration,
            genre: details.genre,
            trailerLink: details.trailerLink,
          };

          console.log("Informações coletadas:", {
            nome: movie.name,
            genero: movie.genre,
            duracao: movie.duration,
            trailer: movie.trailerLink,
            imagem: movie.coverImageUrl,
          });

          newMovies.push(movie);

          console.log("Voltando para a página principal...");
          await page.goto("https://itajaishopping.com.br/cinema/", {
            waitUntil: "networkidle2",
            timeout: 30000,
          });

          await sleep(2000);
        } catch (error) {
          console.error(`Erro ao processar o filme ${normalizedName}:`, error);
          continue;
        }
      }
    }

    const removedMovies = previousMovies.filter(
      (movie) => !currentMovieNames.has(normalizeMovieName(movie.name))
    );

    if (removedMovies.length > 0) {
      console.log(
        "Filmes que saíram de cartaz:",
        removedMovies.map((m) => m.name)
      );
    }

    return { newMovies, removedMovies };
  } catch (error) {
    console.error("Erro ao fazer scraping do Shopping Itajaí:", error);
    throw error;
  } finally {
    await browser.close();
  }
}
