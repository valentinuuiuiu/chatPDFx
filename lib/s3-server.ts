import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import AWS from "aws-sdk"
import fs from "fs";
export async function downloadFromS3(file_key: string) {
    try {
        const s3Client = new S3Client({
            region: "eu-north-1",
            credentials: {
                accessKeyId: process.env.NEXT_PUBLIC_ACCES_KEY_ID!,
                secretAccessKey: process.env.NEXT_PUBLIC_SECRET_ACCES_KEY || '' // Provide a default value
            }
        });

        const params = {
            Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
            Key: file_key
        };

        const command = new GetObjectCommand(params);
        const response = await s3Client.send(command);
        const file_name = `/tmp/pdf-${Date.now()}.pdf`
        fs.writeFileSync(file_name, obj.Body as Buffer)
        
        if (response.Body) {
            // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
            const data = await response.Body.transformToString();
            return data;
        } else {
            console.error('Response body is undefined');
            return null;
        }

    } catch (error) {
        console.error(error);
        return null;
    }
}
