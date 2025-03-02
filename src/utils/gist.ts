import { Octokit } from "@octokit/rest";
import { GistContent } from "../types";
import dotenv from "dotenv";

dotenv.config();

const GIST_ID = process.env.GIST_ID;
const GIST_TOKEN = process.env.GIST_TOKEN;

if (!GIST_ID || !GIST_TOKEN) {
  throw new Error("Missing GIST_ID or GIST_TOKEN environment variables");
}

const octokit = new Octokit({
  auth: GIST_TOKEN,
});

export async function getGistData(): Promise<GistContent> {
  try {
    const response = await octokit.gists.get({ gist_id: GIST_ID as string });
    const content = response.data.files!["theatre-updates.json"]?.content;

    if (!content) {
      return createEmptyGistContent();
    }

    return JSON.parse(content) as GistContent;
  } catch (error) {
    console.error("Error fetching Gist data:", error);
    return createEmptyGistContent();
  }
}

export async function updateGistData(data: GistContent): Promise<void> {
  try {
    await octokit.gists.update({
      gist_id: GIST_ID as string,
      files: {
        "theatre-updates.json": {
          content: JSON.stringify(data, null, 2),
        },
      },
    });
    console.log("Gist updated successfully");
  } catch (error) {
    console.error("Error updating Gist data:", error);
    throw error;
  }
}

function createEmptyGistContent(): GistContent {
  return {
    balneario: {
      lastUpdated: new Date().toISOString(),
      movies: [],
    },
    itajai: {
      lastUpdated: new Date().toISOString(),
      movies: [],
    },
  };
}
