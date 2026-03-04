package com.shiksha.api.repository;

import com.shiksha.api.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, String> {
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
