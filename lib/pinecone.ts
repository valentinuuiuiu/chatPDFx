import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { getPineconeClient } from "./pinecone";

export async function loadS3IntoPinecone(fileKey: string) {
  try {
    // Step 1: Download the PDF from S3
    const filePath = await downloadFromS3(fileKey);
    if (!filePath) {
      throw new Error("Failed to download file from S3");
    }

    // Step 2: Load the PDF and extract text
    const loader = new PDFLoader(filePath);
    const documents = await loader.load();

    // Step 3: Split the text into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await textSplitter.splitDocuments(documents);

    // Step 4: Generate embeddings using OpenAI
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
    });

    // Step 5: Store the embeddings in Pinecone
    const pinecone = await getPineconeClient();
    const pineconeIndex = pinecone.Index("your-index-name"); // Replace with your Pinecone index name
    await PineconeStore.fromDocuments(chunks, embeddings, {
      pineconeIndex,
      namespace: fileKey, // Use fileKey as the namespace
    });

    console.log("Successfully uploaded embeddings to Pinecone");
  } catch (error) {
    console.error("Error in loadS3IntoPinecone:", error);
    throw error;
  }
}
