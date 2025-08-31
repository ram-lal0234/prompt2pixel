import { supabase } from "./supabase";

export interface StorageConfig {
  bucketName: string;
  public: boolean;
  allowedMimeTypes: string[];
  fileSizeLimit: number;
}

export interface ThumbnailUploadData {
  chatId: string;
  messageId: string;
  file: File;
  fileName?: string;
}

export class StorageService {
  private readonly bucketName = "thumbnails";
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  /**
   * Initialize storage bucket for thumbnails
   */
  async initializeBucket() {
    try {
      // Check if bucket already exists
      const { data: existingBuckets, error: listError } =
        await supabase!.storage.listBuckets();

      if (listError) throw listError;

      const bucketExists = existingBuckets?.some(
        (bucket) => bucket.name === this.bucketName
      );

      if (!bucketExists) {
        // Create new bucket with proper configuration
        const { data, error } = await supabase!.storage.createBucket(
          this.bucketName,
          {
            public: false, // Private bucket for security
            allowedMimeTypes: this.allowedMimeTypes,
            fileSizeLimit: this.maxFileSize,
          }
        );

        if (error) throw error;
        console.log("✅ Storage bucket created:", data);
      } else {
        console.log("✅ Storage bucket already exists");
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize storage bucket:", error);
      throw error;
    }
  }

  /**
   * Upload thumbnail image with chat and message organization
   */
  async uploadThumbnail(uploadData: ThumbnailUploadData): Promise<string> {
    try {
      // Validate file
      this.validateFile(uploadData.file);

      // Create organized file path: chatId/messageId/filename
      const fileExtension = uploadData.file.name.split(".").pop();
      const fileName =
        uploadData.fileName || `thumbnail_${Date.now()}.${fileExtension}`;
      const filePath = `${uploadData.chatId}/${uploadData.messageId}/${fileName}`;

      // Upload file to storage
      const { data, error } = await supabase!.storage
        .from(this.bucketName)
        .upload(filePath, uploadData.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL for the uploaded file
      if (!supabase!) {
        throw new Error("Supabase client is not initialized");
      }
      const { data: urlData } = supabase!.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      console.log("✅ Thumbnail uploaded successfully:", filePath);
      return urlData.publicUrl;
    } catch (error) {
      console.error("❌ Failed to upload thumbnail:", error);
      throw error;
    }
  }

  /**
   * Download thumbnail image
   */
  async downloadThumbnail(
    chatId: string,
    messageId: string,
    fileName: string
  ): Promise<Blob> {
    try {
      const filePath = `${chatId}/${messageId}/${fileName}`;

      const { data, error } = await supabase!.storage
        .from(this.bucketName)
        .download(filePath);

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("❌ Failed to download thumbnail:", error);
      throw error;
    }
  }

  /**
   * Delete thumbnail image
   */
  async deleteThumbnail(
    chatId: string,
    messageId: string,
    fileName: string
  ): Promise<boolean> {
    try {
      const filePath = `${chatId}/${messageId}/${fileName}`;

      const { error } = await supabase!.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;

      console.log("✅ Thumbnail deleted successfully:", filePath);
      return true;
    } catch (error) {
      console.error("❌ Failed to delete thumbnail:", error);
      throw error;
    }
  }

  /**
   * List all thumbnails for a specific chat
   */
  async listChatThumbnails(chatId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase!.storage
        .from(this.bucketName)
        .list(chatId);

      if (error) throw error;

      return data?.map((item) => item.name) || [];
    } catch (error) {
      console.error("❌ Failed to list chat thumbnails:", error);
      throw error;
    }
  }

  /**
   * List all thumbnails for a specific message
   */
  async listMessageThumbnails(
    chatId: string,
    messageId: string
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase!.storage
        .from(this.bucketName)
        .list(`${chatId}/${messageId}`);

      if (error) throw error;

      return data?.map((item) => item.name) || [];
    } catch (error) {
      console.error("❌ Failed to list message thumbnails:", error);
      throw error;
    }
  }

  /**
   * Get public URL for a thumbnail
   */
  getThumbnailUrl(chatId: string, messageId: string, fileName: string): string {
    const filePath = `${chatId}/${messageId}/${fileName}`;

    const { data } = supabase!.storage
      .from(this.bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error(
        `File size exceeds limit of ${this.maxFileSize / (1024 * 1024)}MB`
      );
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.type)) {
      throw new Error(
        `File type ${
          file.type
        } not allowed. Allowed types: ${this.allowedMimeTypes.join(", ")}`
      );
    }
  }

  /**
   * Clean up all thumbnails for a chat (when chat is deleted)
   */
  async cleanupChatThumbnails(chatId: string): Promise<boolean> {
    try {
      // List all files in the chat directory
      const { data, error } = await supabase!.storage
        .from(this.bucketName)
        .list(chatId, {
          limit: 1000,
          offset: 0,
        });

      if (error) throw error;

      if (data && data.length > 0) {
        // Delete all files in the chat directory
        const filePaths = data.map((item) => `${chatId}/${item.name}`);

        const { error: deleteError } = await supabase!.storage
          .from(this.bucketName)
          .remove(filePaths);

        if (deleteError) throw deleteError;
      }

      console.log("✅ Chat thumbnails cleaned up successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to cleanup chat thumbnails:", error);
      throw error;
    }
  }

  /**
   * Get storage bucket info
   */
  async getBucketInfo() {
    try {
      const { data, error } = await supabase!.storage.getBucket(
        this.bucketName
      );

      if (error) throw error;

      return data;
    } catch (error) {
      console.error("❌ Failed to get bucket info:", error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
