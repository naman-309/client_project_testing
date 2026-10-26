import api from "./api";

// Upload service for handling video uploads to S3/DigitalOcean Spaces
const uploadService = {
    // Get pre-signed URL for direct upload
    getPresignedUrl: async (data) => {
        try {
            const response = await api.post("/upload/presigned-url", data);
            return response.data;
        } catch (error) {
            console.error("Failed to get pre-signed URL:", error);
            throw error;
        }
    },
};

export default uploadService;
