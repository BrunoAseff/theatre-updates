import { getGistData, updateGistData } from "../utils/gist";
import { scrapeBalneario } from "../scrapers/balneario";
import { sendMovieUpdatesEmail } from "../utils/email";
import { GistContent } from "../types";

const BALNEARIO_URL = "https://www.balneariocamboriushopping.com.br/cinema";
const EMAIL_RECIPIENTS = [
  "brunoaseff2@gmail.com",
  "Maiteduartealves@gmail.com",
  "alseff@hotmail.com",
];

async function wednesday() {
  try {
    console.log("Iniciando atualização de quarta-feira...");

    const gistData = await getGistData();
    console.log("Dados do Gist obtidos com sucesso");

    const { newMovies, removedMovies } = await scrapeBalneario(gistData);
    console.log(
      `Encontrados ${newMovies.length} novos filmes e ${removedMovies.length} filmes removidos`
    );

    const updatedGistData: GistContent = {
      ...gistData,
      balneario: {
        lastUpdated: new Date().toISOString(),
        movies: [
          ...gistData.balneario.movies.filter(
            (movie) =>
              !removedMovies.some((removed) => removed.name === movie.name)
          ),
          ...newMovies,
        ],
      },
    };

    await updateGistData(updatedGistData);
    console.log("Gist atualizado com sucesso!");

    if (newMovies.length > 0 || removedMovies.length > 0) {
      await sendMovieUpdatesEmail({
        theaterName: "Balneário Shopping",
        newMovies,
        removedMovies,
        catalogUrl: BALNEARIO_URL,
        to: EMAIL_RECIPIENTS,
      });
      console.log("Email enviado com sucesso!");
    } else {
      console.log("Nenhuma atualização para enviar por email.");
    }

    console.log("Atualização concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a execução do script:", error);
    process.exit(1);
  }
}

wednesday();
