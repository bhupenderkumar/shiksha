--
-- PostgreSQL database dump
--

\restrict WWDvzgeiZJy9bkTmDEEoUjKbfPchbXxtba2RfW8WmTQTJa6UMSFVVYzJnN9cC6i

-- Dumped from database version 15.8
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: school; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA school;


--
-- Name: AttendanceStatus; Type: TYPE; Schema: school; Owner: -
--

CREATE TYPE school."AttendanceStatus" AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE',
    'HALF_DAY'
);


--
-- Name: EnquiryStatus; Type: TYPE; Schema: school; Owner: -
--

CREATE TYPE school."EnquiryStatus" AS ENUM (
    'NEW',
    'IN_REVIEW',
    'SCHEDULED_INTERVIEW',
    'PENDING_DOCUMENTS',
    'APPROVED',
    'REJECTED',
    'ENROLLED'
);


--
-- Name: FeeStatus; Type: TYPE; Schema: school; Owner: -
--

CREATE TYPE school."FeeStatus" AS ENUM (
    'PENDING',
    'PAID',
    'OVERDUE',
    'PARTIAL'
);


--
-- Name: FeeType; Type: TYPE; Schema: school; Owner: -
--

CREATE TYPE school."FeeType" AS ENUM (
    'TUITION',
    'EXAMINATION',
    'TRANSPORT',
    'LIBRARY',
    'LABORATORY',
    'MISCELLANEOUS'
);


--
-- Name: GrievanceStatus; Type: TYPE; Schema: school; Owner: -
--

CREATE TYPE school."GrievanceStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


--
-- Name: HomeworkStatus; Type: TYPE; Schema: school; Owner: -
--

CREATE TYPE school."HomeworkStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'OVERDUE',
    'SUBMITTED'
);


--
-- Name: InteractiveAssignmentType; Type: TYPE; Schema: school; Owner: -
--

CREATE TYPE school."InteractiveAssignmentType" AS ENUM (
    'SORTING',
    'HANDWRITING',
    'LETTER_TRACING',
    'NUMBER_RECOGNITION',
    'PICTURE_WORD_MATCHING',
    'PATTERN_COMPLETION',
    'CATEGORIZATION'
);


--
-- Name: NotificationType; Type: TYPE; Schema: school; Owner: -
--

CREATE TYPE school."NotificationType" AS ENUM (
    'HOMEWORK',
    'ATTENDANCE',
    'FEE',
    'GENERAL',
    'EXAM',
    'EMERGENCY'
);


--
-- Name: StaffRole; Type: TYPE; Schema: school; Owner: -
--

CREATE TYPE school."StaffRole" AS ENUM (
    'TEACHER',
    'ADMIN',
    'PRINCIPAL',
    'ACCOUNTANT'
);


--
-- Name: create_auth_users_for_students(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.create_auth_users_for_students() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    student_record RECORD;
    default_password TEXT := 'Student@123'; -- Default password for all students
    new_user_id UUID;
    email_address TEXT;
    base_email TEXT;
    counter INTEGER;
    total_created INTEGER := 0;
    total_skipped INTEGER := 0;
BEGIN
    -- Temporarily disable the trigger that creates students
    ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

    -- Loop through each student that doesn't have a corresponding auth.user
    FOR student_record IN 
        SELECT s.* 
        FROM school."Student" s
        LEFT JOIN school."Profile" p ON s.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            -- Generate base email
            base_email := LOWER(REPLACE(TRIM(student_record.name), ' ', '.') || '@myfirststeppublicschool.com');
            
            -- Initialize counter and email
            counter := 1;
            email_address := base_email;
            
            -- Keep trying until we find a unique email
            WHILE EXISTS (SELECT 1 FROM auth.users WHERE email = email_address) LOOP
                email_address := LOWER(REPLACE(TRIM(student_record.name), ' ', '.') || counter || '@myfirststeppublicschool.com');
                counter := counter + 1;
            END LOOP;

            -- Generate UUID for new user
            new_user_id := gen_random_uuid();

            -- Insert into auth.users
            INSERT INTO auth.users (
                id,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_user_meta_data,
                raw_app_meta_data,
                aud,
                role,
                created_at,
                updated_at
            ) VALUES (
                new_user_id,
                email_address,
                crypt(default_password, gen_salt('bf')),
                NOW(),
                jsonb_build_object(
                    'full_name', student_record.name,
                    'date_of_birth', student_record."dateOfBirth",
                    'gender', student_record.gender,
                    'address', student_record.address,
                    'phone', student_record."contactNumber",
                    'parent_name', student_record."parentName",
                    'parent_contact', student_record."parentContact",
                    'admission_number', student_record."admissionNumber"
                ),
                jsonb_build_object(
                    'provider', 'email',
                    'providers', ARRAY['email']
                ),
                'authenticated',
                'authenticated',
                NOW(),
                NOW()
            );

            -- Create Profile entry
            INSERT INTO school."Profile" (
                id,
                user_id,
                role,
                full_name
            ) VALUES (
                student_record.id,
                new_user_id,
                'STUDENT',
                student_record.name
            );

            -- Create UserSettings entry with correct columns
            INSERT INTO school."UserSettings" (
                user_id,
                theme
            ) VALUES (
                new_user_id,
                'light'
            );

            -- Log each successful creation
            total_created := total_created + 1;
            RAISE NOTICE 'Created user % of %: % (%)', total_created, student_record.id, student_record.name, email_address;

        EXCEPTION WHEN OTHERS THEN
            total_skipped := total_skipped + 1;
            RAISE NOTICE 'Error creating user for %: %', student_record.name, SQLERRM;
        END;
    END LOOP;

    -- Re-enable the trigger
    ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

    -- Final summary
    RAISE NOTICE 'Creation completed. Created: %, Skipped: %', total_created, total_skipped;
END;
$$;


--
-- Name: ensure_all_required_fields(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.ensure_all_required_fields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  has_assignment_id BOOLEAN;
  has_assignmentId BOOLEAN;
  has_question_type BOOLEAN;
  has_questionType BOOLEAN;
  has_question_text BOOLEAN;
  has_questionText BOOLEAN;
  has_question_data BOOLEAN;
  has_questionData BOOLEAN;
  has_question_order BOOLEAN;
  has_questionOrder BOOLEAN;
  has_order BOOLEAN;
BEGIN
  -- Check which columns exist in the table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'assignment_id'
  ) INTO has_assignment_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'assignmentId'
  ) INTO has_assignmentId;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'question_type'
  ) INTO has_question_type;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'questionType'
  ) INTO has_questionType;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'question_text'
  ) INTO has_question_text;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'questionText'
  ) INTO has_questionText;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'question_data'
  ) INTO has_question_data;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'questionData'
  ) INTO has_questionData;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'question_order'
  ) INTO has_question_order;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'questionOrder'
  ) INTO has_questionOrder;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'school' 
    AND table_name = 'InteractiveQuestion' 
    AND column_name = 'order'
  ) INTO has_order;

  -- Handle assignment_id (foreign key)
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF has_assignmentId AND has_assignment_id THEN
      IF NEW."assignmentId" IS NOT NULL AND NEW.assignment_id IS NULL THEN
        NEW.assignment_id := NEW."assignmentId";
      ELSIF NEW.assignment_id IS NOT NULL AND NEW."assignmentId" IS NULL THEN
        NEW."assignmentId" := NEW.assignment_id;
      END IF;
    END IF;
    
    -- Handle question_type
    IF has_questionType AND has_question_type THEN
      IF NEW.question_type IS NULL AND NEW."questionType" IS NOT NULL THEN
        NEW.question_type := NEW."questionType";
      ELSIF NEW."questionType" IS NULL AND NEW.question_type IS NOT NULL THEN
        NEW."questionType" := NEW.question_type;
      ELSIF NEW.question_type IS NULL AND NEW."questionType" IS NULL THEN
        NEW.question_type := 'MATCHING';
        NEW."questionType" := 'MATCHING';
      END IF;
    ELSIF has_question_type AND NEW.question_type IS NULL THEN
      NEW.question_type := 'MATCHING';
    ELSIF has_questionType AND NEW."questionType" IS NULL THEN
      NEW."questionType" := 'MATCHING';
    END IF;
    
    -- Handle question_order
    IF has_question_order AND has_order THEN
      IF NEW.question_order IS NULL AND NEW.order IS NOT NULL THEN
        NEW.question_order := NEW.order;
      END IF;
    END IF;
    
    IF has_questionOrder AND has_question_order THEN
      IF NEW."questionOrder" IS NOT NULL AND NEW.question_order IS NULL THEN
        NEW.question_order := NEW."questionOrder";
      ELSIF NEW.question_order IS NOT NULL AND NEW."questionOrder" IS NULL THEN
        NEW."questionOrder" := NEW.question_order;
      ELSIF NEW.question_order IS NULL AND NEW."questionOrder" IS NULL THEN
        NEW.question_order := 1;
        NEW."questionOrder" := 1;
      END IF;
    ELSIF has_question_order AND NEW.question_order IS NULL THEN
      NEW.question_order := 1;
    ELSIF has_questionOrder AND NEW."questionOrder" IS NULL THEN
      NEW."questionOrder" := 1;
    END IF;
    
    -- Handle question_text
    IF has_questionText AND has_question_text THEN
      IF NEW.question_text IS NULL AND NEW."questionText" IS NOT NULL THEN
        NEW.question_text := NEW."questionText";
      ELSIF NEW."questionText" IS NULL AND NEW.question_text IS NOT NULL THEN
        NEW."questionText" := NEW.question_text;
      ELSIF NEW.question_text IS NULL AND NEW."questionText" IS NULL THEN
        NEW.question_text := '';
        NEW."questionText" := '';
      END IF;
    ELSIF has_question_text AND NEW.question_text IS NULL THEN
      NEW.question_text := '';
    ELSIF has_questionText AND NEW."questionText" IS NULL THEN
      NEW."questionText" := '';
    END IF;
    
    -- Handle question_data
    IF has_questionData AND has_question_data THEN
      IF NEW.question_data IS NULL AND NEW."questionData" IS NOT NULL THEN
        NEW.question_data := NEW."questionData";
      ELSIF NEW."questionData" IS NULL AND NEW.question_data IS NOT NULL THEN
        NEW."questionData" := NEW.question_data;
      ELSIF NEW.question_data IS NULL AND NEW."questionData" IS NULL THEN
        NEW.question_data := '{}'::jsonb;
        NEW."questionData" := '{}'::jsonb;
      END IF;
    ELSIF has_question_data AND NEW.question_data IS NULL THEN
      NEW.question_data := '{}'::jsonb;
    ELSIF has_questionData AND NEW."questionData" IS NULL THEN
      NEW."questionData" := '{}'::jsonb;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: generate_admission_number(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.generate_admission_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_num INTEGER;
    year_prefix TEXT;
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING("admissionNumber" FROM 8) AS INTEGER)), 0) + 1
    INTO next_num
    FROM school."Student"
    WHERE "admissionNumber" LIKE 'ADM' || year_prefix || '%';
    
    RETURN 'ADM' || year_prefix || LPAD(next_num::TEXT, 3, '0');
