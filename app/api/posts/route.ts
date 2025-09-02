import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/posts - Get all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany();
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts: " + error },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content: content || null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post: " + error },
      { status: 500 }
    );
  }
}

// DELETE /api/posts - Delete a specific post by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    await prisma.post.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: `Post ${id} deleted` });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete post: " + error },
      { status: 500 }
    );
  }
}
