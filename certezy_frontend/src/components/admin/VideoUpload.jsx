import React, { useState } from "react";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import uploadService from "@/services/uploadService";

export function VideoUpload({ onUploadComplete, onUploadError }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState(null);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("video/")) {
            toast.error("Please select a video file");
            return;
        }

        // Validate file size (500MB max)
        if (file.size > 500 * 1024 * 1024) {
            toast.error("Video file must be less than 500MB");
            return;
        }

        await uploadVideo(file);
    };

    const uploadVideo = async (file) => {
        setUploading(true);
        setProgress(0);

        const contentType = file.type || "video/mp4";

        try {
            // Step 1: Get pre-signed URL from backend
            const response = await uploadService.getPresignedUrl({
                fileName: file.name,
                fileType: contentType,
                isPublic: true,
            });

            const { signedUrl, fileUrl } = response.data;

            // Step 2: Upload directly to S3
            await axios.put(signedUrl, file, {
                headers: { "Content-Type": contentType },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percentCompleted);
                },
            });

            // Step 3: Success - return the URL
            setUploadedUrl(fileUrl);
            toast.success("Video uploaded successfully!");
            onUploadComplete?.(fileUrl);
        } catch (error) {
            console.error("Upload failed details:", error.response?.data || error);
            const errorMessage =
                typeof error.response?.data === "string" && error.response?.data.includes("<Message>")
                    ? "AWS S3 rejected upload (403 Forbidden). Check IAM user permissions & bucket name."
                    : error.response?.data?.message || error.message || "Upload failed";
            toast.error(errorMessage);
            onUploadError?.(error);
        } finally {
            setUploading(false);
        }
    };

    const clearUpload = () => {
        setUploadedUrl(null);
        setProgress(0);
        onUploadComplete?.(null);
    };

    return (
        <div className="w-full">
            {!uploadedUrl ? (
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#3282B8] transition-colors">
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="hidden"
                        id="video-upload"
                    />
                    <label
                        htmlFor="video-upload"
                        className={`cursor-pointer flex flex-col items-center gap-3 ${
                            uploading ? "pointer-events-none opacity-50" : ""
                        }`}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-8 h-8 text-[#3282B8] animate-spin" />
                                <div className="text-sm font-medium text-slate-700">
                                    Uploading... {progress}%
                                </div>
                                <div className="w-full max-w-xs">
                                    <div className="bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-[#3282B8] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-slate-400" />
                                <div>
                                    <div className="text-sm font-medium text-slate-700">
                                        Click to upload video
                                    </div>
                                    <div className="text-xs text-slate-500">MP4, WebM up to 500MB</div>
                                </div>
                            </>
                        )}
                    </label>
                </div>
            ) : (
                <div className="border border-green-200 bg-green-50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-green-800">
                                Video uploaded successfully
                            </div>
                            <div className="text-xs text-green-600 truncate">{uploadedUrl}</div>
                        </div>
                        <button
                            onClick={clearUpload}
                            className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-green-600" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoUpload;