END;
$$;


--
-- Name: get_students_by_class(text); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.get_students_by_class(p_class_id text) RETURNS TABLE(id uuid, student_name text, student_photo_url text, class_id text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    student_name,
    student_photo_url,
    class_id
  FROM 
    school."IDCard"
  WHERE 
    class_id = p_class_id
  ORDER BY 
    student_name ASC;
END;
$$;


--
-- Name: handle_new_user_registration(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.handle_new_user_registration() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_student_id TEXT;
    class_id TEXT;
    dob TEXT;
BEGIN
    -- Get default class ID
    SELECT id INTO class_id FROM school."Class" LIMIT 1;

    -- Generate new student ID
    new_student_id := 'STU' || TO_CHAR(CURRENT_TIMESTAMP, 'YYMMDD') ||
                      LPAD(CAST((random() * 999 + 1) AS INTEGER)::TEXT, 3, '0');

    -- Safely extract DOB
    dob := NULLIF(NEW.raw_user_meta_data->>'date_of_birth', '');

    -- Insert Profile
    INSERT INTO school."Profile" (
        id, user_id, role, full_name
    ) VALUES (
        new_student_id,
        NEW.id,
        'STUDENT',
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Student')
    );

    -- Insert Student
    INSERT INTO school."Student" (
        id, "admissionNumber", name, "dateOfBirth", gender, address,
        "contactNumber", "parentName", "parentContact", "parentEmail",
        "classId", "createdAt", "updatedAt"
    ) VALUES (
        new_student_id,
        school.generate_admission_number(),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Student'),
        COALESCE(dob::timestamp, CURRENT_TIMESTAMP),
        COALESCE(NEW.raw_user_meta_data->>'gender', 'Not Specified'),
        COALESCE(NEW.raw_user_meta_data->>'address', 'Address Pending'),
        COALESCE(NEW.raw_user_meta_data->>'phone', 'Phone Pending'),
        COALESCE(NEW.raw_user_meta_data->>'parent_name', 'Parent Name Pending'),
        COALESCE(NEW.raw_user_meta_data->>'parent_contact', 'Parent Contact Pending'),
        NEW.email,
        class_id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );

    -- Insert UserSettings
    INSERT INTO school."UserSettings" (
        user_id, theme, notifications_enabled, email_notifications
    ) VALUES (
        NEW.id,
        'light',
        true,
        true
    );

    RETURN NEW;
END;
$$;


--
-- Name: handle_profile_updates(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.handle_profile_updates() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Update student record when profile changes
    UPDATE school."Student"
    SET 
        name = NEW.full_name,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;


--
-- Name: sync_interactive_question_columns(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.sync_interactive_question_columns() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- When camelCase columns are updated, update snake_case columns
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Handle questionType/question_type
    IF NEW."questionType" IS NOT NULL THEN
      NEW.question_type := NEW."questionType";
    ELSIF NEW.question_type IS NOT NULL THEN
      NEW."questionType" := NEW.question_type;
    END IF;

    -- Handle questionText/question_text
    IF NEW."questionText" IS NOT NULL THEN
      NEW.question_text := NEW."questionText";
    ELSIF NEW.question_text IS NOT NULL THEN
      NEW."questionText" := NEW.question_text;
    END IF;

    -- Handle questionData/question_data
    IF NEW."questionData" IS NOT NULL THEN
      NEW.question_data := NEW."questionData";
    ELSIF NEW.question_data IS NOT NULL THEN
      NEW."questionData" := NEW.question_data;
    END IF;

    -- Handle questionOrder/question_order
    IF NEW."questionOrder" IS NOT NULL THEN
      NEW.question_order := NEW."questionOrder";
    ELSIF NEW.question_order IS NOT NULL THEN
      NEW."questionOrder" := NEW.question_order;
    END IF;

    -- Handle audioInstructions/audio_instructions
    IF NEW."audioInstructions" IS NOT NULL THEN
      NEW.audio_instructions := NEW."audioInstructions";
    ELSIF NEW.audio_instructions IS NOT NULL THEN
      NEW."audioInstructions" := NEW.audio_instructions;
    END IF;

    -- Handle hintText/hint_text
    IF NEW."hintText" IS NOT NULL THEN
      NEW.hint_text := NEW."hintText";
    ELSIF NEW.hint_text IS NOT NULL THEN
      NEW."hintText" := NEW.hint_text;
    END IF;

    -- Handle hintImageUrl/hint_image_url
    IF NEW."hintImageUrl" IS NOT NULL THEN
      NEW.hint_image_url := NEW."hintImageUrl";
    ELSIF NEW.hint_image_url IS NOT NULL THEN
      NEW."hintImageUrl" := NEW.hint_image_url;
    END IF;

    -- Handle feedbackCorrect/feedback_correct
    IF NEW."feedbackCorrect" IS NOT NULL THEN
      NEW.feedback_correct := NEW."feedbackCorrect";
    ELSIF NEW.feedback_correct IS NOT NULL THEN
      NEW."feedbackCorrect" := NEW.feedback_correct;
    END IF;

    -- Handle feedbackIncorrect/feedback_incorrect
    IF NEW."feedbackIncorrect" IS NOT NULL THEN
      NEW.feedback_incorrect := NEW."feedbackIncorrect";
    ELSIF NEW.feedback_incorrect IS NOT NULL THEN
      NEW."feedbackIncorrect" := NEW.feedback_incorrect;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: update_admission_communication_timestamp(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.update_admission_communication_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_admission_process_timestamp(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.update_admission_process_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_attendance_timestamp(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.update_attendance_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_prospective_student_timestamp(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.update_prospective_student_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    NEW."lastUpdateDate" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: school; Owner: -
--

CREATE FUNCTION school.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AcademicYear; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."AcademicYear" (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    year_name character varying(20) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status character varying(20) DEFAULT 'ACTIVE'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: AdmissionCommunication; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."AdmissionCommunication" (
    id text NOT NULL,
    "prospectiveStudentId" text NOT NULL,
    "communicationType" text NOT NULL,
    notes text NOT NULL,
    "staffId" text NOT NULL,
    "communicationDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "AdmissionCommunication_communicationType_check" CHECK (("communicationType" = ANY (ARRAY['PHONE'::text, 'EMAIL'::text, 'MEETING'::text, 'OTHER'::text])))
);


--
-- Name: AdmissionNotes; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."AdmissionNotes" (
    id uuid NOT NULL,
    prospectivestudentid uuid NOT NULL,
    content text NOT NULL,
    createdby character varying(255) NOT NULL,
    createdat timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AdmissionProcess; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."AdmissionProcess" (
    id text NOT NULL,
    "prospectiveStudentId" text NOT NULL,
    "assignedClassId" text,
    "admissionNumber" text,
    "documentsRequired" jsonb,
    "documentsSubmitted" jsonb,
    "interviewDate" timestamp(3) without time zone,
    "interviewNotes" text,
    "feeDetails" jsonb,
    "approvedBy" text,
    "studentId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Attendance; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Attendance" (
    id text NOT NULL,
    "studentId" uuid,
    date timestamp(3) without time zone,
    status school."AttendanceStatus",
    "createdBy" uuid,
    description text,
    "createdAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone,
    "classId" text,
    "lastModifiedBy" uuid
);


--
-- Name: Attendance_Backup; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Attendance_Backup" (
    id text,
    date timestamp(3) without time zone,
    status school."AttendanceStatus",
    "studentId" text,
    "createdAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone,
    "classId" text,
    "createdBy" uuid,
    description text,
    "lastModifiedBy" uuid
);


--
-- Name: Class; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Class" (
    id text NOT NULL,
    name text NOT NULL,
    section text NOT NULL,
    "roomNumber" text,
    capacity integer NOT NULL,
    "schoolId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ClassTransition; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."ClassTransition" (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    student_id text NOT NULL,
    academic_year_id uuid NOT NULL,
    previous_class_id text NOT NULL,
    next_class_id text NOT NULL,
    transition_status character varying(20) DEFAULT 'PENDING'::character varying,
    transition_date timestamp with time zone,
    remarks text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: Classwork; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Classwork" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "classId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: CompletionMilestone; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."CompletionMilestone" (
    id bigint NOT NULL,
    assignment_id bigint NOT NULL,
    milestone_description text,
    milestone_date timestamp with time zone
);


--
-- Name: CompletionMilestone_id_seq; Type: SEQUENCE; Schema: school; Owner: -
--

ALTER TABLE school."CompletionMilestone" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME school."CompletionMilestone_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Fee; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Fee" (
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


--
-- Name: FeedbackCertificate; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."FeedbackCertificate" (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    feedback_id uuid NOT NULL,
    certificate_url text,
    download_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE "FeedbackCertificate"; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON TABLE school."FeedbackCertificate" IS 'Stores certificate information related to student feedback';


--
-- Name: FeedbackTemplate; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."FeedbackTemplate" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    template_name text NOT NULL,
    template_text text NOT NULL,
    assignment_type text,
    performance_level text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedbackTemplate_performance_level_check" CHECK ((performance_level = ANY (ARRAY['excellent'::text, 'good'::text, 'average'::text, 'needs_improvement'::text])))
);


--
-- Name: File; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."File" (
    id text NOT NULL,
    "fileName" text NOT NULL,
    "fileType" text NOT NULL,
    "filePath" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone NOT NULL,
    "schoolId" text,
    "homeworkId" text,
    "classworkId" text,
    "feeId" text,
    "grievanceId" text,
    "uploadedBy" uuid NOT NULL,
    "homeworkSubmissionId" text,
    "interactiveAssignmentId" bigint
);


--
-- Name: Grievance; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Grievance" (
    id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    "studentId" text NOT NULL,
    status school."GrievanceStatus" NOT NULL,
    resolution text,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Homework; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Homework" (
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


--
-- Name: HomeworkSubmission; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."HomeworkSubmission" (
    id text NOT NULL,
    "homeworkId" text NOT NULL,
    "studentId" text NOT NULL,
    status school."HomeworkStatus" NOT NULL,
    "submittedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: IDCard; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."IDCard" (
    id uuid NOT NULL,
    date_of_birth date,
    student_name text NOT NULL,
    class_id text,
    student_photo_url text,
    father_name text NOT NULL,
    mother_name text NOT NULL,
    father_photo_url text,
    mother_photo_url text,
    father_mobile text,
    mother_mobile text,
    address text,
    created_at timestamp with time zone DEFAULT now(),
    download_count integer DEFAULT 0
);


--
-- Name: TABLE "IDCard"; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON TABLE school."IDCard" IS 'Stores student ID card information';


--
-- Name: InteractiveAssignment; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."InteractiveAssignment" (
    id bigint NOT NULL,
    title text NOT NULL,
    description text,
    due_date timestamp with time zone,
    "audioInstructions" text,
    difficulty_level text,
    estimated_time_minutes integer,
    has_audio_feedback boolean DEFAULT false,
    has_celebration boolean DEFAULT true,
    "ageGroup" text,
    requires_parent_help boolean DEFAULT false,
    shareable_link text,
    shareable_link_expires_at timestamp with time zone,
    "classId" text,
    "createdAt" date,
    "createdBy" uuid,
    "difficultyLevel" text DEFAULT 'CHECK (difficultyLevel IN (''beginner'', ''intermediate'', ''advanced''))'::text,
    "dueDate" date,
    "estimatedTimeMinutes" numeric,
    "hasAudioFeedback" boolean,
    "hasCelebration" boolean,
    "requiresParentHelp" boolean,
    status text,
    "subjectId" text,
    type text,
    "updatedAt" date,
    "assignmentId" bigint,
    "shareableLink" text,
    "shareableLinkExpiresAt" date,
    CONSTRAINT "InteractiveAssignment_age_group_check" CHECK (("ageGroup" = ANY (ARRAY['nursery'::text, 'lkg'::text, 'ukg'::text, 'elementary'::text]))),
    CONSTRAINT "InteractiveAssignment_difficulty_level_check" CHECK ((difficulty_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])))
);


--
-- Name: InteractiveAssignment_id_seq; Type: SEQUENCE; Schema: school; Owner: -
--

ALTER TABLE school."InteractiveAssignment" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME school."InteractiveAssignment_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: InteractiveQuestion; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."InteractiveQuestion" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "assignmentId" bigint NOT NULL,
    question_type text NOT NULL,
    question_text text NOT NULL,
    question_data jsonb,
    question_order integer NOT NULL,
    "order" text,
    "questionData" jsonb,
    "questionText" character varying,
    "questionType" text,
    "audioInstructions" text,
    "hintText" text,
    "hintImageUrl" text,
    "feedbackCorrect" text,
    "feedbackIncorrect" text,
    assignment_id text,
    "questionOrder" integer,
    audio_instructions text,
    hint_text text,
    hint_image_url text,
    feedback_correct text,
    feedback_incorrect text
);


--
-- Name: InteractiveResponse; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."InteractiveResponse" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid NOT NULL,
    question_id uuid NOT NULL,
    response_data jsonb,
    is_correct boolean
);


--
-- Name: InteractiveSubmission; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."InteractiveSubmission" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assignment_id bigint NOT NULL,
    student_id text NOT NULL,
    status text DEFAULT 'PENDING'::text,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    submitted_at timestamp with time zone,
    score integer,
    feedback text
);


--
-- Name: Notification; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Notification" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type school."NotificationType" NOT NULL,
    "studentId" text,
    "classId" text,
    "isRead" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: NotificationStudents; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."NotificationStudents" (
    notificationid uuid NOT NULL,
    studentid text NOT NULL
);


--
-- Name: ParentFeedback; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."ParentFeedback" (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    class_id text NOT NULL,
    student_name text NOT NULL,
    month text NOT NULL,
    good_things text,
    need_to_improve text,
    best_can_do text,
    attendance_percentage numeric,
    student_photo_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid
);


--
-- Name: TABLE "ParentFeedback"; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON TABLE school."ParentFeedback" IS 'Stores student feedback information for parents to view';


--
-- Name: ParentSubmittedFeedback; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."ParentSubmittedFeedback" (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    class_id text NOT NULL,
    student_name text NOT NULL,
    parent_name text NOT NULL,
    parent_relation text NOT NULL,
    parent_email text,
    parent_phone text,
    month text NOT NULL,
    progress_feedback text NOT NULL,
    improvement_areas text,
    home_activities text,
    questions_concerns text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status text DEFAULT 'PENDING'::text,
    feedback text DEFAULT 'No feedback provided'::text NOT NULL
);


--
-- Name: TABLE "ParentSubmittedFeedback"; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON TABLE school."ParentSubmittedFeedback" IS 'Stores feedback submitted by parents about their children';


--
-- Name: Profile; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Profile" (
    id text NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    full_name text,
    avatar_url text
);


--
-- Name: ProspectiveStudent; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."ProspectiveStudent" (
    id text NOT NULL,
    "studentName" text NOT NULL,
    "parentName" text NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL,
    gender text NOT NULL,
    email text NOT NULL,
    "contactNumber" text NOT NULL,
    "gradeApplying" text NOT NULL,
    "currentSchool" text,
    address text NOT NULL,
    "bloodGroup" text,
    status school."EnquiryStatus" DEFAULT 'NEW'::school."EnquiryStatus" NOT NULL,
    "appliedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "lastUpdateDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "schoolId" text NOT NULL,
    "assignedTo" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "ProspectiveStudent_gender_check" CHECK ((gender = ANY (ARRAY['Male'::text, 'Female'::text, 'Other'::text])))
);


--
-- Name: School; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."School" (
    id text NOT NULL,
    "schoolName" text NOT NULL,
    "schoolAddress" text NOT NULL
);


--
-- Name: Settings; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Settings" (
    id integer NOT NULL,
    school_name character varying(255) NOT NULL,
    address character varying(255),
    phone character varying(50),
    email character varying(100),
    website character varying(255),
    description text,
    logo_url character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: Settings_id_seq; Type: SEQUENCE; Schema: school; Owner: -
--

CREATE SEQUENCE school."Settings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Settings_id_seq; Type: SEQUENCE OWNED BY; Schema: school; Owner: -
--

ALTER SEQUENCE school."Settings_id_seq" OWNED BY school."Settings".id;


--
-- Name: Staff; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Staff" (
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    user_id uuid
);


--
-- Name: Student; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Student" (
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    user_id uuid
);


--
-- Name: StudentProgressAnalytics; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."StudentProgressAnalytics" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id text NOT NULL,
    assignment_type text NOT NULL,
    assignments_completed integer DEFAULT 0,
    average_score numeric(5,2) DEFAULT 0,
    average_time_spent integer DEFAULT 0,
    strengths text[],
    areas_for_improvement text[],
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: Student_Backup; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Student_Backup" (
    id text,
    "admissionNumber" text,
    name text,
    "dateOfBirth" timestamp(3) without time zone,
    gender text,
    address text,
    "contactNumber" text,
    "parentName" text,
    "parentContact" text,
    "parentEmail" text,
    "bloodGroup" text,
    "classId" text,
    "createdAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone,
    user_id uuid
);


--
-- Name: Subject; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."Subject" (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    "classId" text NOT NULL,
    "teacherId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TimeTable; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."TimeTable" (
    id text NOT NULL,
    day integer NOT NULL,
    "startTime" timestamp(3) without time zone NOT NULL,
    "endTime" timestamp(3) without time zone NOT NULL,
    "classId" text NOT NULL,
    "subjectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: UserSettings; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."UserSettings" (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    notifications jsonb NOT NULL,
    theme jsonb NOT NULL,
    security jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notifications_enabled boolean DEFAULT true,
    email_notifications boolean DEFAULT true
);


--
-- Name: UserSettings_id_seq; Type: SEQUENCE; Schema: school; Owner: -
--

CREATE SEQUENCE school."UserSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UserSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: school; Owner: -
--

ALTER SEQUENCE school."UserSettings_id_seq" OWNED BY school."UserSettings".id;


--
-- Name: YearEndFeedback; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school."YearEndFeedback" (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    student_id text NOT NULL,
    academic_year_id uuid NOT NULL,
    parent_feedback text,
    student_feedback text,
    teacher_feedback text,
    academic_performance text,
    behavioral_assessment text,
    areas_of_improvement text,
    strengths text,
    next_class_recommendation text NOT NULL,
    student_photo_url text,
    father_photo_url text,
    mother_photo_url text,
    father_name text,
    mother_name text,
    father_occupation text,
    mother_occupation text,
    father_contact text,
    mother_contact text,
    father_email text,
    mother_email text,
    address text,
    emergency_contact text,
    medical_conditions text,
    extracurricular_activities text,
    achievements text,
    attendance_record jsonb,
    feedback_status character varying(20) DEFAULT 'PENDING'::character varying,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: admissioncommunication; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.admissioncommunication (
    id uuid NOT NULL,
    prospectivestudentid uuid NOT NULL,
    communicationtype character varying(50) NOT NULL,
    notes text,
    staffid character varying(255) NOT NULL,
    communicationdate timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE admissioncommunication; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON TABLE school.admissioncommunication IS 'Stores communication history with prospective students';


--
-- Name: admissionnotes; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.admissionnotes (
    id uuid NOT NULL,
    prospectivestudentid uuid NOT NULL,
    content text NOT NULL,
    createdby character varying(255) NOT NULL,
    createdat timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE admissionnotes; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON TABLE school.admissionnotes IS 'Stores notes and updates related to each admission enquiry';


--
-- Name: admissionprocess; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.admissionprocess (
    id uuid NOT NULL,
    prospectivestudentid uuid NOT NULL,
    documentsrequired jsonb DEFAULT '{}'::jsonb NOT NULL,
    createdat timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedat timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    interviewdate timestamp with time zone,
    assignedclass character varying(10)
);


--
-- Name: TABLE admissionprocess; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON TABLE school.admissionprocess IS 'Tracks the admission process and required documents for each prospective student';


--
-- Name: COLUMN admissionprocess.interviewdate; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON COLUMN school.admissionprocess.interviewdate IS 'Timestamp of scheduled interview';


--
-- Name: COLUMN admissionprocess.assignedclass; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON COLUMN school.admissionprocess.assignedclass IS 'Class assigned to the student after admission';


--
-- Name: anonymoususer; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.anonymoususer (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    mobile_number text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_active timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: anonymoususerprogress; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.anonymoususerprogress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    assignment_id bigint NOT NULL,
    score integer,
    completed boolean DEFAULT false,
    started_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    completed_at timestamp with time zone,
    responses jsonb DEFAULT '{}'::jsonb
);


--
-- Name: birthday_messages; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.birthday_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    message_content text NOT NULL,
    sent_to character varying(20) NOT NULL,
    phone_number character varying(20),
    sent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT birthday_messages_sent_to_check CHECK (((sent_to)::text = ANY ((ARRAY['father'::character varying, 'mother'::character varying, 'both'::character varying])::text[])))
);


--
-- Name: fee_history_update; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.fee_history_update (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    fee_payment_id uuid NOT NULL,
    field_name character varying(50) NOT NULL,
    old_value text,
    new_value text,
    updated_by character varying(255) DEFAULT 'system'::character varying,
    update_reason text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: fee_payments; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.fee_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    amount_received numeric(10,2) NOT NULL,
    payment_date date NOT NULL,
    payment_method character varying(20) NOT NULL,
    balance_remaining numeric(10,2) DEFAULT 0 NOT NULL,
    payment_status character varying(20) NOT NULL,
    notes text,
    receipt_url character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    fee_month integer,
    fee_year integer,
    has_updates boolean DEFAULT false,
    CONSTRAINT fee_payments_payment_method_check CHECK (((payment_method)::text = ANY ((ARRAY['cash'::character varying, 'card'::character varying, 'upi'::character varying, 'bank_transfer'::character varying, 'cheque'::character varying])::text[]))),
    CONSTRAINT fee_payments_payment_status_check CHECK (((payment_status)::text = ANY ((ARRAY['completed'::character varying, 'partial'::character varying, 'pending'::character varying])::text[])))
);


--
-- Name: feedback_id_seq; Type: SEQUENCE; Schema: school; Owner: -
--

CREATE SEQUENCE school.feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feedback; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.feedback (
    id integer DEFAULT nextval('school.feedback_id_seq'::regclass) NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    note text,
    status character varying(20) DEFAULT 'RAISED'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: feedback_replies_id_seq; Type: SEQUENCE; Schema: school; Owner: -
--

CREATE SEQUENCE school.feedback_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: feedback_replies; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.feedback_replies (
    id integer DEFAULT nextval('school.feedback_replies_id_seq'::regclass) NOT NULL,
    feedback_id integer NOT NULL,
    user_id uuid NOT NULL,
    reply text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: idcard; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.idcard (
    id uuid NOT NULL,
    student_name text NOT NULL,
    class_id text,
    student_photo_url text,
    father_name text NOT NULL,
    mother_name text NOT NULL,
    father_photo_url text,
    mother_photo_url text,
    father_mobile text,
    mother_mobile text,
    address text,
    created_at timestamp with time zone DEFAULT now(),
    download_count integer DEFAULT 0,
    date_of_birth date
);


--
-- Name: TABLE idcard; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON TABLE school.idcard IS 'Stores student ID card information';


--
-- Name: prospectivestudent; Type: TABLE; Schema: school; Owner: -
--

CREATE TABLE school.prospectivestudent (
    id uuid NOT NULL,
    studentname character varying(255) NOT NULL,
    parentname character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    contactnumber character varying(20) NOT NULL,
    gradeapplying character varying(10) NOT NULL,
    gender character varying(10) NOT NULL,
    dateofbirth date,
    address text,
    status character varying(50) DEFAULT 'NEW'::character varying NOT NULL,
    applieddate timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lastupdatedate timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TABLE prospectivestudent; Type: COMMENT; Schema: school; Owner: -
--

COMMENT ON TABLE school.prospectivestudent IS 'Stores information about prospective students and their admission enquiries';


--
-- Name: Settings id; Type: DEFAULT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Settings" ALTER COLUMN id SET DEFAULT nextval('school."Settings_id_seq"'::regclass);


--
-- Name: UserSettings id; Type: DEFAULT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."UserSettings" ALTER COLUMN id SET DEFAULT nextval('school."UserSettings_id_seq"'::regclass);


--
-- Name: AcademicYear AcademicYear_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AcademicYear"
    ADD CONSTRAINT "AcademicYear_pkey" PRIMARY KEY (id);


--
-- Name: AdmissionCommunication AdmissionCommunication_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionCommunication"
    ADD CONSTRAINT "AdmissionCommunication_pkey" PRIMARY KEY (id);


--
-- Name: AdmissionNotes AdmissionNotes_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionNotes"
    ADD CONSTRAINT "AdmissionNotes_pkey" PRIMARY KEY (id);


--
-- Name: AdmissionProcess AdmissionProcess_admissionNumber_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionProcess"
    ADD CONSTRAINT "AdmissionProcess_admissionNumber_key" UNIQUE ("admissionNumber");


--
-- Name: AdmissionProcess AdmissionProcess_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionProcess"
    ADD CONSTRAINT "AdmissionProcess_pkey" PRIMARY KEY (id);


--
-- Name: AdmissionProcess AdmissionProcess_studentId_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionProcess"
    ADD CONSTRAINT "AdmissionProcess_studentId_key" UNIQUE ("studentId");


--
-- Name: ClassTransition ClassTransition_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ClassTransition"
    ADD CONSTRAINT "ClassTransition_pkey" PRIMARY KEY (id);


--
-- Name: Class Class_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Class"
    ADD CONSTRAINT "Class_pkey" PRIMARY KEY (id);


--
-- Name: Classwork Classwork_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Classwork"
    ADD CONSTRAINT "Classwork_pkey" PRIMARY KEY (id);


--
-- Name: CompletionMilestone CompletionMilestone_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."CompletionMilestone"
    ADD CONSTRAINT "CompletionMilestone_pkey" PRIMARY KEY (id);


--
-- Name: Fee Fee_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Fee"
    ADD CONSTRAINT "Fee_pkey" PRIMARY KEY (id);


--
-- Name: FeedbackCertificate FeedbackCertificate_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."FeedbackCertificate"
    ADD CONSTRAINT "FeedbackCertificate_pkey" PRIMARY KEY (id);


--
-- Name: FeedbackTemplate FeedbackTemplate_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."FeedbackTemplate"
    ADD CONSTRAINT "FeedbackTemplate_pkey" PRIMARY KEY (id);


--
-- Name: FeedbackTemplate FeedbackTemplate_teacher_id_template_name_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."FeedbackTemplate"
    ADD CONSTRAINT "FeedbackTemplate_teacher_id_template_name_key" UNIQUE (teacher_id, template_name);


--
-- Name: File File_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_pkey" PRIMARY KEY (id);


--
-- Name: File File_schoolId_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_schoolId_key" UNIQUE ("schoolId");


--
-- Name: Grievance Grievance_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Grievance"
    ADD CONSTRAINT "Grievance_pkey" PRIMARY KEY (id);


--
-- Name: HomeworkSubmission HomeworkSubmission_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."HomeworkSubmission"
    ADD CONSTRAINT "HomeworkSubmission_pkey" PRIMARY KEY (id);


--
-- Name: Homework Homework_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Homework"
    ADD CONSTRAINT "Homework_pkey" PRIMARY KEY (id);


--
-- Name: IDCard IDCard_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."IDCard"
    ADD CONSTRAINT "IDCard_pkey" PRIMARY KEY (id);


--
-- Name: InteractiveAssignment InteractiveAssignment_id_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveAssignment"
    ADD CONSTRAINT "InteractiveAssignment_id_key" UNIQUE (id);


--
-- Name: InteractiveAssignment InteractiveAssignment_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveAssignment"
    ADD CONSTRAINT "InteractiveAssignment_pkey" PRIMARY KEY (id);


--
-- Name: InteractiveQuestion InteractiveQuestion_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveQuestion"
    ADD CONSTRAINT "InteractiveQuestion_pkey" PRIMARY KEY (id);


--
-- Name: InteractiveResponse InteractiveResponse_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveResponse"
    ADD CONSTRAINT "InteractiveResponse_pkey" PRIMARY KEY (id);


--
-- Name: InteractiveSubmission InteractiveSubmission_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveSubmission"
    ADD CONSTRAINT "InteractiveSubmission_pkey" PRIMARY KEY (id);


--
-- Name: NotificationStudents NotificationStudents_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."NotificationStudents"
    ADD CONSTRAINT "NotificationStudents_pkey" PRIMARY KEY (notificationid, studentid);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: ParentFeedback ParentFeedback_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ParentFeedback"
    ADD CONSTRAINT "ParentFeedback_pkey" PRIMARY KEY (id);


--
-- Name: ParentSubmittedFeedback ParentSubmittedFeedback_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ParentSubmittedFeedback"
    ADD CONSTRAINT "ParentSubmittedFeedback_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Profile"
    ADD CONSTRAINT "Profile_pkey" PRIMARY KEY (id);


--
-- Name: Profile Profile_user_id_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Profile"
    ADD CONSTRAINT "Profile_user_id_key" UNIQUE (user_id);


--
-- Name: ProspectiveStudent ProspectiveStudent_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ProspectiveStudent"
    ADD CONSTRAINT "ProspectiveStudent_pkey" PRIMARY KEY (id);


--
-- Name: School School_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."School"
    ADD CONSTRAINT "School_pkey" PRIMARY KEY (id);


--
-- Name: Staff Staff_email_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Staff"
    ADD CONSTRAINT "Staff_email_key" UNIQUE (email);


--
-- Name: Staff Staff_employeeId_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Staff"
    ADD CONSTRAINT "Staff_employeeId_key" UNIQUE ("employeeId");


--
-- Name: Staff Staff_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Staff"
    ADD CONSTRAINT "Staff_pkey" PRIMARY KEY (id);


--
-- Name: StudentProgressAnalytics StudentProgressAnalytics_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."StudentProgressAnalytics"
    ADD CONSTRAINT "StudentProgressAnalytics_pkey" PRIMARY KEY (id);


--
-- Name: StudentProgressAnalytics StudentProgressAnalytics_student_id_assignment_type_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."StudentProgressAnalytics"
    ADD CONSTRAINT "StudentProgressAnalytics_student_id_assignment_type_key" UNIQUE (student_id, assignment_type);


--
-- Name: Student Student_admissionNumber_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Student"
    ADD CONSTRAINT "Student_admissionNumber_key" UNIQUE ("admissionNumber");


--
-- Name: Student Student_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Student"
    ADD CONSTRAINT "Student_pkey" PRIMARY KEY (id);


--
-- Name: Subject Subject_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Subject"
    ADD CONSTRAINT "Subject_pkey" PRIMARY KEY (id);


--
-- Name: TimeTable TimeTable_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."TimeTable"
    ADD CONSTRAINT "TimeTable_pkey" PRIMARY KEY (id);


--
-- Name: UserSettings UserSettings_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."UserSettings"
    ADD CONSTRAINT "UserSettings_pkey" PRIMARY KEY (id);


--
-- Name: UserSettings UserSettings_user_id_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."UserSettings"
    ADD CONSTRAINT "UserSettings_user_id_key" UNIQUE (user_id);


--
-- Name: YearEndFeedback YearEndFeedback_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."YearEndFeedback"
    ADD CONSTRAINT "YearEndFeedback_pkey" PRIMARY KEY (id);


--
-- Name: admissioncommunication admissioncommunication_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.admissioncommunication
    ADD CONSTRAINT admissioncommunication_pkey PRIMARY KEY (id);


--
-- Name: admissionnotes admissionnotes_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.admissionnotes
    ADD CONSTRAINT admissionnotes_pkey PRIMARY KEY (id);


--
-- Name: admissionprocess admissionprocess_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.admissionprocess
    ADD CONSTRAINT admissionprocess_pkey PRIMARY KEY (id);


--
-- Name: anonymoususer anonymoususer_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.anonymoususer
    ADD CONSTRAINT anonymoususer_pkey PRIMARY KEY (id);


--
-- Name: anonymoususerprogress anonymoususerprogress_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.anonymoususerprogress
    ADD CONSTRAINT anonymoususerprogress_pkey PRIMARY KEY (id);


--
-- Name: anonymoususerprogress anonymoususerprogress_user_id_assignment_id_key; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.anonymoususerprogress
    ADD CONSTRAINT anonymoususerprogress_user_id_assignment_id_key UNIQUE (user_id, assignment_id);


--
-- Name: Attendance attendance_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Attendance"
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: Attendance attendance_student_date_unique; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Attendance"
    ADD CONSTRAINT attendance_student_date_unique UNIQUE ("studentId", date);


--
-- Name: birthday_messages birthday_messages_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.birthday_messages
    ADD CONSTRAINT birthday_messages_pkey PRIMARY KEY (id);


--
-- Name: fee_history_update fee_history_update_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.fee_history_update
    ADD CONSTRAINT fee_history_update_pkey PRIMARY KEY (id);


--
-- Name: fee_payments fee_payments_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.fee_payments
    ADD CONSTRAINT fee_payments_pkey PRIMARY KEY (id);


--
-- Name: feedback feedback_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.feedback
    ADD CONSTRAINT feedback_pkey PRIMARY KEY (id);


--
-- Name: feedback_replies feedback_replies_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.feedback_replies
    ADD CONSTRAINT feedback_replies_pkey PRIMARY KEY (id);


--
-- Name: idcard idcard_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.idcard
    ADD CONSTRAINT idcard_pkey PRIMARY KEY (id);


--
-- Name: prospectivestudent prospectivestudent_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.prospectivestudent
    ADD CONSTRAINT prospectivestudent_pkey PRIMARY KEY (id);


--
-- Name: Settings settings_pkey; Type: CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Settings"
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: admission_communication_student_idx; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX admission_communication_student_idx ON school."AdmissionCommunication" USING btree ("prospectiveStudentId");


--
-- Name: admission_process_student_idx; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX admission_process_student_idx ON school."AdmissionProcess" USING btree ("prospectiveStudentId");


--
-- Name: idx_admission_communication_date; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_admission_communication_date ON school.admissioncommunication USING btree (communicationdate);


--
-- Name: idx_admission_communication_student_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_admission_communication_student_id ON school.admissioncommunication USING btree (prospectivestudentid);


--
-- Name: idx_admission_notes_student_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_admission_notes_student_id ON school.admissionnotes USING btree (prospectivestudentid);


--
-- Name: idx_admission_process_student_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_admission_process_student_id ON school.admissionprocess USING btree (prospectivestudentid);


--
-- Name: idx_birthday_messages_sent_at; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_birthday_messages_sent_at ON school.birthday_messages USING btree (sent_at);


--
-- Name: idx_birthday_messages_student_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_birthday_messages_student_id ON school.birthday_messages USING btree (student_id);


--
-- Name: idx_fee_history_created_at; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_fee_history_created_at ON school.fee_history_update USING btree (created_at);


--
-- Name: idx_fee_history_fee_payment_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_fee_history_fee_payment_id ON school.fee_history_update USING btree (fee_payment_id);


--
-- Name: idx_fee_payments_has_updates; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_fee_payments_has_updates ON school.fee_payments USING btree (has_updates);


--
-- Name: idx_fee_payments_month_year; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_fee_payments_month_year ON school.fee_payments USING btree (fee_month, fee_year);


--
-- Name: idx_fee_payments_payment_date; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_fee_payments_payment_date ON school.fee_payments USING btree (payment_date);


--
-- Name: idx_fee_payments_receipt_url; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_fee_payments_receipt_url ON school.fee_payments USING btree (receipt_url);


--
-- Name: idx_fee_payments_student_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_fee_payments_student_id ON school.fee_payments USING btree (student_id);


--
-- Name: idx_feedback_academic_year; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_feedback_academic_year ON school."YearEndFeedback" USING btree (academic_year_id);


--
-- Name: idx_feedback_certificate_feedback_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_feedback_certificate_feedback_id ON school."FeedbackCertificate" USING btree (feedback_id);


--
-- Name: idx_feedback_student; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_feedback_student ON school."YearEndFeedback" USING btree (student_id);


--
-- Name: idx_idcard_class_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_idcard_class_id ON school.idcard USING btree (class_id);


--
-- Name: idx_parent_feedback_class_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_parent_feedback_class_id ON school."ParentFeedback" USING btree (class_id);


--
-- Name: idx_parent_feedback_month; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_parent_feedback_month ON school."ParentFeedback" USING btree (month);


--
-- Name: idx_parent_feedback_student_name; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_parent_feedback_student_name ON school."ParentFeedback" USING btree (student_name);


--
-- Name: idx_parent_submitted_feedback_class_id; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_parent_submitted_feedback_class_id ON school."ParentSubmittedFeedback" USING btree (class_id);


--
-- Name: idx_parent_submitted_feedback_month; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_parent_submitted_feedback_month ON school."ParentSubmittedFeedback" USING btree (month);


--
-- Name: idx_parent_submitted_feedback_status; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_parent_submitted_feedback_status ON school."ParentSubmittedFeedback" USING btree (status);


--
-- Name: idx_parent_submitted_feedback_student_name; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_parent_submitted_feedback_student_name ON school."ParentSubmittedFeedback" USING btree (student_name);


--
-- Name: idx_prospective_student_email; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_prospective_student_email ON school.prospectivestudent USING btree (email);


--
-- Name: idx_prospective_student_status; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_prospective_student_status ON school.prospectivestudent USING btree (status);


--
-- Name: idx_transition_academic_year; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_transition_academic_year ON school."ClassTransition" USING btree (academic_year_id);


--
-- Name: idx_transition_student; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX idx_transition_student ON school."ClassTransition" USING btree (student_id);


--
-- Name: prospective_student_grade_idx; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX prospective_student_grade_idx ON school."ProspectiveStudent" USING btree ("gradeApplying");


--
-- Name: prospective_student_status_idx; Type: INDEX; Schema: school; Owner: -
--

CREATE INDEX prospective_student_status_idx ON school."ProspectiveStudent" USING btree (status);


--
-- Name: InteractiveQuestion ensure_all_required_fields_trigger; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER ensure_all_required_fields_trigger BEFORE INSERT OR UPDATE ON school."InteractiveQuestion" FOR EACH ROW EXECUTE FUNCTION school.ensure_all_required_fields();


--
-- Name: Profile on_profile_updated; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER on_profile_updated AFTER UPDATE ON school."Profile" FOR EACH ROW EXECUTE FUNCTION school.handle_profile_updates();


--
-- Name: InteractiveQuestion sync_interactive_question_columns_trigger; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER sync_interactive_question_columns_trigger BEFORE INSERT OR UPDATE ON school."InteractiveQuestion" FOR EACH ROW EXECUTE FUNCTION school.sync_interactive_question_columns();


--
-- Name: AcademicYear update_academic_year_updated_at; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER update_academic_year_updated_at BEFORE UPDATE ON school."AcademicYear" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: AdmissionCommunication update_admission_communication_timestamp; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER update_admission_communication_timestamp BEFORE UPDATE ON school."AdmissionCommunication" FOR EACH ROW EXECUTE FUNCTION school.update_admission_communication_timestamp();


--
-- Name: AdmissionProcess update_admission_process_timestamp; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER update_admission_process_timestamp BEFORE UPDATE ON school."AdmissionProcess" FOR EACH ROW EXECUTE FUNCTION school.update_admission_process_timestamp();


--
-- Name: fee_payments update_fee_payments_updated_at; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER update_fee_payments_updated_at BEFORE UPDATE ON school.fee_payments FOR EACH ROW EXECUTE FUNCTION school.update_updated_at_column();


--
-- Name: YearEndFeedback update_feedback_updated_at; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON school."YearEndFeedback" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: ProspectiveStudent update_prospective_student_timestamp; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER update_prospective_student_timestamp BEFORE UPDATE ON school."ProspectiveStudent" FOR EACH ROW EXECUTE FUNCTION school.update_prospective_student_timestamp();


--
-- Name: ClassTransition update_transition_updated_at; Type: TRIGGER; Schema: school; Owner: -
--

CREATE TRIGGER update_transition_updated_at BEFORE UPDATE ON school."ClassTransition" FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: AdmissionCommunication AdmissionCommunication_prospectiveStudentId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionCommunication"
    ADD CONSTRAINT "AdmissionCommunication_prospectiveStudentId_fkey" FOREIGN KEY ("prospectiveStudentId") REFERENCES school."ProspectiveStudent"(id);


--
-- Name: AdmissionCommunication AdmissionCommunication_staffId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionCommunication"
    ADD CONSTRAINT "AdmissionCommunication_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES school."Staff"(id);


--
-- Name: AdmissionProcess AdmissionProcess_approvedBy_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionProcess"
    ADD CONSTRAINT "AdmissionProcess_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES school."Staff"(id);


--
-- Name: AdmissionProcess AdmissionProcess_assignedClassId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionProcess"
    ADD CONSTRAINT "AdmissionProcess_assignedClassId_fkey" FOREIGN KEY ("assignedClassId") REFERENCES school."Class"(id);


--
-- Name: AdmissionProcess AdmissionProcess_prospectiveStudentId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionProcess"
    ADD CONSTRAINT "AdmissionProcess_prospectiveStudentId_fkey" FOREIGN KEY ("prospectiveStudentId") REFERENCES school."ProspectiveStudent"(id);


--
-- Name: AdmissionProcess AdmissionProcess_studentId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."AdmissionProcess"
    ADD CONSTRAINT "AdmissionProcess_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES school."Student"(id);


--
-- Name: ClassTransition ClassTransition_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ClassTransition"
    ADD CONSTRAINT "ClassTransition_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES school."AcademicYear"(id);


--
-- Name: ClassTransition ClassTransition_next_class_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ClassTransition"
    ADD CONSTRAINT "ClassTransition_next_class_id_fkey" FOREIGN KEY (next_class_id) REFERENCES school."Class"(id);


--
-- Name: ClassTransition ClassTransition_previous_class_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ClassTransition"
    ADD CONSTRAINT "ClassTransition_previous_class_id_fkey" FOREIGN KEY (previous_class_id) REFERENCES school."Class"(id);


--
-- Name: ClassTransition ClassTransition_student_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ClassTransition"
    ADD CONSTRAINT "ClassTransition_student_id_fkey" FOREIGN KEY (student_id) REFERENCES school."Student"(id);


--
-- Name: Class Class_schoolId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Class"
    ADD CONSTRAINT "Class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES school."School"(id);


--
-- Name: Classwork Classwork_classId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Classwork"
    ADD CONSTRAINT "Classwork_classId_fkey" FOREIGN KEY ("classId") REFERENCES school."Class"(id);


--
-- Name: CompletionMilestone CompletionMilestone_assignment_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."CompletionMilestone"
    ADD CONSTRAINT "CompletionMilestone_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES school."InteractiveAssignment"(id) ON DELETE CASCADE;


--
-- Name: Fee Fee_studentId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Fee"
    ADD CONSTRAINT "Fee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES school."Student"(id);


--
-- Name: FeedbackCertificate FeedbackCertificate_feedback_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."FeedbackCertificate"
    ADD CONSTRAINT "FeedbackCertificate_feedback_id_fkey" FOREIGN KEY (feedback_id) REFERENCES school."ParentFeedback"(id) ON DELETE CASCADE;


--
-- Name: File File_classworkId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_classworkId_fkey" FOREIGN KEY ("classworkId") REFERENCES school."Classwork"(id);


--
-- Name: File File_feeId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_feeId_fkey" FOREIGN KEY ("feeId") REFERENCES school."Fee"(id);


--
-- Name: File File_grievanceId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_grievanceId_fkey" FOREIGN KEY ("grievanceId") REFERENCES school."Grievance"(id);


--
-- Name: File File_homeworkId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES school."Homework"(id);


--
-- Name: File File_homeworkSubmissionId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_homeworkSubmissionId_fkey" FOREIGN KEY ("homeworkSubmissionId") REFERENCES school."HomeworkSubmission"(id);


--
-- Name: File File_interactiveAssignmentId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_interactiveAssignmentId_fkey" FOREIGN KEY ("interactiveAssignmentId") REFERENCES school."InteractiveAssignment"(id) ON DELETE CASCADE;


--
-- Name: File File_schoolId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."File"
    ADD CONSTRAINT "File_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES school."School"(id);


--
-- Name: Grievance Grievance_studentId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Grievance"
    ADD CONSTRAINT "Grievance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES school."Student"(id);


--
-- Name: HomeworkSubmission HomeworkSubmission_homeworkId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."HomeworkSubmission"
    ADD CONSTRAINT "HomeworkSubmission_homeworkId_fkey" FOREIGN KEY ("homeworkId") REFERENCES school."Homework"(id);


--
-- Name: HomeworkSubmission HomeworkSubmission_studentId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."HomeworkSubmission"
    ADD CONSTRAINT "HomeworkSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES school."Student"(id);


--
-- Name: Homework Homework_classId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Homework"
    ADD CONSTRAINT "Homework_classId_fkey" FOREIGN KEY ("classId") REFERENCES school."Class"(id);


--
-- Name: Homework Homework_subjectId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Homework"
    ADD CONSTRAINT "Homework_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES school."Subject"(id);


--
-- Name: IDCard IDCard_class_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."IDCard"
    ADD CONSTRAINT "IDCard_class_id_fkey" FOREIGN KEY (class_id) REFERENCES school."Class"(id);


--
-- Name: InteractiveAssignment InteractiveAssignment_classId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveAssignment"
    ADD CONSTRAINT "InteractiveAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES school."Class"(id);


--
-- Name: InteractiveAssignment InteractiveAssignment_subjectId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveAssignment"
    ADD CONSTRAINT "InteractiveAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES school."Subject"(id);


--
-- Name: InteractiveQuestion InteractiveQuestion_assignmentId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveQuestion"
    ADD CONSTRAINT "InteractiveQuestion_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES school."InteractiveAssignment"(id) ON DELETE CASCADE;


--
-- Name: InteractiveResponse InteractiveResponse_question_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveResponse"
    ADD CONSTRAINT "InteractiveResponse_question_id_fkey" FOREIGN KEY (question_id) REFERENCES school."InteractiveQuestion"(id);


--
-- Name: InteractiveResponse InteractiveResponse_submission_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveResponse"
    ADD CONSTRAINT "InteractiveResponse_submission_id_fkey" FOREIGN KEY (submission_id) REFERENCES school."InteractiveSubmission"(id) ON DELETE CASCADE;


--
-- Name: InteractiveSubmission InteractiveSubmission_assignment_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveSubmission"
    ADD CONSTRAINT "InteractiveSubmission_assignment_id_fkey" FOREIGN KEY (assignment_id) REFERENCES school."InteractiveAssignment"(id) ON DELETE CASCADE;


--
-- Name: InteractiveSubmission InteractiveSubmission_student_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."InteractiveSubmission"
    ADD CONSTRAINT "InteractiveSubmission_student_id_fkey" FOREIGN KEY (student_id) REFERENCES school."Student"(id);


--
-- Name: NotificationStudents NotificationStudents_notificationid_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."NotificationStudents"
    ADD CONSTRAINT "NotificationStudents_notificationid_fkey" FOREIGN KEY (notificationid) REFERENCES school."Notification"(id);


--
-- Name: NotificationStudents NotificationStudents_studentid_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."NotificationStudents"
    ADD CONSTRAINT "NotificationStudents_studentid_fkey" FOREIGN KEY (studentid) REFERENCES school."Student"(id);


--
-- Name: Notification Notification_classId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Notification"
    ADD CONSTRAINT "Notification_classId_fkey" FOREIGN KEY ("classId") REFERENCES school."Class"(id);


--
-- Name: Notification Notification_studentId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Notification"
    ADD CONSTRAINT "Notification_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES school."Student"(id);


--
-- Name: ParentFeedback ParentFeedback_class_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ParentFeedback"
    ADD CONSTRAINT "ParentFeedback_class_id_fkey" FOREIGN KEY (class_id) REFERENCES school."Class"(id);


--
-- Name: ParentFeedback ParentFeedback_created_by_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ParentFeedback"
    ADD CONSTRAINT "ParentFeedback_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: ParentSubmittedFeedback ParentSubmittedFeedback_class_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ParentSubmittedFeedback"
    ADD CONSTRAINT "ParentSubmittedFeedback_class_id_fkey" FOREIGN KEY (class_id) REFERENCES school."Class"(id);


--
-- Name: Profile Profile_user_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Profile"
    ADD CONSTRAINT "Profile_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: ProspectiveStudent ProspectiveStudent_assignedTo_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ProspectiveStudent"
    ADD CONSTRAINT "ProspectiveStudent_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES school."Staff"(id);


--
-- Name: ProspectiveStudent ProspectiveStudent_schoolId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."ProspectiveStudent"
    ADD CONSTRAINT "ProspectiveStudent_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES school."School"(id);


--
-- Name: Staff Staff_schoolId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Staff"
    ADD CONSTRAINT "Staff_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES school."School"(id);


--
-- Name: Staff Staff_user_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Staff"
    ADD CONSTRAINT "Staff_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: StudentProgressAnalytics StudentProgressAnalytics_student_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."StudentProgressAnalytics"
    ADD CONSTRAINT "StudentProgressAnalytics_student_id_fkey" FOREIGN KEY (student_id) REFERENCES school."Student"(id);


--
-- Name: Student Student_classId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Student"
    ADD CONSTRAINT "Student_classId_fkey" FOREIGN KEY ("classId") REFERENCES school."Class"(id);


--
-- Name: Student Student_user_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Student"
    ADD CONSTRAINT "Student_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: Subject Subject_classId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Subject"
    ADD CONSTRAINT "Subject_classId_fkey" FOREIGN KEY ("classId") REFERENCES school."Class"(id);


--
-- Name: Subject Subject_teacherId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."Subject"
    ADD CONSTRAINT "Subject_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES school."Staff"(id);


--
-- Name: TimeTable TimeTable_classId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."TimeTable"
    ADD CONSTRAINT "TimeTable_classId_fkey" FOREIGN KEY ("classId") REFERENCES school."Class"(id);


--
-- Name: TimeTable TimeTable_subjectId_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."TimeTable"
    ADD CONSTRAINT "TimeTable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES school."Subject"(id);


--
-- Name: YearEndFeedback YearEndFeedback_academic_year_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."YearEndFeedback"
    ADD CONSTRAINT "YearEndFeedback_academic_year_id_fkey" FOREIGN KEY (academic_year_id) REFERENCES school."AcademicYear"(id);


--
-- Name: YearEndFeedback YearEndFeedback_student_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school."YearEndFeedback"
    ADD CONSTRAINT "YearEndFeedback_student_id_fkey" FOREIGN KEY (student_id) REFERENCES school."Student"(id);


--
-- Name: anonymoususerprogress anonymoususerprogress_user_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.anonymoususerprogress
    ADD CONSTRAINT anonymoususerprogress_user_id_fkey FOREIGN KEY (user_id) REFERENCES school.anonymoususer(id);


--
-- Name: birthday_messages birthday_messages_student_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.birthday_messages
    ADD CONSTRAINT birthday_messages_student_id_fkey FOREIGN KEY (student_id) REFERENCES school.idcard(id) ON DELETE CASCADE;


--
-- Name: fee_history_update fee_history_update_fee_payment_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.fee_history_update
    ADD CONSTRAINT fee_history_update_fee_payment_id_fkey FOREIGN KEY (fee_payment_id) REFERENCES school.fee_payments(id) ON DELETE CASCADE;


--
-- Name: fee_payments fee_payments_student_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.fee_payments
    ADD CONSTRAINT fee_payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES school."IDCard"(id) ON DELETE CASCADE;


--
-- Name: feedback_replies feedback_replies_feedback_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.feedback_replies
    ADD CONSTRAINT feedback_replies_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES school.feedback(id);


--
-- Name: idcard idcard_class_id_fkey; Type: FK CONSTRAINT; Schema: school; Owner: -
--

ALTER TABLE ONLY school.idcard
    ADD CONSTRAINT idcard_class_id_fkey FOREIGN KEY (class_id) REFERENCES school."Class"(id);


--
-- Name: AcademicYear; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."AcademicYear" ENABLE ROW LEVEL SECURITY;

--
-- Name: AdmissionCommunication; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."AdmissionCommunication" ENABLE ROW LEVEL SECURITY;

--
-- Name: FeedbackCertificate Allow admins to manage certificates; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow admins to manage certificates" ON school."FeedbackCertificate" TO authenticated USING ((auth.uid() IN ( SELECT "Profile".user_id
   FROM school."Profile"
  WHERE ("Profile".role = 'ADMIN'::text)))) WITH CHECK ((auth.uid() IN ( SELECT "Profile".user_id
   FROM school."Profile"
  WHERE ("Profile".role = 'ADMIN'::text))));


--
-- Name: ParentFeedback Allow admins to manage feedback; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow admins to manage feedback" ON school."ParentFeedback" TO authenticated USING ((auth.uid() IN ( SELECT "Profile".user_id
   FROM school."Profile"
  WHERE ("Profile".role = 'ADMIN'::text)))) WITH CHECK ((auth.uid() IN ( SELECT "Profile".user_id
   FROM school."Profile"
  WHERE ("Profile".role = 'ADMIN'::text))));


--
-- Name: ParentSubmittedFeedback Allow admins to manage parent submitted feedback; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow admins to manage parent submitted feedback" ON school."ParentSubmittedFeedback" TO authenticated USING ((auth.uid() IN ( SELECT "Profile".user_id
   FROM school."Profile"
  WHERE ("Profile".role = 'ADMIN'::text)))) WITH CHECK ((auth.uid() IN ( SELECT "Profile".user_id
   FROM school."Profile"
  WHERE ("Profile".role = 'ADMIN'::text))));


