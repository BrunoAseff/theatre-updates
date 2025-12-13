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
  Row,
  Column,
} from "@react-email/components";
import { Movie } from "../src/types";
import { Tailwind } from "@react-email/tailwind";

interface MovieUpdatesProps {
  theaterName: string;
  movies: Movie[];
  catalogUrl: string;
}

function truncateDescription(text: string, maxLength: number = 140): string {
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
      <Tailwind>
        <Head />
        <Body className="bg-[#171311] font-sans">
          <Container style={{ maxWidth: "600px" }}>
            <Heading className="text-white text-center mb-12 bg-[#AE1D29] py-6">
              <Text className="text-3xl font-bold mb-1 m-0">
                Filmes em Cartaz
              </Text>
              <Text className="text-sm font-light m-0 opacity-90">
                {theaterName}
              </Text>
            </Heading>

            {movies.map((movie) => (
              <Section
                key={movie.name}
                className="mb-8 border border-solid border-[#3E3632] rounded-2xl overflow-hidden bg-[#1e1a18]"
              >
                <Row>
                  {/* Left Column: Fixed Image Width */}
                  <Column width="180" className="w-[180px] align-top">
                    <Img
                      src={movie.coverImageUrl}
                      alt={`Poster do filme ${movie.name}`}
                      width="180"
                      height="280"
                      className="block object-cover rounded-tl-2xl rounded-bl-none"
                      style={{ objectFit: "cover" }}
                    />
                  </Column>

                  {/* Right Column: Content */}
                  <Column className="align-top h-[280px]">
                    {/* Inner table to force button to bottom */}
                    <table
                      style={{
                        height: "280px",
                        width: "100%",
                        borderCollapse: "collapse",
                      }}
                    >
                      <tbody>
                        <tr>
                          <td className="p-5 align-top">
                            <Text className="text-lg font-bold text-white m-0 mb-2 leading-tight">
                              {movie.name}
                            </Text>

                            <div className="mb-3">
                              {movie.isNew && (
                                <span className="text-xs bg-[#212A1F] text-[#1A9B46] px-2 py-0.5 rounded mr-1">
                                  Novidade
                                </span>
                              )}
                              <span className="text-xs bg-[#331D1C] text-[#C51D27] px-2 py-0.5 rounded mr-1">
                                {movie.genre}
                              </span>
                              <div className="text-[#AAA7A1] text-xs mt-2">
                                {movie.duration}
                              </div>
                            </div>

                            <Text className="text-[#AAA7A1] text-sm m-0 leading-relaxed">
                              {truncateDescription(movie.description)}
                            </Text>
                          </td>
                        </tr>

                        {/* Button Row: Aligned Bottom */}
                        <tr>
                          <td className="px-4 pb-4 align-bottom">
                            {movie.trailerLink && (
                              <Button
                                href={movie.trailerLink}
                                className="bg-[#C91D2B] text-white py-2.5 w-full text-center rounded-lg font-semibold text-sm block"
                              >
                                Ver Trailer
                              </Button>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Column>
                </Row>
              </Section>
            ))}

            <Section className="text-center mt-10 mb-10">
              <Button
                href={catalogUrl}
                className="bg-[#F5BE3D] text-black px-6 py-4 w-auto text-center rounded-2xl font-bold text-base no-underline inline-block"
              >
                Ver catálogo completo de filmes
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
