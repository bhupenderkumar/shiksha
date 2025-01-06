import { PrismaClient, StaffRole } from '@prisma/client';

const prisma = new PrismaClient();

export const supervisorService = {
  async getStaffByRole(role: StaffRole) {
    try {
      const staff = await prisma.staff.findMany({
        where: { role },
      });
      return staff;
    } catch (error) {
      console.error(`Error fetching staff with role ${role}:`, error);
      throw error;
    }
  },

  // Add other methods as needed (e.g., create, update, delete)
};
