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
  Hr,
  Link,
} from "@react-email/components";
import { Movie } from "../src/types";
import { Tailwind } from "@react-email/tailwind";

interface MovieUpdatesProps {
  theaterName: string;
  newMovies: Movie[];
  removedMovies: Movie[];
  catalogUrl: string;
}

function truncateDescription(text: string, maxLength: number = 300): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export default function MovieUpdates({
  theaterName,
  newMovies,
  removedMovies,
  catalogUrl,
}: MovieUpdatesProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-10 px-4">
            <Heading className="text-2xl font-bold text-gray-800 text-center mb-10">
              Novos Filmes em Cartaz - {theaterName}
            </Heading>

            {newMovies.map((movie) => (
              <Section key={movie.name} className="mb-8">
                <div className="w-full">
                  {/* Layout Mobile: Imagem à esquerda, info à direita, descrição embaixo */}
                  <div className="flex flex-col md:hidden">
                    <div className="flex gap-4 mb-4">
                      <div className="w-[120px] flex-shrink-0">
                        <Img
                          src={movie.coverImageUrl}
                          alt={`Poster do filme ${movie.name}`}
                          width={120}
                          height={178}
                          className="rounded-lg object-cover w-full"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <Text className="text-lg font-bold text-gray-800 mb-2">
                            {movie.name}
                          </Text>
                          <Text className="text-sm text-gray-500 mb-2">
                            <span>{movie.genre}</span>
                            <span className="mx-2">•</span>
                            <span>{movie.duration}</span>
                          </Text>
                        </div>
                        {movie.trailerLink && (
                          <Button
                            href={movie.trailerLink}
                            className="bg-[#C20E4D] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#A00B3F] transition-colors w-fit"
                          >
                            Ver Trailer
                          </Button>
                        )}
                      </div>
                    </div>
                    <Text className="text-gray-600 text-sm leading-relaxed">
                      {truncateDescription(movie.description)}
                    </Text>
                  </div>

                  <div className="hidden md:flex gap-6">
                    <div className="w-[180px] flex-shrink-0">
                      <Img
                        src={movie.coverImageUrl}
                        alt={`Poster do filme ${movie.name}`}
                        width={180}
                        height={267}
                        className="rounded-lg object-cover w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <Text className="text-xl font-bold text-gray-800 mb-3">
                        {movie.name}
                      </Text>
                      <Text className="text-gray-600 mb-4 leading-relaxed">
                        {truncateDescription(movie.description)}
                      </Text>
                      <Text className="text-sm text-gray-500 mb-4">
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
                    </div>
                  </div>
                </div>
              </Section>
            ))}

            <Hr className="border-gray-200 my-10" />

            {removedMovies.length > 0 && (
              <Section className="mb-8">
                <Text className="text-base font-semibold text-gray-600 mb-2">
                  Filmes que saíram de cartaz:
                </Text>
                <Text className="text-sm text-gray-500 leading-relaxed">
                  {removedMovies.map((movie) => movie.name).join(", ")}
                </Text>
              </Section>
            )}

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
