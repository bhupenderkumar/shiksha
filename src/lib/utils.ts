import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { User } from '@supabase/supabase-js';
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const prisma = new PrismaClient();
export const uploadFile = async (file: File, homeworkId: string, user: User): Promise<{id: string}> => {
  const fileName = `${uuidv4()}-${file.name}`;
  const filePath = path.join('./uploads', fileName); // Store files in the 'uploads' directory
  const fileType = file.type;
  try {
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads');
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    const newFile = await prisma.file.create({
      data: {
        id: uuidv4(),
        fileName,
        fileType,
        filePath,
        uploadedAt: new Date(),
        homeworkId,
        uploadedBy: user.id, // Use user.id
      },
    });

    return { id: newFile.id };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};
