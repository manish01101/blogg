export async function uploadImageToCloudinaryREST({
  file,
  filename,
  cloudName,
  apiKey,
  uploadPreset,
}: {
  file: File;
  filename: string;
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
}): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("public_id", filename);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Cloudinary upload error response:", errorBody);
    throw new Error("Cloudinary upload failed");
  }

  return await response.json();
}
