package com.shiksha.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI shikshaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Shiksha School Management API")
                        .description("REST API for the Shiksha School Management System. " +
                                "Provides endpoints for managing students, homework, classwork, " +
                                "attendance, fees, admissions, and more.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Shiksha Team")
                                .email("admin@shiksha.example.com"))
                        .license(new License()
                                .name("MIT License")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .bearerFormat("JWT")
                                        .scheme("bearer")
                                        .description("Enter JWT token")));
    }
}
