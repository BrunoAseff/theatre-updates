import MovieUpdates from "./MovieUpdates";
import { Movie } from "../src/types";

const exampleMovies: Movie[] = [
  {
    name: "Duna: Parte 2",
    coverImageUrl:
      "https://www.balneariocamboriushopping.com.br/cinema/filmes/duna-parte-2/poster.jpg",
    description:
      "Duna: Parte 2 explorará a jornada mítica de Paul Atreides que se une a Chani e aos Fremen enquanto está em um caminho de vingança contra os conspiradores que destruíram sua família.",
    duration: "2h 46min",
    genre: "Ficção Científica",
    trailerLink: "https://www.youtube.com/watch?v=LwWUWwq7XAE",
    isNew: true,
  },
  {
    name: "Bob Marley: One Love",
    coverImageUrl:
      "https://www.balneariocamboriushopping.com.br/cinema/filmes/bob-marley-one-love/poster.jpg",
    description:
      "Bob Marley: One Love celebra a vida e a música de um ícone que inspirou gerações através de sua mensagem de amor e união.",
    duration: "1h 47min",
    genre: "Drama, Biografia",
    trailerLink: "https://www.youtube.com/watch?v=ajw425Kuvtw",
    isNew: true,
  },
  {
    name: "Pobres Criaturas",
    coverImageUrl:
      "https://www.balneariocamboriushopping.com.br/cinema/filmes/pobres-criaturas/poster.jpg",
    description:
      "A jovem Bella Baxter é trazida de volta à vida pelo brilhante e pouco ortodoxo cientista Dr. Godwin Baxter.",
    duration: "2h 21min",
    genre: "Drama, Romance",
    trailerLink: "https://www.youtube.com/watch?v=RlbR5N6veqw",
    isNew: false,
  },
];

export default function Preview() {
  return (
    <MovieUpdates
      theaterName="Balneário Shopping"
      movies={exampleMovies}
      catalogUrl="https://www.balneariocamboriushopping.com.br/cinema"
    />
  );
}
