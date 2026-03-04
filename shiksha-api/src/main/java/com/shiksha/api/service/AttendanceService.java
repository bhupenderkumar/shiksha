package com.shiksha.api.service;

import com.shiksha.api.common.enums.AttendanceStatus;
import com.shiksha.api.dto.AttendanceDto;
import com.shiksha.api.entity.Attendance;
import com.shiksha.api.repository.AttendanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    public List<Attendance> getByClassAndDate(String classId, String date) {
        return attendanceRepository.findByClassIdAndDate(classId, date);
    }

    public List<Attendance> getAttendanceByClassAndDate(String classId, String date) {
        return getByClassAndDate(classId, date);
    }

    public List<Attendance> getByStudentAndDateRange(String studentId, String startDate, String endDate) {
        return attendanceRepository.findByStudentIdAndDateRange(studentId, startDate, endDate);
    }

    @Transactional
    public List<Attendance> markBulkAttendance(AttendanceDto.MarkRequest request) {
        return markAttendance(request);
    }

    @Transactional
    public List<Attendance> markAttendance(AttendanceDto.MarkRequest request) {
        List<Attendance> attendanceList = new ArrayList<>();

        for (AttendanceDto.AttendanceEntry entry : request.getRecords()) {
            Attendance existing = attendanceRepository
                    .findByStudentIdAndDate(entry.getStudentId(), request.getDate())
                    .orElse(null);

            if (existing != null) {
                existing.setStatus(AttendanceStatus.valueOf(entry.getStatus().toUpperCase()));
                existing.setDescription(entry.getDescription());
                attendanceList.add(attendanceRepository.save(existing));
            } else {
                Attendance attendance = Attendance.builder()
                        .id(UUID.randomUUID().toString())
                        .studentId(entry.getStudentId())
                        .classId(request.getClassId())
                        .date(request.getDate())
                        .status(AttendanceStatus.valueOf(entry.getStatus().toUpperCase()))
                        .description(entry.getDescription())
                        .createdAt(Instant.now().toString())
                        .updatedAt(Instant.now().toString())
                        .build();
                attendanceList.add(attendanceRepository.save(attendance));
            }
        }
        return attendanceList;
    }

    public AttendanceDto.SummaryResponse getStudentSummary(String studentId, String startDate, String endDate) {
        long present = attendanceRepository.countByStudentIdAndStatusAndDateBetween(
                studentId, AttendanceStatus.PRESENT, startDate, endDate);
        long absent = attendanceRepository.countByStudentIdAndStatusAndDateBetween(
                studentId, AttendanceStatus.ABSENT, startDate, endDate);
        long late = attendanceRepository.countByStudentIdAndStatusAndDateBetween(
                studentId, AttendanceStatus.LATE, startDate, endDate);
        long total = present + absent + late;

        return AttendanceDto.SummaryResponse.builder()
                .totalDays(total)
                .presentDays(present)
                .absentDays(absent)
                .lateDays(late)
                .attendancePercentage(total > 0 ? (double) present / total * 100 : 0.0)
                .build();
    }

    public AttendanceDto.SummaryResponse getClassSummary(String classId, String date) {
        List<Attendance> records = attendanceRepository.findByClassIdAndDate(classId, date);
        long present = records.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long late = records.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
        long total = records.size();

        return AttendanceDto.SummaryResponse.builder()
                .totalDays(total)
                .presentDays(present)
                .absentDays(absent)
                .lateDays(late)
                .attendancePercentage(total > 0 ? (double) present / total * 100 : 0.0)
                .build();
    }

    public AttendanceDto.Response toResponse(Attendance a) {
        return AttendanceDto.Response.builder()
                .id(a.getId())
                .studentId(a.getStudentId())
                .studentName(a.getStudent() != null ? a.getStudent().getName() : null)
                .classId(a.getClassId())
                .date(a.getDate())
                .status(a.getStatus() != null ? a.getStatus().name() : null)
                .description(a.getDescription())
                .createdBy(a.getCreatedBy())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