--
-- Name: Class Allow all access to Class; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow all access to Class" ON school."Class" TO authenticated, anon USING (true) WITH CHECK (true);


--
-- Name: IDCard Allow all access to IDCard; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow all access to IDCard" ON school."IDCard" TO authenticated, anon USING (true) WITH CHECK (true);


--
-- Name: fee_payments Allow all access to fee_payments; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow all access to fee_payments" ON school.fee_payments TO authenticated, anon USING (true) WITH CHECK (true);


--
-- Name: Class Allow anonymous read access; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow anonymous read access" ON school."Class" FOR SELECT USING (true);


--
-- Name: InteractiveAssignment Allow anonymous read access; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow anonymous read access" ON school."InteractiveAssignment" FOR SELECT USING (true);


--
-- Name: InteractiveQuestion Allow anonymous read access; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow anonymous read access" ON school."InteractiveQuestion" FOR SELECT USING (true);


--
-- Name: Subject Allow anonymous read access; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow anonymous read access" ON school."Subject" FOR SELECT USING (true);


--
-- Name: InteractiveAssignment Allow authenticated users to delete from InteractiveAssignment; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to delete from InteractiveAssignment" ON school."InteractiveAssignment" FOR DELETE TO authenticated USING (true);


--
-- Name: InteractiveQuestion Allow authenticated users to delete from InteractiveQuestion; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to delete from InteractiveQuestion" ON school."InteractiveQuestion" FOR DELETE TO authenticated USING (true);


