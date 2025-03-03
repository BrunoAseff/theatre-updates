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
import { Movie } from "../types";

interface MovieUpdatesProps {
  theaterName: string;
  newMovies: Movie[];
  removedMovies: Movie[];
  catalogUrl: string;
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
      <Body style={main}>
        <Container>
          <Heading as="h1" style={header}>
            Novos Filmes em Cartaz - {theaterName}
          </Heading>

          {newMovies.map((movie) => (
            <Section key={movie.name} style={movieSection}>
              <table style={tableStyle}>
                <tbody>
                  <tr>
                    <td style={imageTd}>
                      <Img
                        src={movie.coverImageUrl}
                        alt={`Poster do filme ${movie.name}`}
                        width={180}
                        height={267}
                        style={posterImage}
                      />
                    </td>
                    <td style={contentTd}>
                      <Text style={movieTitle}>{movie.name}</Text>
                      <Text style={movieDescription}>{movie.description}</Text>
                      <Text style={movieMetadata}>
                        <span>{movie.genre}</span>
                        <span style={{ margin: "0 8px" }}>•</span>
                        <span>{movie.duration}</span>
                      </Text>
                      {movie.trailerLink && (
                        <Button style={trailerButton} href={movie.trailerLink}>
                          Ver Trailer
                        </Button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>
          ))}

          <Hr style={divider} />

          {removedMovies.length > 0 && (
            <Section>
              <Text style={removedMoviesTitle}>
                Filmes que saíram de cartaz:
              </Text>
              <Text style={removedMoviesList}>
                {removedMovies.map((movie) => movie.name).join(", ")}
              </Text>
            </Section>
          )}

          <Section style={footer}>
            <Link href={catalogUrl} style={catalogLink}>
              Ver catálogo completo de filmes
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const header = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "40px 0",
};

const movieSection = {
  margin: "24px 0",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const imageTd = {
  width: "180px",
  verticalAlign: "top" as const,
  paddingRight: "24px",
};

const contentTd = {
  verticalAlign: "top" as const,
};

const posterImage = {
  borderRadius: "8px",
  objectFit: "cover" as const,
};

const movieTitle = {
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
  color: "#333",
};

const movieDescription = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#666",
  margin: "0 0 16px 0",
};

const movieMetadata = {
  fontSize: "14px",
  color: "#666",
  margin: "0 0 16px 0",
  display: "flex" as const,
  alignItems: "center" as const,
};

const trailerButton = {
  backgroundColor: "#C20E4D",
  color: "#fff",
  padding: "12px 24px",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "16px",
  fontWeight: "bold",
  border: "none",
};

const divider = {
  margin: "40px 0",
  borderTop: "1px solid #e6e6e6",
};

const removedMoviesTitle = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#666",
  margin: "0 0 8px 0",
};

const removedMoviesList = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
  lineHeight: "1.5",
};

const footer = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const catalogLink = {
  color: "#666",
  fontSize: "14px",
  textDecoration: "none",
};
