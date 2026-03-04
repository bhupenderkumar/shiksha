package com.shiksha.api.repository;

import com.shiksha.api.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, String> {
    List<FeePayment> findByStudentId(String studentId);
    List<FeePayment> findByStudentIdOrderByPaymentDateDesc(String studentId);
}
