-- Sample data for ProspectiveStudent
INSERT INTO school.ProspectiveStudent (
    id, 
    studentName, 
    parentName, 
    email, 
    contactNumber, 
    gradeApplying, 
    gender, 
    dateOfBirth, 
    address, 
    status,
    appliedDate,
    lastUpdateDate
) VALUES 
(
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'John Smith',
    'Michael Smith',
    'michael.smith@email.com',
    '9876543210',
    'Grade 6',
    'Male',
    '2012-05-15',
    '123 Main Street, City',
    'NEW',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'b47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Sarah Johnson',
    'Robert Johnson',
    'robert.johnson@email.com',
    '9876543211',
    'Grade 3',
    'Female',
    '2015-08-20',
    '456 Oak Avenue, City',
    'IN_REVIEW',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP
),
(
    'a47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Emily Brown',
    'David Brown',
    'david.brown@email.com',
    '9876543212',
    'Grade 8',
    'Female',
    '2010-03-10',
    '789 Pine Road, City',
    'SCHEDULED_INTERVIEW',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP
);

-- Sample data for AdmissionProcess
INSERT INTO school.AdmissionProcess (
    id,
    prospectiveStudentId,
    documentsRequired,
    createdAt,
    updatedAt
) VALUES 
(
    'c47ac10b-58cc-4372-a567-0e02b2c3d482',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    '{
        "required": ["birth_certificate", "transfer_certificate", "report_card", "medical_records", "address_proof", "photographs"],
        "submitted": [],
        "verificationStatus": {
            "birth_certificate": "pending",
            "transfer_certificate": "pending",
            "report_card": "pending",
            "medical_records": "pending",
            "address_proof": "pending",
            "photographs": "pending"
        }
    }',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'd47ac10b-58cc-4372-a567-0e02b2c3d483',
    'b47ac10b-58cc-4372-a567-0e02b2c3d480',
    '{
        "required": ["birth_certificate", "transfer_certificate", "report_card", "medical_records", "address_proof", "photographs"],
        "submitted": ["birth_certificate", "photographs"],
        "verificationStatus": {
            "birth_certificate": "verified",
            "transfer_certificate": "pending",
            "report_card": "pending",
            "medical_records": "pending",
            "address_proof": "pending",
            "photographs": "verified"
        }
    }',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP
),
(
    'e47ac10b-58cc-4372-a567-0e02b2c3d484',
    'a47ac10b-58cc-4372-a567-0e02b2c3d481',
    '{
        "required": ["birth_certificate", "transfer_certificate", "report_card", "medical_records", "address_proof", "photographs"],
        "submitted": ["birth_certificate", "transfer_certificate", "photographs", "address_proof"],
        "verificationStatus": {
            "birth_certificate": "verified",
            "transfer_certificate": "verified",
            "report_card": "pending",
            "medical_records": "pending",
            "address_proof": "verified",
            "photographs": "verified"
        }
    }',
    CURRENT_TIMESTAMP - INTERVAL '5 days',
    CURRENT_TIMESTAMP
);

-- Sample data for AdmissionNotes
INSERT INTO school.AdmissionNotes (
    id,
    prospectiveStudentId,
    content,
    createdBy,
    createdAt
) VALUES 
(
    'ff7ac10b-58cc-4372-a567-0e02b2c3d485',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'Initial application received. Documents pending.',
    'Admin',
    CURRENT_TIMESTAMP
),
(
    'ff7ac10b-58cc-4372-a567-0e02b2c3d486',
    'b47ac10b-58cc-4372-a567-0e02b2c3d480',
    'Birth certificate and photographs verified. Awaiting remaining documents.',
    'Admin',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
),
(
    'ff7ac10b-58cc-4372-a567-0e02b2c3d487',
    'a47ac10b-58cc-4372-a567-0e02b2c3d481',
    'Interview scheduled for next week. Most documents verified.',
    'Admin',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
);
