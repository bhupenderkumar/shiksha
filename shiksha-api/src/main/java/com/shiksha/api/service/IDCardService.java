package com.shiksha.api.service;

import com.shiksha.api.common.exception.ResourceNotFoundException;
import com.shiksha.api.dto.IDCardDto;
import com.shiksha.api.entity.IDCard;
import com.shiksha.api.repository.IDCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class IDCardService {

    private final IDCardRepository idCardRepository;

    public List<IDCard> getByClass(String classId) {
        return idCardRepository.findByClassId(classId);
    }

    public List<IDCard> getIDCardsByClass(String classId) {
        return getByClass(classId);
    }

    public IDCard getById(String id) {
        return idCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID Card not found with id: " + id));
    }

    public IDCard getIDCardById(String id) {
        return getById(id);
    }

    public IDCard getIDCardByStudent(String studentId) {
        List<IDCard> cards = idCardRepository.searchByStudentName(studentId);
        if (cards.isEmpty()) {
            throw new ResourceNotFoundException("ID Card not found for student: " + studentId);
        }
        return cards.get(0);
    }

    public List<IDCard> searchByStudentName(String name) {
        return idCardRepository.searchByStudentName(name);
    }

    @Transactional
    public IDCard create(IDCardDto.CreateRequest request) {
        IDCard card = IDCard.builder()
                .id(UUID.randomUUID().toString())
                .studentName(request.getStudentName())
                .fatherName(request.getFatherName())
                .motherName(request.getMotherName())
                .dateOfBirth(request.getDateOfBirth())
                .address(request.getAddress())
                .classId(request.getClassId())
                .fatherMobile(request.getFatherMobile())
                .motherMobile(request.getMotherMobile())
                .studentPhotoUrl(request.getStudentPhotoUrl())
                .fatherPhotoUrl(request.getFatherPhotoUrl())
                .motherPhotoUrl(request.getMotherPhotoUrl())
                .downloadCount(0)
                .createdAt(Instant.now().toString())
                .build();
        return idCardRepository.save(card);
    }

    @Transactional
    public IDCard createIDCard(IDCardDto.CreateRequest request) {
        return create(request);
    }

    @Transactional
    public IDCard updateIDCard(String id, IDCardDto.UpdateRequest request) {
        IDCard card = getById(id);
        if (request.getStudentName() != null) card.setStudentName(request.getStudentName());
        if (request.getFatherName() != null) card.setFatherName(request.getFatherName());
        if (request.getMotherName() != null) card.setMotherName(request.getMotherName());
        if (request.getDateOfBirth() != null) card.setDateOfBirth(request.getDateOfBirth());
        if (request.getAddress() != null) card.setAddress(request.getAddress());
        if (request.getClassId() != null) card.setClassId(request.getClassId());
        if (request.getFatherMobile() != null) card.setFatherMobile(request.getFatherMobile());
        if (request.getMotherMobile() != null) card.setMotherMobile(request.getMotherMobile());
        if (request.getStudentPhotoUrl() != null) card.setStudentPhotoUrl(request.getStudentPhotoUrl());
        if (request.getFatherPhotoUrl() != null) card.setFatherPhotoUrl(request.getFatherPhotoUrl());
        if (request.getMotherPhotoUrl() != null) card.setMotherPhotoUrl(request.getMotherPhotoUrl());
        return idCardRepository.save(card);
    }

    @Transactional
    public void delete(String id) {
        IDCard card = getById(id);
        idCardRepository.delete(card);
    }

    @Transactional
    public void deleteIDCard(String id) {
        delete(id);
    }

    @Transactional
    public IDCard incrementDownloadCount(String id) {
        IDCard card = getById(id);
        card.setDownloadCount(card.getDownloadCount() != null ? card.getDownloadCount() + 1 : 1);
        return idCardRepository.save(card);
    }

    public IDCardDto.Response toResponse(IDCard card) {
        return IDCardDto.Response.builder()
                .id(card.getId())
                .studentName(card.getStudentName())
                .fatherName(card.getFatherName())
                .motherName(card.getMotherName())
                .dateOfBirth(card.getDateOfBirth())
                .address(card.getAddress())
                .classId(card.getClassId())
                .className(card.getSchoolClass() != null ? card.getSchoolClass().getName() : null)
                .fatherMobile(card.getFatherMobile())
                .motherMobile(card.getMotherMobile())
                .studentPhotoUrl(card.getStudentPhotoUrl())
                .fatherPhotoUrl(card.getFatherPhotoUrl())
                .motherPhotoUrl(card.getMotherPhotoUrl())
                .downloadCount(card.getDownloadCount())
                .createdAt(card.getCreatedAt())
                .build();
    }
}
