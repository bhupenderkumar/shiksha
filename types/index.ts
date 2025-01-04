import { Prisma } from '@prisma/client'

export type HomeworkWithRelations = Prisma.HomeworkGetPayload<{
  include: {
    student: true;
    teacher: true;
  }
}>;

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    user: true;
    homework: true;
    fees: true;
  }
}>;

export type TeacherWithRelations = Prisma.TeacherGetPayload<{
  include: {
    user: true;
    homework: true;
  }
}>;

export type FeeWithRelations = Prisma.FeeGetPayload<{
  include: {
    student: true;
  }
}>;
