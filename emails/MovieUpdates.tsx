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
            <Heading className="text-2xl font-bold text-[#09090b] text-center mb-10">
              Filmes em Cartaz - {theaterName}
            </Heading>

            {movies.map((movie) => (
              <Section key={movie.name} className="mb-8 ">
                <table className="w-full ">
                  <tbody className="w-full">
                    <tr className="">
                      <td className="w-[150px] align-top pr-6">
                        <Img
                          src={movie.coverImageUrl}
                          alt={`Poster do filme ${movie.name}`}
                          width={180}
                          height={267}
                          className="rounded-lg object-cover w-full"
                        />
                      </td>
                      <td className="align-top">
                        <table
                          cellPadding="0"
                          cellSpacing="0"
                          style={{ marginBottom: "8px" }}
                        >
                          <tr>
                            <td
                              style={{
                                fontSize: "1.25rem",
                                fontWeight: "bold",
                                color: "#09090b",
                                padding: 0,
                                paddingBottom: "4px",
                                lineHeight: "1.5",
                              }}
                            >
                              {movie.name}
                            </td>
                          </tr>
                          {movie.isNew && (
                            <tr>
                              <td style={{ padding: 0 }}>
                                <div className="text-xs bg-[#17C964] w-fit text-white px-2 m-0 py-0.5 rounded">
                                  Novidade
                                </div>
                              </td>
                            </tr>
                          )}
                        </table>
                        <Text className="text-[#52525b] mb-4 leading-relaxed">
                          {truncateDescription(movie.description)}
                        </Text>
                        <Text className="text-sm text-[#52525b] mb-4 flex items-center">
                          <span>{movie.genre}</span>
                          <span className="mx-2">•</span>
                          <span>{movie.duration}</span>
                        </Text>
                        {movie.trailerLink && (
                          <Button
                            href={movie.trailerLink}
                            className="bg-[#4338ca] text-white px-6 py-3 rounded-lg font-semibold text-base  transition-colors"
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
                className="text-sm text-[#4338ca] hover:underline transition-colors"
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
