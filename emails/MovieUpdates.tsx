import { Body, Container, Head, Heading, Html, Section, Img, Text, Button, Link } from "@react-email/components";
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

export default function MovieUpdates({ theaterName, movies, catalogUrl }: MovieUpdatesProps) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Body className="bg-[#171311] font-sans">
          <Container style={{ maxWidth: "600px" }}>
            <Heading className="text-white text-center mb-12 bg-[#AE1D29] py-6">
              <Text className="text-3xl font-bold mb-1"> Filmes em Cartaz </Text>
              <Text className="text-sm font-light ">{theaterName}</Text>
            </Heading>

            {movies.map((movie) => (
              <Section key={movie.name} style={{ marginBottom: "32px" }}>
                <div
                  style={{
                    border: "1px #3E3632 solid",
                    borderRadius: "16px",
                    paddingBottom: "16px",
                    overflow: "hidden",
                  }}
                >
                  <Img
                    src={movie.coverImageUrl}
                    alt={`Poster do filme ${movie.name}`}
                    width="100%"
                    height="300"
                    style={{
                      borderRadius: "16px 16px 0 0",
                      marginBottom: "12px",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div className="px-6 py-2">
                    <Text
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "bold",
                        color: "white",
                        margin: 0,
                        marginBottom: "8px",
                        lineHeight: "1.4",
                      }}
                    >
                      {movie.name}
                    </Text>

                    <div style={{ marginBottom: "8px" }}>
                      {movie.isNew && (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            backgroundColor: "#212A1F",
                            color: "#1A9B46",
                            padding: "2px 8px",
                            borderRadius: "8px",
                            marginRight: "4px",
                          }}
                        >
                          Novidade
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "0.85rem",
                          backgroundColor: "#331D1C",
                          color: "#C51D27",
                          padding: "2px 8px",
                          borderRadius: "8px",
                          margin: "0 6px 6px 0",
                        }}
                      >
                        {movie.genre}
                      </span>
                      <div style={{ color: "#AAA7A1", fontSize: "0.75rem", marginTop: "12px" }}>{movie.duration}</div>
                    </div>

                    <Text
                      style={{
                        color: "#AAA7A1",
                        marginBottom: "16px",
                        lineHeight: "1.5",
                        fontSize: "0.875rem",
                      }}
                    >
                      {truncateDescription(movie.description, 300)}{" "}
                    </Text>

                    {movie.trailerLink && (
                      <Button
                        href={movie.trailerLink}
                        style={{
                          backgroundColor: "#C91D2B",
                          color: "white",
                          padding: "10px 16px",
                          width: "94%",
                          textAlign: "center",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "0.875rem",
                          textDecoration: "none",
                          display: "block",
                        }}
                      >
                        Ver Trailer
                      </Button>
                    )}
                  </div>
                </div>
              </Section>
            ))}

            <Section className="text-center mt-10 mb-10">
              <Button
                href={catalogUrl}
                style={{
                  backgroundColor: "#F5BE3D",
                  color: "black",
                  padding: "16px 22px",
                  width: "fit-content",
                  margin: "auto",
                  textAlign: "center",
                  borderRadius: "16px",
                  fontWeight: "600",
                  fontSize: "1rem",
                  textDecoration: "none",
                  display: "block",
                }}
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
