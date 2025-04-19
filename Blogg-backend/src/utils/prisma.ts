import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';


let prismaInstance: ReturnType<typeof getPrismaInternal> | null = null;

const getPrismaInternal = (database_url: string) => {
  return new PrismaClient({
    datasourceUrl: database_url,
  }).$extends(withAccelerate());
};

export const getPrisma = (database_url: string): ReturnType<typeof getPrismaInternal> => {
  if (!prismaInstance) {
    prismaInstance = getPrismaInternal(database_url);
  }
  return prismaInstance;
};