--
-- Name: InteractiveResponse Allow authenticated users to delete from InteractiveResponse; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to delete from InteractiveResponse" ON school."InteractiveResponse" FOR DELETE TO authenticated USING (true);


--
-- Name: InteractiveSubmission Allow authenticated users to delete from InteractiveSubmission; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to delete from InteractiveSubmission" ON school."InteractiveSubmission" FOR DELETE TO authenticated USING (true);


--
-- Name: InteractiveAssignment Allow authenticated users to insert into InteractiveAssignment; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to insert into InteractiveAssignment" ON school."InteractiveAssignment" FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: InteractiveQuestion Allow authenticated users to insert into InteractiveQuestion; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to insert into InteractiveQuestion" ON school."InteractiveQuestion" FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: InteractiveResponse Allow authenticated users to insert into InteractiveResponse; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to insert into InteractiveResponse" ON school."InteractiveResponse" FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: InteractiveSubmission Allow authenticated users to insert into InteractiveSubmission; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to insert into InteractiveSubmission" ON school."InteractiveSubmission" FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: InteractiveAssignment Allow authenticated users to select from InteractiveAssignment; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to select from InteractiveAssignment" ON school."InteractiveAssignment" FOR SELECT TO authenticated USING (true);


--
-- Name: InteractiveQuestion Allow authenticated users to select from InteractiveQuestion; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to select from InteractiveQuestion" ON school."InteractiveQuestion" FOR SELECT TO authenticated USING (true);


