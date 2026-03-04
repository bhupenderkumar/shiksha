package com.shiksha.api.repository;

import com.shiksha.api.entity.IDCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IDCardRepository extends JpaRepository<IDCard, String> {
    List<IDCard> findByClassId(String classId);

    @Query("SELECT i FROM IDCard i WHERE LOWER(i.studentName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<IDCard> searchByStudentName(@Param("name") String name);
}
