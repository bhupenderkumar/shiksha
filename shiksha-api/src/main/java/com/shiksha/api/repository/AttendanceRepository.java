package com.shiksha.api.repository;

import com.shiksha.api.common.enums.AttendanceStatus;
import com.shiksha.api.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    List<Attendance> findByClassIdAndDate(String classId, String date);
    List<Attendance> findByStudentId(String studentId);

    @Query("SELECT a FROM Attendance a WHERE a.studentId = :studentId AND a.date BETWEEN :start AND :end")
    List<Attendance> findByStudentIdAndDateRange(
            @Param("studentId") String studentId,
            @Param("start") String start,
            @Param("end") String end);

    @Query("SELECT a FROM Attendance a WHERE a.classId = :classId AND a.date BETWEEN :start AND :end")
    List<Attendance> findByClassIdAndDateRange(
            @Param("classId") String classId,
            @Param("start") String start,
            @Param("end") String end);

    Optional<Attendance> findByStudentIdAndDate(String studentId, String date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.studentId = :studentId AND a.status = :status AND a.date BETWEEN :start AND :end")
    long countByStudentIdAndStatusAndDateBetween(
            @Param("studentId") String studentId,
            @Param("status") AttendanceStatus status,
            @Param("start") String start,
            @Param("end") String end);

    long countByDate(String date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.date = :date AND a.status = :status")
    long countByDateAndStatus(@Param("date") String date, @Param("status") AttendanceStatus status);
}