--
-- Name: InteractiveResponse Allow authenticated users to select from InteractiveResponse; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to select from InteractiveResponse" ON school."InteractiveResponse" FOR SELECT TO authenticated USING (true);


--
-- Name: InteractiveSubmission Allow authenticated users to select from InteractiveSubmission; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to select from InteractiveSubmission" ON school."InteractiveSubmission" FOR SELECT TO authenticated USING (true);


--
-- Name: InteractiveAssignment Allow authenticated users to update InteractiveAssignment; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to update InteractiveAssignment" ON school."InteractiveAssignment" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: InteractiveQuestion Allow authenticated users to update InteractiveQuestion; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to update InteractiveQuestion" ON school."InteractiveQuestion" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: InteractiveResponse Allow authenticated users to update InteractiveResponse; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to update InteractiveResponse" ON school."InteractiveResponse" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: InteractiveSubmission Allow authenticated users to update InteractiveSubmission; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow authenticated users to update InteractiveSubmission" ON school."InteractiveSubmission" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: ProspectiveStudent Allow public to create prospective student entries; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow public to create prospective student entries" ON school."ProspectiveStudent" FOR INSERT TO anon WITH CHECK (true);


--
-- Name: ParentSubmittedFeedback Allow public to submit feedback; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow public to submit feedback" ON school."ParentSubmittedFeedback" FOR INSERT WITH CHECK (true);


