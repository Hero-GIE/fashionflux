const axios = require("axios");
const FormData = require("form-data");

class FileUploadService {
  constructor() {
    this.publitioKey = process.env.PUBLITIO_API_KEY;
    this.publitioSecret = process.env.PUBLITIO_API_SECRET;
    this.baseUrl = "https://api.publit.io/v1/files";

    if (!this.publitioKey || !this.publitioSecret) {
      console.warn(
        "⚠️ WARNING: Missing Publitio API credentials. Uploads will fail!"
      );
    }
  }

  async uploadFile(fileBuffer, fileName, folder = "QDh5kALd") {
    const startTime = new Date();

    try {
      if (!fileBuffer) throw new Error("❌ Missing file buffer");
      if (!fileName) throw new Error("❌ Missing file name");

      const form = new FormData();
      form.append("file", fileBuffer, fileName);
      form.append("folder", folder);
      form.append("title", fileName);

      console.log("📁 Folder:", folder);
      console.log("📝 File Name:", fileName);
      console.log("📨 Headers being sent:", form.getHeaders());

      const authToken = process.env.PUBLITIO_TOKEN_KEY;
      if (!authToken)
        console.warn("⚠️ [WARNING] Missing PUBLITIO_TOKEN_KEY in environment!");

      console.log(
        "📤 [STEP 3] Sending upload request to:",
        `${this.baseUrl}/create`
      );
      const response = await axios.post(`${this.baseUrl}/create`, form, {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${authToken}`,
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      const endTime = new Date();
      const duration = (endTime - startTime) / 1000;
      console.log(`⏱️ [DONE] Upload completed in ${duration}s`);

      const uploadData = {
        id: response.data.id,
        url: response.data.url_preview,
        size: response.data.size,
      };

      console.log("✅ [SUCCESS] Publitio upload result:", uploadData);

      // Return only `url` and `id`, omitting `secure_url` and `format`
      return {
        url: response.data.url_preview,
        publitio_id: response.data.id,
        bytes: response.data.size,
      };
    } catch (error) {
      const now = new Date();
      console.error("❌ [ERROR] Upload failed at", now.toISOString());
      console.error("🧾 Message:", error.message);

      if (error.response) {
        console.error(
          "📟 Status:",
          error.response.status,
          error.response.statusText || ""
        );
        console.error(
          "📬 Response Body:",
          JSON.stringify(error.response.data, null, 2)
        );
      }

      console.log("📁 Debug Info:");
      console.log("🔐 API Key Used:", this.publitioKey || "N/A");
      console.log("📄 File Name:", fileName);
      console.log("📁 Folder:", folder);
      console.log(
        "💡 Tip: Ensure PUBLITIO_TOKEN_KEY is valid and has file upload permissions"
      );

      throw error;
    }
  }
}

module.exports = new FileUploadService();
