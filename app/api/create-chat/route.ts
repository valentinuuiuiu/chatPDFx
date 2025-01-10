import { loadS3IntoPinecone } from "lib/pinecone";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { file_key } = body;

    if (!file_key) {
      return NextResponse.json(
        { error: "File key is required" },
        { status: 400 }
      );
    }

    await loadS3IntoPinecone(file_key);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in create-chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
