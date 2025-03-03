import { Resend } from "resend";
import { Movie } from "../types";
import { render } from "@react-email/render";
import MovieUpdates from "../emails/MovieUpdates";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendMovieUpdatesEmailParams {
  theaterName: string;
  newMovies: Movie[];
  removedMovies: Movie[];
  catalogUrl: string;
  to: string[];
}

export async function sendMovieUpdatesEmail({
  theaterName,
  newMovies,
  removedMovies,
  catalogUrl,
  to,
}: SendMovieUpdatesEmailParams) {
  try {
    const html = render(
      MovieUpdates({
        theaterName,
        newMovies,
        removedMovies,
        catalogUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: "Atualizações do cinema <updates@brunoaseff.com.br>",
      to,
      subject: `Novos Filmes em Cartaz - ${theaterName}`,
      html: await html,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
