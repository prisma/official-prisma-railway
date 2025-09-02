import { PrismaClient, Prisma } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

const posts: Prisma.PostCreateInput[] = [
  {
    title: "Post 1",
    content: "This is a post",
  },
  {
    title: "Post 2",
    content: "This is another post",
  },
  {
    title: "Post 3",
    content: "This is another post",
  },
  {
    title: "Post 4",
    content: "This is another post",
  },
];

export async function main() {
  for (const p of posts) {
    await prisma.post.create({ data: p });
  }
}

main();
