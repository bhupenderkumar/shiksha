# Shikha 


![image](https://github.com/user-attachments/assets/e1f7e7e9-d09f-47f3-84cd-71fc0de16ccb)

![image](https://github.com/user-attachments/assets/1ff5e00f-4c9e-4be3-ae21-f22c67657fc4)


## Overview
This project is designed to learn about Supabase and integrate it with a React application. It includes a comprehensive set of features for managing attendance, classwork, homework, and more. The project aims to provide a robust and scalable solution for educational institutions to efficiently manage student-related data and activities.

## Project Responsibilities
The project is responsible for:
- Managing student attendance.
- Tracking classwork and homework assignments.
- Providing a dashboard for students and administrators.
- Integrating with Supabase for backend services and database management.

## Problem Solving
The project addresses the following problems:
- **Efficient Data Management**: Centralized management of student data, including attendance and assignments.
- **Scalability**: Designed to handle a growing number of students and classes.
- **User-Friendly Interface**: Intuitive and easy-to-use interface for both students and administrators.

## Features
- **Attendance Management**: Track and manage student attendance.
- **Classwork and Homework**: Assign, track, and manage classwork and homework.
- **Dashboard**: Provide a comprehensive dashboard for students and administrators.
- **User Authentication**: Secure user authentication and authorization.
- **Responsive Design**: Ensure the application is accessible on various devices.

## Database Structure

### Schema: `school`

#### Tables

1. **users (auth.users)**
   - `id`: UUID (Primary Key)
   - `email`: String (Unique)
   - `encrypted_password`: String
   - `role`: String
   - `created_at`: Timestamp
   - `updated_at`: Timestamp
   - Additional fields for user management and authentication.

2. **School**
   - `id`: Text (Primary Key)
   - `schoolName`: Text
   - `schoolAddress`: Text

3. **Class**
   - `id`: Text (Primary Key)
   - `name`: Text
   - `section`: Text
   - `roomNumber`: Text
   - `capacity`: Integer
   - `schoolId`: Text (Foreign Key referencing School)
   - `createdAt`: Timestamp
   - `updatedAt`: Timestamp

4. **Student**
   - `id`: Text (Primary Key)
   - `admissionNumber`: Text (Unique)
   - `name`: Text
   - `dateOfBirth`: Timestamp
   - `gender`: Text
   - `address`: Text
   - `contactNumber`: Text
   - `parentName`: Text
   - `parentContact`: Text
   - `parentEmail`: Text
   - `bloodGroup`: Text
   - `classId`: Text (Foreign Key referencing Class)
   - `createdAt`: Timestamp
   - `updatedAt`: Timestamp

5. **Staff**
   - `id`: Text (Primary Key)
   - `employeeId`: Text (Unique)
   - `name`: Text
   - `role`: Enum (StaffRole)
   - `qualification`: Text
   - `experience`: Integer
   - `email`: Text (Unique)
   - `contactNumber`: Text
   - `address`: Text
   - `joiningDate`: Timestamp
   - `schoolId`: Text (Foreign Key referencing School)
   - `createdAt`: Timestamp
   - `updatedAt`: Timestamp

6. **Classwork**
   - `id`: Text (Primary Key)
   - `title`: Text
   - `description`: Text
   - `date`: Timestamp
   - `classId`: Text (Foreign Key referencing Class)
   - `createdAt`: Timestamp
   - `updatedAt`: Timestamp

7. **Homework**
   - `id`: Text (Primary Key)
   - `title`: Text
   - `description`: Text
   - `dueDate`: Timestamp
   - `subjectId`: Text (Foreign Key referencing Subject)
   - `status`: Enum (HomeworkStatus)
   - `createdAt`: Timestamp
   - `updatedAt`: Timestamp
   - `classId`: Text (Foreign Key referencing Class)

8. **Attendance**
   - `id`: Text (Primary Key)
   - `date`: Timestamp
   - `status`: Enum (AttendanceStatus)
   - `studentId`: Text (Foreign Key referencing Student)
   - `createdAt`: Timestamp
   - `updatedAt`: Timestamp
   - `classId`: Text (Foreign Key referencing Class)

9. **Notification**
   - `id`: UUID (Primary Key)
   - `title`: Text
   - `message`: Text
   - `type`: Enum (NotificationType)
   - `studentId`: Text (Foreign Key referencing Student, optional)
   - `classId`: Text (Foreign Key referencing Class, optional)
   - `isRead`: Boolean
   - `createdAt`: Timestamp
   - `updatedAt`: Timestamp

10. **UserSettings**
    - `id`: Serial (Primary Key)
    - `user_id`: UUID (Foreign Key referencing auth.users)
    - `notifications`: JSONB
    - `theme`: JSONB
    - `security`: JSONB
    - `created_at`: Timestamp
    - `updated_at`: Timestamp

### Custom Types
- **StaffRole**: Enum for staff roles (TEACHER, ADMIN, PRINCIPAL, ACCOUNTANT).
- **HomeworkStatus**: Enum for homework status (PENDING, COMPLETED, OVERDUE, SUBMITTED).
- **FeeType**: Enum for fee types (TUITION, EXAMINATION, TRANSPORT, LIBRARY, LABORATORY, MISCELLANEOUS).
- **FeeStatus**: Enum for fee status (PENDING, PAID, OVERDUE, PARTIAL).
- **NotificationType**: Enum for notification types (HOMEWORK, ATTENDANCE, FEE, GENERAL).

## Getting Started

### Prerequisites
- Node.js and npm (Node Package Manager)
- Git

### Cloning the Repository
1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/bhupenderkumar/shiksha.git
   cd shiksha
   ```

### Installing Dependencies
1. Install the required dependencies using npm:
   ```bash
   npm install
   ```

### Setting Up Environment Variables
1. Create a `.env` file in the root directory and add your Supabase credentials:
   ```plaintext
   VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
   VITE_SUPABASE_KEY=your-supabase-key
   ```

### Running the Project
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000` to view the application.

## Codebase Structure
- **`src/`**: Contains the source code for the React application.
  - **`components/`**: Reusable React components used throughout the application.
  - **`constants/`**: Constants used across the application.
  - **`hooks/`**: Custom React hooks used for various functionalities.
  - **`lib/`**: Utility functions and libraries.
  - **`pages/`**: React components representing different pages of the application.
  - **`services/`**: Services for interacting with Supabase and other external APIs.
  - **`styles/`**: CSS and styling modules.
  - **`types/`**: TypeScript type definitions.
- **`scripts/`**: Utility scripts for database and Supabase operations.
- **`app/`**: Application configurations and APIs.

## Contributing
Contributions are welcome! Please follow the [contributing guidelines](CONTRIBUTING.md).

## License
This project is licensed under the [MIT License](LICENSE).
