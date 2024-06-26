import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

const key = "AIzaSyDE0uGUrC82Re61cC-ud-ihCPvY1LBHXQ0";
const genAI = new GoogleGenerativeAI(key);
const fileManager = new GoogleAIFileManager(key);

// function fileToGenerativePart(path, mimeType) {
//   return {
//     inlineData: {
//       data: Buffer.from(fs.readFileSync(path)).toString("base64"),
//       mimeType,
//     },
//   };
// }

const uploadVideoToAIBucket = async (fileName, path) => {
  const uploadResult = await fileManager.uploadFile(fileName, {
    mimeType: "video/mp4",
    displayName: path,
  });

  return uploadResult;
};

// Image AI
async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const videoPath = "./assets/input.mp4";

  const videoData = await fs.promises.readFile(videoPath, {
    encoding: "base64",
  });

  const fileData = await uploadVideoToAIBucket(videoPath, "Some random file");

  const result = await fileManager.getFile(fileData.file.name);

  console.log("This is the file data", result.uri.toString(), "\n");

  const aiRes = await model.generateContent([
    {
      fileData: {
        mimeType: result.mimeType,
        fileUri: result.uri,
      },
    },
    {
      text: `
    Rate this video as what it reflects? happiness, sadness, commotion etc. 
    The response should be in json format. The fields would be the different
    aspects this video is rated on. Ratings should be out of 10 and each rating 
    should containt a description field as on what basis the video have been 
    rated with the given value. Keep the temperatue high and use as much parameters
    as possible. Following is a dummy template you need to follow.
    {
    "happy": [
    "value": "1",
    "description": "The reason for 1"
    ],
    "sad": [
    "value": "10",
    "description": "The reason for 10"
    ]
    }
    `,
    },
  ]);

  console.log("Response from the AI:\n", aiRes.response.text());
}

const runVideo = async () => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent([
    ```
    Rate this video as what it reflects? happiness, sadness, commotion etc. 
    The response should be in json format. The fields would be the different
    aspects this video is rated on. Ratings should be out of 10 and each rating 
    should containt a description field as on what basis the video have been 
    rated with the given value. Keep the temperatue high and use as much parameters
    as possible. Following is a dummy template you need to follow.
    {
    "happy": [
    "value": "1",
    "description": "The reason for 1"
    ],
    "sad": [
    "value": "10",
    "description": "The reason for 10"
    ]
    }
    ```,

    {
      inlineData: {
        data: Buffer.from(fs.readFileSync("./assets/random.jpg")).toString(
          "base64"
        ),
        mimeType: "video/mp4",
      },
    },
  ]);
};

run();
