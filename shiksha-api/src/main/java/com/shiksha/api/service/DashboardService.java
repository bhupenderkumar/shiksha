package com.shiksha.api.service;

import com.shiksha.api.common.enums.AttendanceStatus;
import com.shiksha.api.common.enums.EnquiryStatus;
import com.shiksha.api.common.enums.FeeStatus;
import com.shiksha.api.common.enums.HomeworkStatus;
import com.shiksha.api.dto.DashboardDto;
import com.shiksha.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepository;
    private final SchoolClassRepository classRepository;
    private final StaffRepository staffRepository;
    private final SubjectRepository subjectRepository;
    private final HomeworkRepository homeworkRepository;
    private final AttendanceRepository attendanceRepository;
    private final FeeRepository feeRepository;
    private final ProspectiveStudentRepository prospectiveStudentRepository;
    private final FeedbackRepository feedbackRepository;

    public DashboardDto.StatsResponse getStats(String schoolId) {
        return getDashboardStats(schoolId);
    }

    public DashboardDto.StatsResponse getDashboardStats(String schoolId) {
        String today = LocalDate.now().toString();

        long totalAttendance = attendanceRepository.countByDate(today);
        long presentAttendance = attendanceRepository.countByDateAndStatus(today, AttendanceStatus.PRESENT);

        return DashboardDto.StatsResponse.builder()
                .totalStudents(studentRepository.count())
                .totalClasses(classRepository.countBySchoolId(schoolId))
                .totalStaff(staffRepository.count())
                .totalSubjects(subjectRepository.count())
                .pendingHomework(homeworkRepository.countByStatus(HomeworkStatus.PENDING))
                .pendingFees(feeRepository.countByStatus(FeeStatus.PENDING))
                .todayAttendanceCount(presentAttendance)
                .todayAttendancePercentage(totalAttendance > 0
                        ? (double) presentAttendance / totalAttendance * 100 : 0.0)
                .newAdmissions(prospectiveStudentRepository.countByStatus(EnquiryStatus.NEW))
                .pendingFeedback(feedbackRepository.countByStatus("open"))
                .build();
    }
}
