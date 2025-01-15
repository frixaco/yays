"server-only";

export const handleVideo = async (formData: FormData) => {
  const videoUrl = formData.get("videoUrl");
  console.log(videoUrl);
};
