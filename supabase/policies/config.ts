export const policies = {
  users: [
    {
      name: 'Users can read their own data',
      operation: 'SELECT',
      expression: 'auth.uid() = id',
    },
    {
      name: 'Users can update their own data',
      operation: 'UPDATE',
      expression: 'auth.uid() = id',
    }
  ],
  students: [
    {
      name: 'Teachers can view all students',
      operation: 'SELECT',
      expression: `auth.jwt() ->> 'role' = 'TEACHER'`,
    },
    {
      name: 'Students can only view their own data',
      operation: 'SELECT',
      expression: 'auth.uid() = user_id',
    }
  ],
  homework: [
    {
      name: 'Teachers can create homework',
      operation: 'INSERT',
      expression: `auth.jwt() ->> 'role' = 'TEACHER'`,
    },
    {
      name: 'Students can view their homework',
      operation: 'SELECT',
      expression: 'auth.uid() = student_id',
    },
    {
      name: 'Teachers can view all homework',
      operation: 'SELECT',
      expression: `auth.jwt() ->> 'role' = 'TEACHER'`,
    }
  ],
  fees: [
    {
      name: 'Admin can manage fees',
      operation: 'ALL',
      expression: `auth.jwt() ->> 'role' = 'ADMIN'`,
    },
    {
      name: 'Students can view their fees',
      operation: 'SELECT',
      expression: 'auth.uid() = student_id',
    }
  ]
};
