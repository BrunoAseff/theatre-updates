import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Img,
  Text,
  Button,
  Link,
} from "@react-email/components";
import { Movie } from "../src/types";
import { Tailwind } from "@react-email/tailwind";

interface MovieUpdatesProps {
  theaterName: string;
  movies: Movie[];
  catalogUrl: string;
}

function truncateDescription(text: string, maxLength: number = 300): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export default function MovieUpdates({
  theaterName,
  movies,
  catalogUrl,
}: MovieUpdatesProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-10 px-4">
            <Heading className="text-2xl font-bold text-gray-800 text-center mb-10">
              Filmes em Cartaz - {theaterName}
            </Heading>

            {movies.map((movie) => (
              <Section key={movie.name} className="mb-8">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-[180px] align-top pr-6">
                        <Img
                          src={movie.coverImageUrl}
                          alt={`Poster do filme ${movie.name}`}
                          width={180}
                          height={267}
                          className="rounded-lg object-cover w-full"
                        />
                      </td>
                      <td className="align-top">
                        <div className="flex items-center gap-2 mb-1">
                          <Text className="text-xl font-bold text-gray-800">
                            {movie.name}
                          </Text>
                          {movie.isNew && (
                            <Text className="text-xs bg-[#C20E4D] text-white px-2 py-0.5 rounded">
                              Novidade
                            </Text>
                          )}
                        </div>
                        <Text className="text-gray-600 mb-4 leading-relaxed">
                          {truncateDescription(movie.description)}
                        </Text>
                        <Text className="text-sm text-gray-500 mb-4 flex items-center">
                          <span>{movie.genre}</span>
                          <span className="mx-2">•</span>
                          <span>{movie.duration}</span>
                        </Text>
                        {movie.trailerLink && (
                          <Button
                            href={movie.trailerLink}
                            className="bg-[#C20E4D] text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-[#A00B3F] transition-colors"
                          >
                            Ver Trailer
                          </Button>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
            ))}

            <Section className="text-center mt-10">
              <Link
                href={catalogUrl}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Ver catálogo completo de filmes
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
