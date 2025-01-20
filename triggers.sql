-- Function to generate sequential admission number
CREATE OR REPLACE FUNCTION school.generate_admission_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION school.handle_new_user_registration()
RETURNS TRIGGER AS $$
DECLARE
    new_student_id TEXT;
    class_id TEXT;
BEGIN
    -- Get default class ID (you might want to adjust this logic)
    SELECT id INTO class_id FROM school."Class" LIMIT 1;

    -- Generate new student ID
    new_student_id := 'STU' || TO_CHAR(CURRENT_TIMESTAMP, 'YYMMDD') || 
                     LPAD(CAST((random() * 999 + 1) AS INTEGER)::TEXT, 3, '0');

    -- Insert Profile record
    INSERT INTO school."Profile" (
        id,
        user_id,
        role,
        full_name
    ) VALUES (
        new_student_id,
        NEW.id,
        'STUDENT',
        NEW.raw_user_meta_data->>'full_name'
    );

    -- Insert Student record
    INSERT INTO school."Student" (
        id,
        "admissionNumber",
        name,
        "dateOfBirth",
        gender,
        address,
        "contactNumber",
        "parentName",
        "parentContact",
        "parentEmail",
        "classId",
        "createdAt",
        "updatedAt"
    ) VALUES (
        new_student_id,
        school.generate_admission_number(),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Student'),
        COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::timestamp, CURRENT_TIMESTAMP),
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

    -- Insert UserSettings record
    INSERT INTO school."UserSettings" (
        user_id,
        theme,
        notifications_enabled,
        email_notifications
    ) VALUES (
        NEW.id,
        'light',
        true,
        true
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION school.handle_new_user_registration();

-- Function to update student details when profile is updated
CREATE OR REPLACE FUNCTION school.handle_profile_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- Update student record when profile changes
    UPDATE school."Student"
    SET 
        name = NEW.full_name,
        "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS on_profile_updated ON school."Profile";
CREATE TRIGGER on_profile_updated
    AFTER UPDATE ON school."Profile"
    FOR EACH ROW
    EXECUTE FUNCTION school.handle_profile_updates();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION school.handle_new_user_registration() TO service_role;
GRANT EXECUTE ON FUNCTION school.handle_profile_updates() TO authenticated;
GRANT EXECUTE ON FUNCTION school.generate_admission_number() TO authenticated;
