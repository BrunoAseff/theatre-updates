import { getGistData, updateGistData } from "../utils/gist";
import { scrapeBalneario } from "../scrapers/balneario";
import { sendMovieUpdatesEmail } from "../utils/email";
import { GistContent, Movie } from "../types";

const BALNEARIO_URL = "https://www.balneariocamboriushopping.com.br/cinema";
const EMAIL_RECIPIENTS = process.env.EMAIL_RECIPIENTS?.split(",") || [];

async function wednesday() {
  try {
    console.log("Iniciando atualização de quarta-feira...");

    const gistData = await getGistData();
    console.log("Dados do Gist obtidos com sucesso");

    const { newMovies, removedMovies } = await scrapeBalneario(gistData);
    console.log(
      `Encontrados ${newMovies.length} novos filmes e ${removedMovies.length} filmes removidos`
    );

    const currentMovies: Movie[] = [
      ...gistData.balneario.movies
        .filter(
          (movie) =>
            !removedMovies.some((removed) => removed.name === movie.name)
        )
        .map((movie) => ({ ...movie, isNew: false })),
      ...newMovies.map((movie) => ({ ...movie, isNew: true })),
    ];

    const updatedGistData: GistContent = {
      ...gistData,
      balneario: {
        lastUpdated: new Date().toISOString(),
        movies: currentMovies,
      },
    };

    await updateGistData(updatedGistData);
    console.log("Gist atualizado com sucesso!");

    await sendMovieUpdatesEmail({
      theaterName: "Balneário Shopping",
      movies: currentMovies,
      catalogUrl: BALNEARIO_URL,
      to: EMAIL_RECIPIENTS,
    });
    console.log("Email enviado com sucesso!");

    console.log("Atualização concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a execução do script:", error);
    process.exit(1);
  }
}

wednesday();
