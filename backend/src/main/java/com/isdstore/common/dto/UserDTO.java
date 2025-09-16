package com.isdstore.common.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UserDTO {
    private UUID id;
    private String email;
    private String role;
}
