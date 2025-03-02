import puppeteer from "puppeteer";
import { Movie, TheaterData } from "../types";
import { getGistData, updateGistData } from "../utils/gistStorage";

export async function scrapeBalneario(): Promise<Movie[]> {
  const browser = await puppeteer.launch({
    headless: false, // Change to "new" for production
  });

  try {
    const page = (await browser.pages())[0];
    await page.goto("https://www.balneariocamboriushopping.com.br/cinema", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    const gistData = await getGistData();
    const previousMovies = gistData.balneario.movies;
    const previousMovieNames = new Set(
      previousMovies.map((movie: Movie) => movie.name)
    );

    const movieElements = await page.$$("app-single-movie");
    const movies: Movie[] = [];

    for (const movieElement of movieElements) {
      const name = await movieElement.$eval(
        "h3",
        (el) => el.textContent?.trim() || ""
      );
      const coverImageUrl = await movieElement.$eval(
        ".movie-poster-area img",
        (img) => img.getAttribute("src") || ""
      );
      const descriptionPreview = await movieElement.$eval(
        "p",
        (p) => p.textContent?.trim() || ""
      );
      const duration = await movieElement.$eval(
        ".movie-time li:nth-child(2)",
        (li) => li.textContent?.trim() || ""
      );

      const isNewMovie = !previousMovieNames.has(name);

      const movie: Movie = {
        name,
        coverImageUrl,
        description: descriptionPreview,
        duration,
        trailerLink: "",
      };

      // For new movies, click "Ver mais" to get more details
      if (isNewMovie) {
        console.log(`Found new movie: ${name}. Clicking 'Ver mais'...`);

        // Click the "Ver mais" button for this movie
        await movieElement.$eval(".read-more", (verMais) =>
          (verMais as HTMLElement).click()
        );

        // You'll need to add code here to extract trailer link
        // from the detailed view after clicking "Ver mais"

        // Add proper navigation back to the movie list if needed
      }

      movies.push(movie);
    }

    return movies;
  } catch (error) {
    console.error("Error scraping Balneário:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

scrapeBalneario();
