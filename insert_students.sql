-- Insert Student Records
INSERT INTO school."Student" (
    id, "admissionNumber", name, "dateOfBirth", gender, address,
    "contactNumber", "parentName", "parentContact", "parentEmail",
    "bloodGroup", "classId", "createdAt", "updatedAt"
) VALUES
('STU301', 'ADM2024101', 'Atiksh', '2024-01-01', 'Male', 'Address 1', '+91-1234567890', 'Parent 1', '+91-1234567891', 'parent1@email.com', 'O+', 'LKG', NOW(), NOW()),
('STU302', 'ADM2024102', 'Diyanshi', '2024-01-01', 'Female', 'Address 2', '+91-1234567892', 'Parent 2', '+91-1234567893', 'parent2@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU303', 'ADM2024103', 'Shanvi Sharma', '2024-03-21', 'Female', 'Address 3', '+91-1234567894', 'Parent 3', '+91-1234567895', 'parent3@email.com', 'B+', 'LKG', NOW(), NOW()),
('STU304', 'ADM2024104', 'Vanika Yadav', '2024-03-22', 'Female', 'Address 4', '+91-1234567896', 'Parent 4', '+91-1234567897', 'parent4@email.com', 'AB+', 'Nur', NOW(), NOW()),
('STU305', 'ADM2024105', 'Ishan Kumar', '2024-03-23', 'Male', 'Address 5', '+91-1234567898', 'Parent 5', '+91-1234567899', 'parent5@email.com', 'O-', 'Nur', NOW(), NOW()),
('STU306', 'ADM2024106', 'Niharika', '2024-01-01', 'Female', 'Address 6', '+91-1234567800', 'Parent 6', '+91-1234567801', 'parent6@email.com', 'A-', 'LKG', NOW(), NOW()),
('STU307', 'ADM2024107', 'Maadhav Chauhan', '2024-01-01', 'Male', 'Address 7', '+91-1234567802', 'Parent 7', '+91-1234567803', 'parent7@email.com', 'B+', 'Nur', NOW(), NOW()),
('STU308', 'ADM2024108', 'Shivansh Thakur', '2024-03-27', 'Male', 'Address 8', '+91-1234567804', 'Parent 8', '+91-1234567805', 'parent8@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU309', 'ADM2024109', 'Akshit Rathor', '2024-03-27', 'Male', 'Address 9', '+91-1234567806', 'Parent 9', '+91-1234567807', 'parent9@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU310', 'ADM2024110', 'Sargun Kaur', '2024-03-27', 'Female', 'Address 10', '+91-1234567808', 'Parent 10', '+91-1234567809', 'parent10@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU311', 'ADM2024111', 'Ayush Raj Soni', '2024-03-28', 'Male', 'Address 11', '+91-1234567810', 'Parent 11', '+91-1234567811', 'parent11@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU312', 'ADM2024112', 'Kartik', '2024-03-29', 'Male', 'Address 12', '+91-1234567812', 'Parent 12', '+91-1234567813', 'parent12@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU313', 'ADM2024113', 'Ishank Saini', '2024-03-30', 'Male', 'Address 13', '+91-1234567814', 'Parent 13', '+91-1234567815', 'parent13@email.com', 'B+', 'Pre', NOW(), NOW()),
('STU314', 'ADM2024114', 'Aniket Jaiswal', '2024-04-01', 'Male', 'Address 14', '+91-1234567816', 'Parent 14', '+91-1234567817', 'parent14@email.com', 'O-', 'Nur', NOW(), NOW()),
('STU315', 'ADM2024115', 'Vivaan Singh', '2024-04-01', 'Male', 'Address 15', '+91-1234567818', 'Parent 15', '+91-1234567819', 'parent15@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU316', 'ADM2024116', 'Ahvan', '2024-04-01', 'Male', 'Address 16', '+91-1234567820', 'Parent 16', '+91-1234567821', 'parent16@email.com', 'B+', 'Nur', NOW(), NOW()),
('STU317', 'ADM2024117', 'Abdul', '2024-04-01', 'Male', 'Address 17', '+91-1234567822', 'Parent 17', '+91-1234567823', 'parent17@email.com', 'O+', 'LKG', NOW(), NOW()),
('STU318', 'ADM2024118', 'Aayesha', '2024-04-02', 'Female', 'Address 18', '+91-1234567824', 'Parent 18', '+91-1234567825', 'parent18@email.com', 'A-', 'Nur', NOW(), NOW()),
('STU319', 'ADM2024119', 'Satvik Kumar', '2024-04-02', 'Male', 'Address 19', '+91-1234567826', 'Parent 19', '+91-1234567827', 'parent19@email.com', 'B+', 'UKG', NOW(), NOW()),
('STU320', 'ADM2024120', 'Atharav', '2024-04-02', 'Male', 'Address 20', '+91-1234567828', 'Parent 20', '+91-1234567829', 'parent20@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU321', 'ADM2024121', 'Vedank Pandit', '2024-04-02', 'Male', 'Address 21', '+91-1234567830', 'Parent 21', '+91-1234567831', 'parent21@email.com', 'A+', 'LKG', NOW(), NOW()),
('STU322', 'ADM2024122', 'Shivnash', '2024-04-02', 'Male', 'Address 22', '+91-1234567832', 'Parent 22', '+91-1234567833', 'parent22@email.com', 'B-', 'Pre', NOW(), NOW()),
('STU323', 'ADM2024123', 'Raj Sharma', '2024-04-03', 'Male', 'Address 23', '+91-1234567834', 'Parent 23', '+91-1234567835', 'parent23@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU324', 'ADM2024124', 'Demira', '2024-04-03', 'Female', 'Address 24', '+91-1234567836', 'Parent 24', '+91-1234567837', 'parent24@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU325', 'ADM2024125', 'Jatin Rawat', '2024-04-03', 'Male', 'Address 25', '+91-1234567838', 'Parent 25', '+91-1234567839', 'parent25@email.com', 'B+', 'Nur', NOW(), NOW()),
('STU326', 'ADM2024126', 'Ronit', '2024-04-03', 'Male', 'Address 26', '+91-1234567840', 'Parent 26', '+91-1234567841', 'parent26@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU327', 'ADM2024127', 'Aditya', '2024-04-04', 'Male', 'Address 27', '+91-1234567842', 'Parent 27', '+91-1234567843', 'parent27@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU328', 'ADM2024128', 'Divyanshi Das', '2024-04-04', 'Female', 'Address 28', '+91-1234567844', 'Parent 28', '+91-1234567845', 'parent28@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU329', 'ADM2024129', 'Pranav Vashith', '2024-04-04', 'Male', 'Address 29', '+91-1234567846', 'Parent 29', '+91-1234567847', 'parent29@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU330', 'ADM2024130', 'Riyanshi', '2024-04-04', 'Female', 'Address 30', '+91-1234567848', 'Parent 30', '+91-1234567849', 'parent30@email.com', 'A+', 'LKG', NOW(), NOW()),
('STU331', 'ADM2024131', 'Anvika', '2024-04-05', 'Female', 'Address 31', '+91-1234567850', 'Parent 31', '+91-1234567851', 'parent31@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU332', 'ADM2024132', 'Bhuvika', '2024-04-05', 'Female', 'Address 32', '+91-1234567852', 'Parent 32', '+91-1234567853', 'parent32@email.com', 'O+', 'LKG', NOW(), NOW()),
('STU333', 'ADM2024133', 'Inayat Praveen', '2024-04-06', 'Male', 'Address 33', '+91-1234567854', 'Parent 33', '+91-1234567855', 'parent33@email.com', 'A+', 'LKG', NOW(), NOW()),
('STU334', 'ADM2024134', 'Emica', '2024-04-06', 'Female', 'Address 34', '+91-1234567856', 'Parent 34', '+91-1234567857', 'parent34@email.com', 'B-', 'Pre', NOW(), NOW()),
('STU335', 'ADM2024135', 'Shavni Sharma', '2024-04-05', 'Female', 'Address 35', '+91-1234567858', 'Parent 35', '+91-1234567859', 'parent35@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU336', 'ADM2024136', 'Raunak Kumar Thakur', '2024-04-08', 'Male', 'Address 36', '+91-1234567860', 'Parent 36', '+91-1234567861', 'parent36@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU337', 'ADM2024137', 'Anaya Yadav', '2024-04-07', 'Female', 'Address 37', '+91-1234567862', 'Parent 37', '+91-1234567863', 'parent37@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU338', 'ADM2024138', 'Lakshya Parashar', '2024-04-08', 'Male', 'Address 38', '+91-1234567864', 'Parent 38', '+91-1234567865', 'parent38@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU339', 'ADM2024139', 'Atiksha', '2024-04-08', 'Female', 'Address 39', '+91-1234567866', 'Parent 39', '+91-1234567867', 'parent39@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU340', 'ADM2024140', 'Shivansh Kaushik', '2024-01-01', 'Male', 'Address 40', '+91-1234567868', 'Parent 40', '+91-1234567869', 'parent40@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU341', 'ADM2024141', 'Harshita', '2024-01-01', 'Female', 'Address 41', '+91-1234567870', 'Parent 41', '+91-1234567871', 'parent41@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU342', 'ADM2024142', 'Kairav Tomar', '2024-01-01', 'Male', 'Address 42', '+91-1234567872', 'Parent 42', '+91-1234567873', 'parent42@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU343', 'ADM2024143', 'Aarohi Gupta', '2024-01-01', 'Female', 'Address 43', '+91-1234567874', 'Parent 43', '+91-1234567875', 'parent43@email.com', 'B-', 'LKG', NOW(), NOW()),
('STU344', 'ADM2024144', 'Bhumi', '2024-04-10', 'Female', 'Address 44', '+91-1234567876', 'Parent 44', '+91-1234567877', 'parent44@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU345', 'ADM2024145', 'Daisy', '2024-01-01', 'Female', 'Address 45', '+91-1234567878', 'Parent 45', '+91-1234567879', 'parent45@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU346', 'ADM2024146', 'Dhairya', '2024-01-01', 'Male', 'Address 46', '+91-1234567880', 'Parent 46', '+91-1234567881', 'parent46@email.com', 'B-', 'Pre', NOW(), NOW()),
('STU347', 'ADM2024147', 'Kartik', '2024-01-01', 'Male', 'Address 47', '+91-1234567882', 'Parent 47', '+91-1234567883', 'parent47@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU348', 'ADM2024148', 'Akshay Pal', '2024-04-10', 'Male', 'Address 48', '+91-1234567884', 'Parent 48', '+91-1234567885', 'parent48@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU349', 'ADM2024149', 'Kartik Rathor', '2024-04-10', 'Male', 'Address 49', '+91-1234567886', 'Parent 49', '+91-1234567887', 'parent49@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU350', 'ADM2024150', 'Yashika', '2024-04-10', 'Female', 'Address 50', '+91-1234567888', 'Parent 50', '+91-1234567889', 'parent50@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU351', 'ADM2024151', 'Advait', '2024-01-01', 'Male', 'Address 51', '+91-1234567890', 'Parent 51', '+91-1234567891', 'parent51@email.com', 'A+', 'LKG', NOW(), NOW()),
('STU352', 'ADM2024152', 'Bhavya', '2024-04-11', 'Female', 'Address 52', '+91-1234567892', 'Parent 52', '+91-1234567893', 'parent52@email.com', 'B-', 'Pre', NOW(), NOW()),
('STU353', 'ADM2024153', 'Prisha', '2024-04-15', 'Female', 'Address 53', '+91-1234567894', 'Parent 53', '+91-1234567895', 'parent53@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU354', 'ADM2024154', 'Ansh Kumar', '2024-04-15', 'Male', 'Address 54', '+91-1234567896', 'Parent 54', '+91-1234567897', 'parent54@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU355', 'ADM2024155', 'Nischay', '2024-04-15', 'Male', 'Address 55', '+91-1234567898', 'Parent 55', '+91-1234567899', 'parent55@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU356', 'ADM2024156', 'Prince Nagyan', '2024-04-21', 'Male', 'Address 56', '+91-1234567800', 'Parent 56', '+91-1234567801', 'parent56@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU357', 'ADM2024157', 'Ankur Kumar Singh', '2024-01-01', 'Male', 'Address 57', '+91-1234567802', 'Parent 57', '+91-1234567803', 'parent57@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU358', 'ADM2024158', 'Avan', '2024-04-23', 'Male', 'Address 58', '+91-1234567804', 'Parent 58', '+91-1234567805', 'parent58@email.com', 'B-', 'LKG', NOW(), NOW()),
('STU359', 'ADM2024159', 'Garima', '2024-04-23', 'Female', 'Address 59', '+91-1234567806', 'Parent 59', '+91-1234567807', 'parent59@email.com', 'O+', 'LKG', NOW(), NOW()),
('STU360', 'ADM2024160', 'Yashi', '2024-04-23', 'Female', 'Address 60', '+91-1234567808', 'Parent 60', '+91-1234567809', 'parent60@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU361', 'ADM2024161', 'Harshit Raj', '2024-04-24', 'Male', 'Address 61', '+91-1234567810', 'Parent 61', '+91-1234567811', 'parent61@email.com', 'B-', 'LKG', NOW(), NOW()),
('STU362', 'ADM2024162', 'Priyansh Thapa', '2024-04-24', 'Male', 'Address 62', '+91-1234567812', 'Parent 62', '+91-1234567813', 'parent62@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU363', 'ADM2024163', 'Ansh Rawat', '2024-04-29', 'Male', 'Address 63', '+91-1234567814', 'Parent 63', '+91-1234567815', 'parent63@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU364', 'ADM2024164', 'Keerti Kumari', '2024-05-01', 'Female', 'Address 64', '+91-1234567816', 'Parent 64', '+91-1234567817', 'parent64@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU365', 'ADM2024165', 'Amit Singh', '2024-05-02', 'Male', 'Address 65', '+91-1234567818', 'Parent 65', '+91-1234567819', 'parent65@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU366', 'ADM2024166', 'Virasat Singh', '2024-01-01', 'Male', 'Address 66', '+91-1234567820', 'Parent 66', '+91-1234567821', 'parent66@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU367', 'ADM2024167', 'Radha(Bani)', '2024-05-03', 'Female', 'Address 67', '+91-1234567822', 'Parent 67', '+91-1234567823', 'parent67@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU368', 'ADM2024168', 'Kanav', '2024-05-06', 'Male', 'Address 68', '+91-1234567824', 'Parent 68', '+91-1234567825', 'parent68@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU369', 'ADM2024169', 'Hitesh Kunwar', '2024-05-06', 'Male', 'Address 69', '+91-1234567826', 'Parent 69', '+91-1234567827', 'parent69@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU370', 'ADM2024170', 'Prateek', '2024-05-06', 'Male', 'Address 70', '+91-1234567828', 'Parent 70', '+91-1234567829', 'parent70@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU371', 'ADM2024171', 'Neeshika', '2024-05-09', 'Female', 'Address 71', '+91-1234567830', 'Parent 71', '+91-1234567831', 'parent71@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU372', 'ADM2024172', 'Ansh Thapriyal', '2024-01-01', 'Male', 'Address 72', '+91-1234567832', 'Parent 72', '+91-1234567833', 'parent72@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU373', 'ADM2024173', 'Saanvi', '2024-05-10', 'Female', 'Address 73', '+91-1234567834', 'Parent 73', '+91-1234567835', 'parent73@email.com', 'B-', 'LKG', NOW(), NOW()),
('STU374', 'ADM2024174', 'Viraj Singh', '2024-05-13', 'Male', 'Address 74', '+91-1234567836', 'Parent 74', '+91-1234567837', 'parent74@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU375', 'ADM2024175', 'Aarohi Saini', '2024-05-14', 'Female', 'Address 75', '+91-1234567838', 'Parent 75', '+91-1234567839', 'parent75@email.com', 'A+', 'LKG', NOW(), NOW()),
('STU376', 'ADM2024176', 'Ranjana Kumari', '2024-05-15', 'Female', 'Address 76', '+91-1234567840', 'Parent 76', '+91-1234567841', 'parent76@email.com', 'B-', 'Pre', NOW(), NOW()),
('STU377', 'ADM2024177', 'Abhinay Gupta', '2024-05-15', 'Male', 'Address 77', '+91-1234567842', 'Parent 77', '+91-1234567843', 'parent77@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU378', 'ADM2024178', 'Naman Singh', '2024-06-29', 'Male', 'Address 78', '+91-1234567844', 'Parent 78', '+91-1234567845', 'parent78@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU379', 'ADM2024179', 'Nayan Singh', '2024-06-29', 'Male', 'Address 79', '+91-1234567846', 'Parent 79', '+91-1234567847', 'parent79@email.com', 'B-', 'Pre', NOW(), NOW()),
('STU380', 'ADM2024180', 'Kiyansh Mandal', '2024-07-01', 'Male', 'Address 80', '+91-1234567848', 'Parent 80', '+91-1234567849', 'parent80@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU381', 'ADM2024181', 'Dhruv Pawar', '2024-07-03', 'Male', 'Address 81', '+91-1234567850', 'Parent 81', '+91-1234567851', 'parent81@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU382', 'ADM2024182', 'Athrav Kashyap', '2024-07-03', 'Male', 'Address 82', '+91-1234567852', 'Parent 82', '+91-1234567853', 'parent82@email.com', 'B-', 'Pre', NOW(), NOW()),
('STU383', 'ADM2024183', 'Shivaay Rawat', '2024-07-06', 'Male', 'Address 83', '+91-1234567854', 'Parent 83', '+91-1234567855', 'parent83@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU384', 'ADM2024184', 'Abhinav', '2024-07-13', 'Male', 'Address 84', '+91-1234567856', 'Parent 84', '+91-1234567857', 'parent84@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU385', 'ADM2024185', 'Shivansh', '2024-06-27', 'Male', 'Address 85', '+91-1234567858', 'Parent 85', '+91-1234567859', 'parent85@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU386', 'ADM2024186', 'Aniket Bhakta', '2024-07-09', 'Male', 'Address 86', '+91-1234567860', 'Parent 86', '+91-1234567861', 'parent86@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU387', 'ADM2024187', 'Harnaaz', '2024-07-10', 'Male', 'Address 87', '+91-1234567862', 'Parent 87', '+91-1234567863', 'parent87@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU388', 'ADM2024188', 'Ritika Kumari', '2024-07-11', 'Female', 'Address 88', '+91-1234567864', 'Parent 88', '+91-1234567865', 'parent88@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU389', 'ADM2024189', 'Rudra Sagar', '2024-01-01', 'Male', 'Address 89', '+91-1234567866', 'Parent 89', '+91-1234567867', 'parent89@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU390', 'ADM2024190', 'Garvik', '2024-01-01', 'Male', 'Address 90', '+91-1234567868', 'Parent 90', '+91-1234567869', 'parent90@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU391', 'ADM2024191', 'Vedank Verma', '2024-01-01', 'Male', 'Address 91', '+91-1234567870', 'Parent 91', '+91-1234567871', 'parent91@email.com', 'B-', 'Pre', NOW(), NOW()),
('STU392', 'ADM2024192', 'Rudransh Kumar Singh', '2024-01-01', 'Male', 'Address 92', '+91-1234567872', 'Parent 92', '+91-1234567873', 'parent92@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU393', 'ADM2024193', 'Nayra', '2024-01-01', 'Female', 'Address 93', '+91-1234567874', 'Parent 93', '+91-1234567875', 'parent93@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU394', 'ADM2024194', 'Maanvi', '2024-01-01', 'Female', 'Address 94', '+91-1234567876', 'Parent 94', '+91-1234567877', 'parent94@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU395', 'ADM2024195', 'Aarav Bansal', '2024-01-01', 'Male', 'Address 95', '+91-1234567878', 'Parent 95', '+91-1234567879', 'parent95@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU396', 'ADM2024196', 'Avni', '2024-01-01', 'Female', 'Address 96', '+91-1234567880', 'Parent 96', '+91-1234567881', 'parent96@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU397', 'ADM2024197', 'Viraj Kumar', '2024-01-01', 'Male', 'Address 97', '+91-1234567882', 'Parent 97', '+91-1234567883', 'parent97@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU398', 'ADM2024198', 'Shivansh Jha', '2024-01-01', 'Male', 'Address 98', '+91-1234567884', 'Parent 98', '+91-1234567885', 'parent98@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU399', 'ADM2024199', 'Ayansh', '2024-01-01', 'Male', 'Address 99', '+91-1234567886', 'Parent 99', '+91-1234567887', 'parent99@email.com', 'A+', 'LKG', NOW(), NOW()),
('STU400', 'ADM2024200', 'Drona', '2024-01-01', 'Male', 'Address 100', '+91-1234567888', 'Parent 100', '+91-1234567889', 'parent100@email.com', 'B-', 'LKG', NOW(), NOW()),
('STU401', 'ADM2024201', 'Nitya', '2024-01-01', 'Female', 'Address 101', '+91-1234567890', 'Parent 101', '+91-1234567891', 'parent101@email.com', 'O+', 'LKG', NOW(), NOW()),
('STU402', 'ADM2024202', 'Anvi Upadhay', '2024-07-24', 'Female', 'Address 102', '+91-1234567892', 'Parent 102', '+91-1234567893', 'parent102@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU403', 'ADM2024203', 'Ayushman', '2024-07-24', 'Male', 'Address 103', '+91-1234567894', 'Parent 103', '+91-1234567895', 'parent103@email.com', 'B-', 'LKG', NOW(), NOW()),
('STU404', 'ADM2024204', 'Rudransh Kumar Gargi', '2024-01-01', 'Male', 'Address 104', '+91-1234567896', 'Parent 104', '+91-1234567897', 'parent104@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU405', 'ADM2024205', 'Aaliya', '2024-01-01', 'Female', 'Address 105', '+91-1234567898', 'Parent 105', '+91-1234567899', 'parent105@email.com', 'A+', 'UKG', NOW(), NOW()),
('STU406', 'ADM2024206', 'Gurnoor', '2024-07-30', 'Male', 'Address 106', '+91-1234567800', 'Parent 106', '+91-1234567801', 'parent106@email.com', 'B-', 'Pre', NOW(), NOW()),
('STU407', 'ADM2024207', 'Prisha Chaudhary', '2024-08-03', 'Female', 'Address 107', '+91-1234567802', 'Parent 107', '+91-1234567803', 'parent107@email.com', 'O+', 'Nur', NOW(), NOW()),
('STU408', 'ADM2024208', 'Aviraj', '2024-08-06', 'Male', 'Address 108', '+91-1234567804', 'Parent 108', '+91-1234567805', 'parent108@email.com', 'A+', 'Nur', NOW(), NOW()),
('STU409', 'ADM2024209', 'Vishal', '2024-08-09', 'Male', 'Address 109', '+91-1234567806', 'Parent 109', '+91-1234567807', 'parent109@email.com', 'B-', 'LKG', NOW(), NOW()),
('STU410', 'ADM2024210', 'Pratyaksh Patel', '2024-08-12', 'Male', 'Address 110', '+91-1234567808', 'Parent 110', '+91-1234567809', 'parent110@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU411', 'ADM2024211', 'Avyaan Yadav', '2024-07-24', 'Male', 'Address 111', '+91-1234567810', 'Parent 111', '+91-1234567811', 'parent111@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU412', 'ADM2024212', 'Deepanshu', '2024-01-01', 'Male', 'Address 112', '+91-1234567812', 'Parent 112', '+91-1234567813', 'parent112@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU413', 'ADM2024213', 'Dharvi(Pragya)', '2024-09-04', 'Female', 'Address 113', '+91-1234567814', 'Parent 113', '+91-1234567815', 'parent113@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU414', 'ADM2024214', 'Farhaan', '2024-08-28', 'Male', 'Address 114', '+91-1234567816', 'Parent 114', '+91-1234567817', 'parent114@email.com', 'A+', 'Pre', NOW(), NOW()),
('STU415', 'ADM2024215', 'Myra Jindal', '2024-01-01', 'Female', 'Address 115', '+91-1234567818', 'Parent 115', '+91-1234567819', 'parent115@email.com', 'B-', 'Nur', NOW(), NOW()),
('STU416', 'ADM2024216', 'Kanha', '2024-01-01', 'Male', 'Address 116', '+91-1234567820', 'Parent 116', '+91-1234567821', 'parent116@email.com', 'O+', 'Pre', NOW(), NOW()),
('STU417', 'ADM2024217', 'Aaliya', '2024-01-01', 'Female', 'Address 117', '+91-1234567822', 'Parent 117', '+91-1234567823', 'parent117@email.com', 'A+', 'UKG', NOW(), NOW()); 