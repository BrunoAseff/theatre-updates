import { getGistData, updateGistData } from "../utils/gist";
import { scrapeItajai } from "../scrapers/itajai";
import { sendMovieUpdatesEmail } from "../utils/email";
import { GistContent, Movie } from "../types";

const ITAJAI_URL = "https://itajaishopping.com.br/cinema/";
const EMAIL_RECIPIENTS = ["brunoaseff2@gmail.com"];

async function thursday() {
  try {
    console.log("Iniciando atualização de quinta-feira...");

    const gistData = await getGistData();
    console.log("Dados do Gist obtidos com sucesso");

    const { newMovies, removedMovies } = await scrapeItajai(gistData);
    console.log(
      `Encontrados ${newMovies.length} novos filmes e ${removedMovies.length} filmes removidos`
    );

    const currentMovies: Movie[] = [
      ...gistData.itajai.movies
        .filter(
          (movie) =>
            !removedMovies.some((removed) => removed.name === movie.name)
        )
        .map((movie) => ({ ...movie, isNew: false })),
      ...newMovies.map((movie) => ({ ...movie, isNew: true })),
    ];

    const updatedGistData: GistContent = {
      ...gistData,
      itajai: {
        lastUpdated: new Date().toISOString(),
        movies: currentMovies,
      },
    };

    await updateGistData(updatedGistData);
    console.log("Gist atualizado com sucesso!");

    // Sempre envia o email com todos os filmes
    await sendMovieUpdatesEmail({
      theaterName: "Shopping Itajaí",
      movies: currentMovies,
      catalogUrl: ITAJAI_URL,
      to: EMAIL_RECIPIENTS,
    });
    console.log("Email enviado com sucesso!");

    console.log("Atualização concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a execução do script:", error);
    process.exit(1);
  }
}

thursday();
