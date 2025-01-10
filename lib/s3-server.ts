import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

export async function downloadFromS3(fileKey: string): Promise<string | null> {
  try {
    const s3Client = new S3Client({
      region: "eu-north-1",
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_ACCES_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_SECRET_ACCES_KEY!,
      },
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    const filePath = path.join("/tmp", `pdf-${Date.now()}.pdf`);
    const writeStream = fs.createWriteStream(filePath);

    if (response.Body) {
      response.Body.pipe(writeStream);
      await new Promise((resolve, reject) => {
        writeStream.on("finish", resolve);
        writeStream.on("error", reject);
      });
      return filePath;
    } else {
      console.error("Response body is undefined");
      return null;
    }
  } catch (error) {
    console.error("Error in downloadFromS3:", error);
    return null;
  }
}
