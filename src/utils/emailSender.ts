// import { Resend } from "resend";
// import { Movie } from "../types";
// import { renderAsync } from "@react-email/components";
// import MovieUpdateEmail from "../emails/movieUpdate";
// import dotenv from "dotenv";

// dotenv.config();

// const RESEND_API_KEY = process.env.RESEND_API_KEY;

// if (!RESEND_API_KEY) {
//   throw new Error("Missing RESEND_API_KEY environment variable");
// }

// const resend = new Resend(RESEND_API_KEY);

// export async function sendMovieUpdateEmail(
//   theater: string,
//   newMovies: Movie[],
//   recipientEmail: string
// ): Promise<void> {
//   try {
//     const emailHtml = await renderAsync(
//       MovieUpdateEmail({
//         theater,
//         movies: newMovies,
//       })
//     );

//     await resend.emails.send({
//       from: "Theatre Updates <updates@yourdomain.com>",
//       to: recipientEmail,
//       subject: `New Movies at ${theater} Theater`,
//       html: emailHtml,
//     });

//     console.log(`Email sent successfully to ${recipientEmail}`);
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error;
//   }
// }