--
-- Name: FeedbackCertificate Allow public to view certificates; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow public to view certificates" ON school."FeedbackCertificate" FOR SELECT USING (true);


--
-- Name: ParentFeedback Allow public to view feedback; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow public to view feedback" ON school."ParentFeedback" FOR SELECT USING (true);


--
-- Name: AdmissionCommunication Allow staff to manage admission communication; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow staff to manage admission communication" ON school."AdmissionCommunication" TO authenticated USING ((EXISTS ( SELECT 1
   FROM school."Staff" s
  WHERE (s.email = (auth.jwt() ->> 'email'::text)))));


--
-- Name: AdmissionProcess Allow staff to manage admission process; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow staff to manage admission process" ON school."AdmissionProcess" TO authenticated USING ((EXISTS ( SELECT 1
   FROM school."Staff" s
  WHERE ((s.email = (auth.jwt() ->> 'email'::text)) AND ((s.role = 'ADMIN'::school."StaffRole") OR (s.role = 'PRINCIPAL'::school."StaffRole"))))));


--
-- Name: ProspectiveStudent Allow staff to update prospective students; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow staff to update prospective students" ON school."ProspectiveStudent" FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM school."Staff" s
  WHERE (s.email = (auth.jwt() ->> 'email'::text)))));


