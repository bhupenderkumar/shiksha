PGDMP        	    4         	         }             postgres     15.8     17.1      ð             0     0     ENCODING     ENCODING          SET client_encoding = 'UTF8';
                                        false               ñ             0     0 
   STDSTRINGS 
   STDSTRINGS      (   SET standard_conforming_strings = 'on';
                                        false               ò             0     0 
   SEARCHPATH 
   SEARCHPATH      8   SELECT pg_catalog.set_config('search_path', '', false);
                                        false               ó             1262     5     postgres     DATABASE      t   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.UTF-8';
     DROP DATABASE postgres;
                              postgres     false               ô             0     0     DATABASE postgres     COMMENT      N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                                   postgres     false     4083               õ             0     0     DATABASE postgres     ACL      2   GRANT ALL ON DATABASE postgres TO dashboard_user;
                                   postgres     false     4083               ö             0     0     postgres     DATABASE PROPERTIES      >   ALTER DATABASE postgres SET "app.settings.jwt_exp" TO '3600';
                                   postgres     false                             2615     30417     school     SCHEMA          CREATE SCHEMA school;
     DROP SCHEMA school;
                              postgres     false               ÷             0     0 
   SCHEMA school     ACL      U   GRANT USAGE ON SCHEMA school TO authenticated;
GRANT USAGE ON SCHEMA school TO anon;
                                   postgres     false     27               ]             1247     30486     AttendanceStatus     TYPE      k   CREATE TYPE school."AttendanceStatus" AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE',
    'HALF_DAY'
);
 %   DROP TYPE school."AttendanceStatus";
          school                    postgres     false     27               T             1247     30452 	   FeeStatus     TYPE      d   CREATE TYPE school."FeeStatus" AS ENUM (
    'PENDING',
    'PAID',
    'OVERDUE',
    'PARTIAL'
);
     DROP TYPE school."FeeStatus";
          school                    postgres     false     27               Q             1247     30438     FeeType     TYPE      ’   CREATE TYPE school."FeeType" AS ENUM (
    'TUITION',
    'EXAMINATION',
    'TRANSPORT',
    'LIBRARY',
    'LABORATORY',
    'MISCELLANEOUS'
);
     DROP TYPE school."FeeType";
          school                    postgres     false     27               Z             1247     30476     GrievanceStatus     TYPE      n   CREATE TYPE school."GrievanceStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);
 $   DROP TYPE school."GrievanceStatus";
          school                    postgres     false     27               N             1247     30428     HomeworkStatus     TYPE      j   CREATE TYPE school."HomeworkStatus" AS ENUM (
    'PENDING',
    'SUBMITTED',
    'GRADED',
    'LATE'
);
 #   DROP TYPE school."HomeworkStatus";
          school                    postgres     false     27               W             1247     30462     NotificationType     TYPE      ‹   CREATE TYPE school."NotificationType" AS ENUM (
    'HOMEWORK',
    'ATTENDANCE',
    'FEE',
    'GENERAL',
    'EXAM',
    'EMERGENCY'
);
 %   DROP TYPE school."NotificationType";
          school                    postgres     false     27               K             1247     30419 	   StaffRole     TYPE      j   CREATE TYPE school."StaffRole" AS ENUM (
    'TEACHER',
    'ADMIN',
    'PRINCIPAL',
    'ACCOUNTANT'
);
     DROP TYPE school."StaffRole";
          school                    postgres     false     27               F             1259     30572 
   Attendance     TABLE      ?   CREATE TABLE school."Attendance" (
    id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    status school."AttendanceStatus" NOT NULL,
    "studentId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    classid text
);
     DROP TABLE school."Attendance";
          school          heap r        postgres     false     1373     27               ø             0     0     TABLE "Attendance"     ACL      „   GRANT SELECT ON TABLE school."Attendance" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Attendance" TO authenticated;
               school                    postgres     false     326               =             1259     30509     Class     TABLE      /   CREATE TABLE school."Class" (
    id text NOT NULL,
    name text NOT NULL,
    section text NOT NULL,
    "roomNumber" text,
    capacity integer NOT NULL,
    "schoolId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
     DROP TABLE school."Class";
          school          heap r        postgres     false     27               ù             0     0 
   TABLE "Class"     ACL      z   GRANT SELECT ON TABLE school."Class" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Class" TO authenticated;
               school                    postgres     false     317               B             1259     30544 	   Classwork     TABLE      3   CREATE TABLE school."Classwork" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "classId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
     DROP TABLE school."Classwork";
          school          heap r        postgres     false     27               ú             0     0     TABLE "Classwork"     ACL      P   GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Classwork" TO authenticated;
               school                    postgres     false     322               C             1259     30551     Fee     TABLE      Ù   CREATE TABLE school."Fee" (
    id text NOT NULL,
    "studentId" text NOT NULL,
    amount double precision NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "feeType" school."FeeType" NOT NULL,
    status school."FeeStatus" NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "paymentMethod" text,
    "receiptNumber" text,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
     DROP TABLE school."Fee";
          school          heap r        postgres     false     1364     1361     27               û             0     0 
   TABLE "Fee"     ACL      v   GRANT SELECT ON TABLE school."Fee" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Fee" TO authenticated;
               school                    postgres     false     323               H             1259     30586     File     TABLE      x   CREATE TABLE school."File" (
    id text NOT NULL,
    "fileName" text NOT NULL,
    "fileType" text NOT NULL,
    "filePath" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone NOT NULL,
    "schoolId" text,
    "homeworkId" text,
    "classworkId" text, -- Ensure this column exists
    "feeId" text,
    "grievanceId" text,
    "uploadedBy" uuid NOT NULL,
    "homeworkSubmissionId" text
);
     DROP TABLE school."File";
          school          heap r        postgres     false     27               ü             0     0 
   TABLE "File"     ACL      x   GRANT SELECT ON TABLE school."File" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."File" TO authenticated;
               school                    postgres     false     328               E             1259     30565 	   Grievance     TABLE      F   CREATE TABLE school."Grievance" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "studentId" text NOT NULL,
    status school."GrievanceStatus" NOT NULL,
    resolution text,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
     DROP TABLE school."Grievance";
          school          heap r        postgres     false     1370     27               A             1259     30537     Homework     TABLE      z   CREATE TABLE school."Homework" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "subjectId" text NOT NULL,
    status school."HomeworkStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "classId" text
);
     DROP TABLE school."Homework";
          school          heap r        postgres     false     1358     27               ý             0     0     TABLE "Homework"     ACL      €   GRANT SELECT ON TABLE school."Homework" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Homework" TO authenticated;
               school                    postgres     false     321               K             1259     36317     HomeworkSubmission     TABLE      ê   CREATE TABLE school."HomeworkSubmission" (
    id text NOT NULL,
    "homeworkId" text NOT NULL,
    "studentId" text NOT NULL,
    status school."HomeworkStatus" NOT NULL,
    "submittedAt" timestamp(3) without time zone NOT NULL
);
 (   DROP TABLE school."HomeworkSubmission";
          school          heap r        postgres     false     27     1358               ;             1259     30495     New     TABLE      4   CREATE TABLE school."New" (
    id text NOT NULL
);
     DROP TABLE school."New";
          school          heap r        postgres     false     27               D             1259     30558 
   Notification     TABLE      N   CREATE TABLE school."Notification" (
    id text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type school."NotificationType" NOT NULL,
    "studentId" text NOT NULL,
    "isRead" boolean NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
 "   DROP TABLE school."Notification";
          school          heap r        postgres     false     1367     27               J             1259     33037     Profile     TABLE      ”   CREATE TABLE school."Profile" (
    id text NOT NULL,
    user_id text NOT NULL,
    role text NOT NULL,
    full_name text,
    avatar_url text
);
     DROP TABLE school."Profile";
          school          heap r        postgres     false     27               þ             0     0     TABLE "Profile"     ACL      w   GRANT SELECT,INSERT,UPDATE ON TABLE school."Profile" TO authenticated;
GRANT SELECT ON TABLE school."Profile" TO anon;
               school                    postgres     false     330               ÿ             0     0     COLUMN "Profile".id     ACL      q   GRANT SELECT(id) ON TABLE school."Profile" TO anon;
GRANT INSERT(id) ON TABLE school."Profile" TO authenticated;
               school                    postgres     false     330     4094                             0     0     COLUMN "Profile".user_id     ACL      {   GRANT SELECT(user_id) ON TABLE school."Profile" TO anon;
GRANT INSERT(user_id) ON TABLE school."Profile" TO authenticated;
               school                    postgres     false     330     4094                             0     0     COLUMN "Profile".role     ACL      ‚   GRANT SELECT(role) ON TABLE school."Profile" TO anon;
GRANT INSERT(role),UPDATE(role) ON TABLE school."Profile" TO authenticated;
               school                    postgres     false     330     4094                             0     0     COLUMN "Profile".full_name     ACL      ‘   GRANT SELECT(full_name) ON TABLE school."Profile" TO anon;
GRANT INSERT(full_name),UPDATE(full_name) ON TABLE school."Profile" TO authenticated;
               school                    postgres     false     330     4094                             0     0     COLUMN "Profile".avatar_url     ACL      ”   GRANT SELECT(avatar_url) ON TABLE school."Profile" TO anon;
GRANT INSERT(avatar_url),UPDATE(avatar_url) ON TABLE school."Profile" TO authenticated;
               school                    postgres     false     330     4094               <             1259     30502     School     TABLE      z   CREATE TABLE school."School" (
    id text NOT NULL,
    "schoolName" text NOT NULL,
    "schoolAddress" text NOT NULL
);
     DROP TABLE school."School";
          school          heap r        postgres     false     27                             0     0     TABLE "School"     ACL      |   GRANT SELECT ON TABLE school."School" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."School" TO authenticated;
               school                    postgres     false     316               ?             1259     30523     Staff     TABLE      ø   CREATE TABLE school."Staff" (
    id text NOT NULL,
    "employeeId" text NOT NULL,
    name text NOT NULL,
    role school."StaffRole" NOT NULL,
    qualification text NOT NULL,
    experience integer NOT NULL,
    email text NOT NULL,
    "contactNumber" text NOT NULL,
    address text NOT NULL,
    "joiningDate" timestamp(3) without time zone NOT NULL,
    "schoolId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
     DROP TABLE school."Staff";
          school          heap r        postgres     false     27     1355                             0     0 
   TABLE "Staff"     ACL      z   GRANT SELECT ON TABLE school."Staff" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Staff" TO authenticated;
               school                    postgres     false     319               >             1259     30516     Student     TABLE          CREATE TABLE school."Student" (
    id text NOT NULL,
    "admissionNumber" text NOT NULL,
    name text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL,
    gender text NOT NULL,
    address text NOT NULL,
    "contactNumber" text NOT NULL,
    "parentName" text NOT NULL,
    "parentContact" text NOT NULL,
    "parentEmail" text NOT NULL,
    "bloodGroup" text,
    "classId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
     DROP TABLE school."Student";
          school          heap r        postgres     false     27                             0     0     TABLE "Student"     ACL      ~   GRANT SELECT ON TABLE school."Student" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Student" TO authenticated;
               school                    postgres     false     318               @             1259     30530     Subject     TABLE          CREATE TABLE school."Subject" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "classId" text NOT NULL,
    "teacherId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
     DROP TABLE school."Subject";
          school          heap r        postgres     false     27                             0     0     TABLE "Subject"     ACL      ~   GRANT SELECT ON TABLE school."Subject" TO anon;
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school."Subject" TO authenticated;
               school                    postgres     false     320               G             1259     30579 	   TimeTable     TABLE      r   CREATE TABLE school."TimeTable" (
    id text NOT NULL,
    day integer NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "classId" text NOT NULL,
    "subjectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);
     DROP TABLE school."TimeTable";
          school          heap r        postgres     false     27               M             1259     37837     feedback     TABLE      ƒ   CREATE TABLE school.feedback (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    note text,
    status character varying(20) DEFAULT 'RAISED'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
     DROP TABLE school.feedback;
          school          heap r        postgres     false     27                             0     0     TABLE feedback     ACL      U   GRANT SELECT,INSERT,DELETE,TRIGGER,UPDATE ON TABLE school.feedback TO authenticated;
               school                    postgres     false     333               L             1259     37836     feedback_id_seq     SEQUENCE      ‡   CREATE SEQUENCE school.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE school.feedback_id_seq;
          school                    postgres     false     333     27               	             0     0     feedback_id_seq     SEQUENCE OWNED BY      C   ALTER SEQUENCE school.feedback_id_seq OWNED BY school.feedback.id;
               school                    postgres     false     332               O             1259     37854     feedback_replies     TABLE      Û   CREATE TABLE school.feedback_replies (
    id integer NOT NULL,
    feedback_id integer NOT NULL,
    user_id uuid NOT NULL,
    reply text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
 $   DROP TABLE school.feedback_replies;
          school          heap r        postgres     false     27               
             0     0     TABLE feedback_replies     ACL      U   GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE school.feedback_replies TO authenticated;
               school                    postgres     false     335               N             1259     37853     feedback_replies_id_seq     SEQUENCE          CREATE SEQUENCE school.feedback_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE school.feedback_replies_id_seq;
          school                    postgres     false     335     27               
             0     0     feedback_replies_id_seq     SEQUENCE OWNED BY      S   ALTER SEQUENCE school.feedback_replies_id_seq OWNED BY school.feedback_replies.id;
               school                    postgres     false     334               I             1259     30593     users     TABLE      D   CREATE TABLE school.users (
    id uuid NOT NULL,
    phone text
);
     DROP TABLE school.users;
          school          heap r        postgres     false     27               ê             2604     37840 
   feedback id     DEFAULT      j   ALTER TABLE ONLY school.feedback ALTER COLUMN id SET DEFAULT nextval('school.feedback_id_seq'::regclass);
 :   ALTER TABLE school.feedback ALTER COLUMN id DROP DEFAULT;
          school                    postgres     false     333     332     333               î             2604     37857     feedback_replies id     DEFAULT      z   ALTER TABLE ONLY school.feedback_replies ALTER COLUMN id SET DEFAULT nextval('school.feedback_replies_id_seq'::regclass);
 B   ALTER TABLE school.feedback_replies ALTER COLUMN id DROP DEFAULT;
          school                    postgres     false     334     335     335               ä             0     30572 
   Attendance 
   TABLE DATA                h   COPY school."Attendance" (id, date, status, "studentId", "createdAt", "updatedAt", classid) FROM stdin;
     school                    postgres     false     326      …º       Û             0     30509     Class 
   TABLE DATA                r   COPY school."Class" (id, name, section, "roomNumber", capacity, "schoolId", "createdAt", "updatedAt") FROM stdin;
     school                    postgres     false     317      î»       à             0     30544 	   Classwork 
   TABLE DATA                h   COPY school."Classwork" (id, title, description, date, "classId", "createdAt", "updatedAt") FROM stdin;
     school                    postgres     false     322       ¼       á             0     30551     Fee 
   TABLE DATA                ¡   COPY school."Fee" (id, "studentId", amount, "dueDate", "feeType", status, "paymentDate", "paymentMethod", "receiptNumber", "createdAt", "updatedAt") FROM stdin;
     school                    postgres     false     323      {¾       æ             0     30586     File 
   TABLE DATA                ½   COPY school."File" (id, "fileName", "fileType", "filePath", "uploadedAt", "schoolId", "homeworkId", "classworkId", "feeId", "grievanceId", "uploadedBy", "homeworkSubmissionId") FROM stdin;
     school                    postgres     false     328      ˜¾       ã             0     30565 	   Grievance 
   TABLE DATA                x   COPY school."Grievance" (id, title, description, "studentId", status, resolution, "createdAt", "updatedAt") FROM stdin;
     school                    postgres     false     325       Å       ß             0     30537     Homework 
   TABLE DATA                    COPY school."Homework" (id, title, description, "dueDate", "subjectId", status, "createdAt", "updatedAt", "classId") FROM stdin;
     school                    postgres     false     321      8Å       é             0     36317     HomeworkSubmission 
   TABLE DATA                d   COPY school."HomeworkSubmission" (id, "homeworkId", "studentId", status, "submittedAt") FROM stdin;
     school                    postgres     false     331      ×Å       Ù             0     30495     New 
   TABLE DATA                #   COPY school."New" (id) FROM stdin;
     school                    postgres     false     315      ôÅ       â             0     30558 
   Notification 
   TABLE DATA                s   COPY school."Notification" (id, title, message, type, "studentId", "isRead", "createdAt", "updatedAt") FROM stdin;
     school                    postgres     false     324       Æ       è             0     33037     Profile 
   TABLE DATA                M   COPY school."Profile" (id, user_id, role, full_name, avatar_url) FROM stdin;
     school                    postgres     false     330      .Æ       Ú             0     30502     School 
   TABLE DATA                E   COPY school."School" (id, "schoolName", "schoolAddress") FROM stdin;
     school                    postgres     false     316      ÄÆ       Ý             0     30523     Staff 
   TABLE DATA                °   COPY school."Staff" (id, "employeeId", name, role, qualification, experience, email, "contactNumber", address, "joiningDate", "schoolId", "createdAt", "updatedAt") FROM stdin;
     school                    postgres     false     319       Ç       Ü             0     30516     Student 
   TABLE DATA                Ò   COPY school."Student" (id, "admissionNumber", name, "dateOfBirth", gender, address, "contactNumber", "parentName", "parentContact", "parentEmail", "bloodGroup", "classId", "createdAt", "updatedAt") FROM stdin;
     school                    postgres     false     318      ÕÇ       Þ             0     30530     Subject 
   TABLE DATA                e   COPY school."Subject" (id, name, code, "classId", "teacherId", "createdAt", "updatedAt") FROM stdin;
     school                    postgres     false     320      ]È       å             0     30579 	   TimeTable 
   TABLE DATA                x   COPY school."TimeTable" (id, day, "startTime", "endTime", "classId", "subjectId", "createdAt", "updatedAt") FROM stdin;
     school                    postgres     false     327      ¬É       ë             0     37837     feedback 
   TABLE DATA                i   COPY school.feedback (id, user_id, title, description, note, status, created_at, updated_at) FROM stdin;
     school                    postgres     false     333      ÉÉ       í             0     37854     feedback_replies 
   TABLE DATA                W   COPY school.feedback_replies (id, feedback_id, user_id, reply, created_at) FROM stdin;
     school                    postgres     false     335      æÉ       ç             0     30593     users 
   TABLE DATA                *   COPY school.users (id, phone) FROM stdin;
     school                    postgres     false     329       Ê       
             0     0     feedback_id_seq 
   SEQUENCE SET      >   SELECT pg_catalog.setval('school.feedback_id_seq', 1, false);
               school                    postgres     false     332               
             0     0     feedback_replies_id_seq 
   SEQUENCE SET      F   SELECT pg_catalog.setval('school.feedback_replies_id_seq', 1, false);
               school                    postgres     false     334               
             2606     30578     Attendance Attendance_pkey 
   CONSTRAINT      \   ALTER TABLE ONLY school."Attendance"
    ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY (id);
 H   ALTER TABLE ONLY school."Attendance" DROP CONSTRAINT "Attendance_pkey";
          school                    postgres     false     326               ö             2606     30515     Class Class_pkey 
   CONSTRAINT      R   ALTER TABLE ONLY school."Class"
    ADD CONSTRAINT "Class_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY school."Class" DROP CONSTRAINT "Class_pkey";
          school                    postgres     false     317                             2606     30550     Classwork Classwork_pkey 
   CONSTRAINT      Z   ALTER TABLE ONLY school."Classwork"
    ADD CONSTRAINT "Classwork_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY school."Classwork" DROP CONSTRAINT "Classwork_pkey";
          school                    postgres     false     322                             2606     30557 
   Fee Fee_pkey 
   CONSTRAINT      N   ALTER TABLE ONLY school."Fee"
    ADD CONSTRAINT "Fee_pkey" PRIMARY KEY (id);
 :   ALTER TABLE ONLY school."Fee" DROP CONSTRAINT "Fee_pkey";
          school                    postgres     false     323                             2606     30592     File File_pkey 
   CONSTRAINT      P   ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_pkey" PRIMARY KEY (id);
 <   ALTER TABLE ONLY school."File" DROP CONSTRAINT "File_pkey";
          school                    postgres     false     328               
             2606     30571     Grievance Grievance_pkey 
   CONSTRAINT      Z   ALTER TABLE ONLY school."Grievance"
    ADD CONSTRAINT "Grievance_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY school."Grievance" DROP CONSTRAINT "Grievance_pkey";
          school                    postgres     false     325                             2606     36323 *   HomeworkSubmission HomeworkSubmission_pkey 
   CONSTRAINT      l   ALTER TABLE ONLY school."HomeworkSubmission"
    ADD CONSTRAINT "HomeworkSubmission_pkey" PRIMARY KEY (id);
 X   ALTER TABLE ONLY school."HomeworkSubmission" DROP CONSTRAINT "HomeworkSubmission_pkey";
          school                    postgres     false     331                             2606     30543     Homework Homework_pkey 
   CONSTRAINT      X   ALTER TABLE ONLY school."Homework"
    ADD CONSTRAINT "Homework_pkey" PRIMARY KEY (id);
 D   ALTER TABLE ONLY school."Homework" DROP CONSTRAINT "Homework_pkey";
          school                    postgres     false     321               ò             2606     30501 
   New New_pkey 
   CONSTRAINT      N   ALTER TABLE ONLY school."New"
    ADD CONSTRAINT "New_pkey" PRIMARY KEY (id);
 :   ALTER TABLE ONLY school."New" DROP CONSTRAINT "New_pkey";
          school                    postgres     false     315               	             2606     30564     Notification Notification_pkey 
   CONSTRAINT      `   ALTER TABLE ONLY school."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);
 L   ALTER TABLE ONLY school."Notification" DROP CONSTRAINT "Notification_pkey";
          school                    postgres     false     324                             2606     33043     Profile Profile_pkey 
   CONSTRAINT      V   ALTER TABLE ONLY school."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY school."Profile" DROP CONSTRAINT "Profile_pkey";
          school                    postgres     false     330               ô             2606     30508     School School_pkey 
   CONSTRAINT      T   ALTER TABLE ONLY school."School"
    ADD CONSTRAINT "School_pkey" PRIMARY KEY (id);
 @   ALTER TABLE ONLY school."School" DROP CONSTRAINT "School_pkey";
          school                    postgres     false     316               ý             2606     30529     Staff Staff_pkey 
   CONSTRAINT      R   ALTER TABLE ONLY school."Staff"
    ADD CONSTRAINT "Staff_pkey" PRIMARY KEY (id);
 >   ALTER TABLE ONLY school."Staff" DROP CONSTRAINT "Staff_pkey";
          school                    postgres     false     319               ù             2606     30522     Student Student_pkey 
   CONSTRAINT      V   ALTER TABLE ONLY school."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY school."Student" DROP CONSTRAINT "Student_pkey";
          school                    postgres     false     318               ÿ             2606     30536     Subject Subject_pkey 
   CONSTRAINT      V   ALTER TABLE ONLY school."Subject"
    ADD CONSTRAINT "Subject_pkey" PRIMARY KEY (id);
 B   ALTER TABLE ONLY school."Subject" DROP CONSTRAINT "Subject_pkey";
          school                    postgres     false     320                             2606     30585     TimeTable TimeTable_pkey 
   CONSTRAINT      Z   ALTER TABLE ONLY school."TimeTable"
    ADD CONSTRAINT "TimeTable_pkey" PRIMARY KEY (id);
 F   ALTER TABLE ONLY school."TimeTable" DROP CONSTRAINT "TimeTable_pkey";
          school                    postgres     false     327                             2606     37847     feedback feedback_pkey 
   CONSTRAINT      T   ALTER TABLE ONLY school.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY school.feedback DROP CONSTRAINT feedback_pkey;
          school                    postgres     false     333               #             2606     37862 &   feedback_replies feedback_replies_pkey 
   CONSTRAINT      d   ALTER TABLE ONLY school.feedback_replies
    ADD CONSTRAINT feedback_replies_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY school.feedback_replies DROP CONSTRAINT feedback_replies_pkey;
          school                    postgres     false     335                             2606     30599     users users_pkey 
   CONSTRAINT      N   ALTER TABLE ONLY school.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY school.users DROP CONSTRAINT users_pkey;
          school                    postgres     false     329                             1259     30604     File_schoolId_key     INDEX      S   CREATE UNIQUE INDEX "File_schoolId_key" ON school."File" USING btree ("schoolId");
 '   DROP INDEX school."File_schoolId_key";
          school                    postgres     false     328               ð             1259     30600 
   New_id_key     INDEX      C   CREATE UNIQUE INDEX "New_id_key" ON school."New" USING btree (id);
     DROP INDEX school."New_id_key";
          school                    postgres     false     315                             1259     33044     Profile_user_id_key     INDEX      U   CREATE UNIQUE INDEX "Profile_user_id_key" ON school."Profile" USING btree (user_id);
 )   DROP INDEX school."Profile_user_id_key";
          school                    postgres     false     330               ú             1259     30603     Staff_email_key     INDEX      M   CREATE UNIQUE INDEX "Staff_email_key" ON school."Staff" USING btree (email);
 %   DROP INDEX school."Staff_email_key";
          school                    postgres     false     319               û             1259     30602     Staff_employeeId_key     INDEX      Y   CREATE UNIQUE INDEX "Staff_employeeId_key" ON school."Staff" USING btree ("employeeId");
 *   DROP INDEX school."Staff_employeeId_key";
          school                    postgres     false     319               ÷             1259     30601     Student_admissionNumber_key     INDEX      g   CREATE UNIQUE
