// pages/api/upload.js

import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'nodejs',
};

export default async function upload(request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // Check for filename
  if (!filename) {
    return new NextResponse(JSON.stringify({ message: 'No filename provided' }), { status: 400 });
  }

  try {
    // The request.body is a stream of the file's contents
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    // Return the blob object, which includes the URL
    return NextResponse.json(blob);

  } catch (error) {
    console.error("Error uploading file:", error);
    return new NextResponse(JSON.stringify({ message: 'Error uploading file' }), { status: 500 });
  }
}