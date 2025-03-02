import { getGistData, updateGistData } from "../utils/gist";
import { scrapeBalneario } from "../scrapers/balneario";
import { GistContent } from "../types";

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

    // Salvar alterações no Gist
    await updateGistData(updatedGistData);
    console.log("Atualização concluída com sucesso!");
  } catch (error) {
    console.error("Erro durante a execução do script:", error);
    process.exit(1);
  }
}

wednesday();