--
-- Name: ProspectiveStudent Allow staff to view prospective students; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Allow staff to view prospective students" ON school."ProspectiveStudent" FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM school."Staff" s
  WHERE (s.email = (auth.jwt() ->> 'email'::text)))));


--
-- Name: ClassTransition; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."ClassTransition" ENABLE ROW LEVEL SECURITY;

--
-- Name: CompletionMilestone; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."CompletionMilestone" ENABLE ROW LEVEL SECURITY;

--
-- Name: IDCard Enable all operations for anonymous users on IDCard; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable all operations for anonymous users on IDCard" ON school."IDCard" TO anon USING (true) WITH CHECK (true);


--
-- Name: fee_payments Enable all operations for anonymous users on fee_payments; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable all operations for anonymous users on fee_payments" ON school.fee_payments TO anon USING (true) WITH CHECK (true);


--
-- Name: IDCard Enable all operations for authenticated users on IDCard; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable all operations for authenticated users on IDCard" ON school."IDCard" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: fee_payments Enable all operations for authenticated users on fee_payments; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable all operations for authenticated users on fee_payments" ON school.fee_payments TO authenticated USING (true) WITH CHECK (true);


--
-- Name: YearEndFeedback Enable insert for authenticated users only; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON school."YearEndFeedback" FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: ClassTransition Enable insert/update for authenticated users only; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable insert/update for authenticated users only" ON school."ClassTransition" TO authenticated USING (true) WITH CHECK (true);


