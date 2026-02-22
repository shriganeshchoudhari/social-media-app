package com.socialmedia.media;

import com.socialmedia.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    /**
     * POST /api/v1/media/upload
     * Form-data field: "file"
     * Returns: { "url": "/api/v1/media/files/<filename>" }
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {

        String url = mediaService.store(file, currentUser);
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * GET /api/v1/media/files/{filename}
     * Serves the stored file back as bytes.
     */
    @GetMapping("/files/{filename}")
    public ResponseEntity<byte[]> serve(@PathVariable String filename) {
        return mediaService.serve(filename);
    }
}
