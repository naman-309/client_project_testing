import axios from "axios";
import api from "@/services/api";
import uploadService from "@/services/uploadService";

// Helper function for video upload workflow
export const uploadVideoAndCreateLesson = async (file, lessonData, adminToken) => {
    try {
        // Step 1: Get pre-signed URL from backend
        const uploadResponse = await uploadService.getPresignedUrl({
            fileName: file.name,
            fileType: file.type,
            isPublic: true,
        });

        const { signedUrl, fileUrl } = uploadResponse.data;

        // Step 2: Upload directly to S3 with progress tracking
        const uploadPromise = axios.put(signedUrl, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                return percentCompleted;
            },
        });

        // Wait for upload to complete
        await uploadPromise;

        // Step 3: Create lesson with the uploaded video URL
        const config = adminToken ? { headers: { Authorization: `Bearer ${adminToken}` } } : {};
        const lessonResponse = await api.post(
            "/lessons/create",
            {
                ...lessonData,
                content: fileUrl, // Use the S3 URL from upload
                type: "video",
            },
            config
        );

        return {
            success: true,
            lesson: lessonResponse.data,
            videoUrl: fileUrl,
        };
    } catch (error) {
        console.error("Video upload and lesson creation failed:", error);
        throw error;
    }
};

// Validate video file
export const validateVideoFile = (file) => {
    const errors = [];

    // Check file type
    if (!file.type.startsWith("video/")) {
        errors.push("Please select a video file (MP4, WebM, etc.)");
    }

    // Check file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
        errors.push("Video file must be less than 500MB");
    }

    // Check file name length
    if (file.name.length > 255) {
        errors.push("File name is too long");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

// Get admin token from localStorage
export const getAdminToken = () => {
    return localStorage.getItem("accessToken");
};