--
-- Name: AcademicYear Enable read access for all users; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable read access for all users" ON school."AcademicYear" FOR SELECT USING (true);


--
-- Name: ClassTransition Enable read access for all users; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable read access for all users" ON school."ClassTransition" FOR SELECT USING (true);


--
-- Name: YearEndFeedback Enable read access for all users; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable read access for all users" ON school."YearEndFeedback" FOR SELECT USING (true);


--
-- Name: YearEndFeedback Enable update for authenticated users only; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY "Enable update for authenticated users only" ON school."YearEndFeedback" FOR UPDATE TO authenticated USING (true);


--
-- Name: FeedbackCertificate; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."FeedbackCertificate" ENABLE ROW LEVEL SECURITY;

--
-- Name: FeedbackTemplate; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."FeedbackTemplate" ENABLE ROW LEVEL SECURITY;

--
-- Name: InteractiveAssignment; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."InteractiveAssignment" ENABLE ROW LEVEL SECURITY;

--
-- Name: InteractiveQuestion; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."InteractiveQuestion" ENABLE ROW LEVEL SECURITY;

--
-- Name: InteractiveResponse; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."InteractiveResponse" ENABLE ROW LEVEL SECURITY;

--
-- Name: InteractiveSubmission; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."InteractiveSubmission" ENABLE ROW LEVEL SECURITY;

--
-- Name: ParentFeedback; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."ParentFeedback" ENABLE ROW LEVEL SECURITY;

--
-- Name: ParentSubmittedFeedback; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."ParentSubmittedFeedback" ENABLE ROW LEVEL SECURITY;

--
-- Name: StudentProgressAnalytics; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."StudentProgressAnalytics" ENABLE ROW LEVEL SECURITY;

--
-- Name: YearEndFeedback; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school."YearEndFeedback" ENABLE ROW LEVEL SECURITY;

--
-- Name: CompletionMilestone completion_milestone_select_policy; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY completion_milestone_select_policy ON school."CompletionMilestone" FOR SELECT USING ((( SELECT auth.uid() AS uid) IN ( SELECT "Profile".user_id
   FROM school."Profile"
  WHERE ("Profile".role = ANY (ARRAY['ADMIN'::text, 'TEACHER'::text])))));


--
-- Name: fee_payments; Type: ROW SECURITY; Schema: school; Owner: -
--

ALTER TABLE school.fee_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: ParentSubmittedFeedback parent_feedback_delete_auth_policy; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY parent_feedback_delete_auth_policy ON school."ParentSubmittedFeedback" FOR DELETE TO authenticated USING (true);


--
-- Name: ParentSubmittedFeedback parent_feedback_insert_policy; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY parent_feedback_insert_policy ON school."ParentSubmittedFeedback" FOR INSERT TO anon WITH CHECK (true);


--
-- Name: ParentSubmittedFeedback parent_feedback_select_auth_policy; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY parent_feedback_select_auth_policy ON school."ParentSubmittedFeedback" FOR SELECT TO authenticated USING (true);


--
-- Name: ParentSubmittedFeedback parent_feedback_select_policy; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY parent_feedback_select_policy ON school."ParentSubmittedFeedback" FOR SELECT TO anon USING (true);


--
-- Name: ParentSubmittedFeedback parent_feedback_update_auth_policy; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY parent_feedback_update_auth_policy ON school."ParentSubmittedFeedback" FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: ParentSubmittedFeedback parent_feedback_update_policy; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY parent_feedback_update_policy ON school."ParentSubmittedFeedback" FOR UPDATE TO anon USING (true) WITH CHECK (true);


--
-- Name: StudentProgressAnalytics student_analytics_select_policy; Type: POLICY; Schema: school; Owner: -
--

CREATE POLICY student_analytics_select_policy ON school."StudentProgressAnalytics" FOR SELECT USING ((( SELECT auth.uid() AS uid) IN ( SELECT "Profile".user_id
   FROM school."Profile"
  WHERE ("Profile".role = ANY (ARRAY['ADMIN'::text, 'TEACHER'::text])))));


--
-- PostgreSQL database dump complete
--

\unrestrict WWDvzgeiZJy9bkTmDEEoUjKbfPchbXxtba2RfW8WmTQTJa6UMSFVVYzJnN9cC6i

