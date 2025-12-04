import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Tag,
  Button,
  message,
  Upload,
  Progress,
  Alert,
} from "antd";
import {
  InboxOutlined,
  CloudUploadOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import {
  useAddVideoMutation,
  useUpdateVideoMutation,
} from "../../redux/apiSlices/videoApi";
import { getBaseUrl } from "../../redux/api/baseUrl";
import { isProduction } from "../../redux/api/baseApi";

const { TextArea } = Input;
const { Dragger } = Upload;

const VideoUploadModal = ({
  visible,
  onCancel,
  onSuccess,
  currentVideo,
  equipmentTags,
  setEquipmentTags,
}) => {
  const [form] = Form.useForm();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [bunnyVideoData, setBunnyVideoData] = useState(null);

  const isEditMode = !!currentVideo?._id;

  const [addVideo, { isLoading: isAdding }] = useAddVideoMutation();
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();

  const isLoading = isAdding || isUpdating || uploadingVideo;

  useEffect(() => {
    if (visible && currentVideo) {
      form.setFieldsValue({
        title: currentVideo.title,
        duration: currentVideo.duration || "",
        description: currentVideo.description || "",
      });

      if (currentVideo.equipment?.length) {
        setEquipmentTags(currentVideo.equipment);
      }

      setThumbnailFile(null);
      setVideoFile(null);
      setTagInput("");
      setBunnyVideoData(null);
      setUploadProgress(0);
    } else if (visible) {
      form.resetFields();
      setThumbnailFile(null);
      setVideoFile(null);
      setTagInput("");
      setEquipmentTags([]);
      setBunnyVideoData(null);
      setUploadProgress(0);
    }
  }, [visible, currentVideo, form, setEquipmentTags]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleThumbnailUpload = (info) => {
    const file = info.fileList[0];
    if (!file) return;

    const fileObj = file.originFileObj || file;

    if (!fileObj.type.startsWith('image/')) {
      message.error('Please upload a valid image file');
      return;
    }

    if (fileObj.size > 5 * 1024 * 1024) {
      message.error('Image must be smaller than 5MB');
      return;
    }

    setThumbnailFile(fileObj);
    message.success('Thumbnail selected successfully');
  };

  const handleVideoUpload = (info) => {
    const file = info.fileList[0];
    if (!file) return;

    const fileObj = file.originFileObj || file;

    if (!fileObj.type.startsWith('video/')) {
      message.error('Please upload a valid video file');
      return;
    }

    setVideoFile(fileObj);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = Math.floor(video.duration);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      form.setFieldsValue({ duration: formatted });
      message.success('Video selected successfully');
    };
    video.src = URL.createObjectURL(fileObj);
  };

  const addTag = () => {
    if (tagInput.trim() && !equipmentTags.includes(tagInput.trim())) {
      setEquipmentTags([...equipmentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setEquipmentTags(equipmentTags.filter((tag) => tag !== tagToRemove));
  };

  const handleEquipmentKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const uploadVideoToBunnyStream = async (videoFile, title) => {
    return new Promise(async (resolve, reject) => {
      try {
        setUploadingVideo(true);
        setUploadStatus("Initializing upload...");
        setUploadProgress(0);


        const initResponse = await fetch(`${getBaseUrl(isProduction)}/api/v1/admin/videos/library/generate-upload-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            title: title,
            fileName: videoFile.name,
          }),
        });

        if (!initResponse.ok) {
          throw new Error("Failed to get upload URL");
        }

        const { data } = await initResponse.json();
        const { videoId, uploadUrl, apiKey, embedUrl } = data;

        setUploadStatus("Uploading video...");

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
            setUploadStatus(`Uploading: ${percentComplete}%`);
          }
        });

        xhr.addEventListener("load", async () => {
          if (xhr.status === 200 || xhr.status === 201) {
            setUploadStatus("Upload complete! Processing...");
            setUploadProgress(100);

            resolve({
              videoId,
              embedUrl,
              videoUrl: embedUrl,
            });
          } else {
            reject(new Error("Video upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("AccessKey", apiKey);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(videoFile);

      } catch (error) {
        reject(error);
      }
    });
  };

  const uploadThumbnailToBunnyStorage = async (thumbnailFile) => {
    try {
      const formData = new FormData();
      formData.append("thumbnail", thumbnailFile);

      const response = await fetch(`${getBaseUrl(isProduction)}/api/v1/admin/videos/library/thumbnail`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData,
      });

      if (!response.ok) return null;

      const result = await response.json();
      return result.data;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (values) => {
    if (!isEditMode && (!thumbnailFile || !videoFile)) {
      message.error("Please upload both thumbnail and video");
      return;
    }

    if (equipmentTags.length === 0) {
      message.error("Please add at least one equipment tag");
      return;
    }

    let videoUrl = currentVideo?.videoUrl;
    let thumbnailUrl = currentVideo?.thumbnailUrl;
    let videoId = currentVideo?.videoId;

    try {
      if (!isEditMode && videoFile) {
        const bunnyData = await uploadVideoToBunnyStream(videoFile, values.title);
        videoUrl = bunnyData.videoUrl;
        videoId = bunnyData.videoId;
        setBunnyVideoData(bunnyData);

        if (thumbnailFile) {
          setUploadStatus("Uploading thumbnail...");
          const uploadedThumbnailUrl = await uploadThumbnailToBunnyStorage(
            thumbnailFile
          );
          if (uploadedThumbnailUrl) {
            thumbnailUrl = uploadedThumbnailUrl;
          }
        }
      }

      let formattedDuration = values.duration;
      if (!formattedDuration.includes("Min")) {
        formattedDuration = `${formattedDuration} Min`;
      }

      const videoData = {
        title: values.title,
        duration: formattedDuration,
        description: values.description || "",
        equipment: equipmentTags,
        videoUrl: videoUrl,
        videoId: videoId,
        ...(thumbnailUrl && { thumbnailUrl }),
      };

      setUploadStatus("Saving metadata...");

      if (isEditMode) {
        if (thumbnailFile) {
          const uploadedThumbnailUrl = await uploadThumbnailToBunnyStorage(
            thumbnailFile
          );
          if (uploadedThumbnailUrl) {
            videoData.thumbnailUrl = uploadedThumbnailUrl;
          }
        }

        await updateVideo({
          id: currentVideo._id,
          videoData: videoData,
        }).unwrap();
      } else {
        await addVideo(videoData).unwrap();
      }

      message.success(`Video ${isEditMode ? "updated" : "added"} successfully`);

      setUploadingVideo(false);
      setUploadProgress(0);
      onSuccess();
      onCancel();
    } catch (error) {
      setUploadingVideo(false);

      const errorMessage = error?.data?.message
        || error?.message
        || `Failed to ${isEditMode ? "update" : "add"} video`;

      message.error(errorMessage);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    showUploadList: false,
  };

  const thumbnailProps = {
    ...uploadProps,
    accept: "image/jpeg,image/jpg,image/png,image/webp",
    onChange: handleThumbnailUpload,
  };

  const videoProps = {
    ...uploadProps,
    accept: "video/mp4,video/webm,video/mov,video/avi",
    onChange: handleVideoUpload,
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <VideoCameraOutlined className="text-xl" />
          <span>{isEditMode ? "Edit Video" : "Upload New Video"}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {uploadingVideo && (
          <Alert
            message={
              <div className="flex items-center gap-3">
                <CloudUploadOutlined className="text-blue-600 text-xl animate-pulse" />
                <span className="font-medium">{uploadStatus}</span>
              </div>
            }
            description={
              <Progress
                percent={uploadProgress}
                status={uploadProgress === 100 ? "success" : "active"}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                showInfo={true}
              />
            }
            type="info"
            className="mb-4"
          />
        )}

        <Form.Item
          label="Video Title"
          name="title"
          rules={[
            { required: true, message: "Please enter video title" },
            { min: 3, message: "Title must be at least 3 characters" }
          ]}
        >
          <Input
            placeholder="Enter video title"
            size="large"
            disabled={uploadingVideo}
            className="py-6"
          />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            label="Duration"
            name="duration"
            rules={[
              { required: true, message: "Please enter duration" },
              {
                pattern: /^\d+:\d{2}$/,
                message: "Format: MM:SS (e.g., 10:30)"
              }
            ]}
          >
            <Input
              placeholder="MM:SS (e.g., 10:30)"
              size="large"
              disabled={uploadingVideo}
              className="py-6"
            />
          </Form.Item>

          <Form.Item
            label="Equipment"
            required
          >
            <div className="space-y-2">
              <Input
                placeholder="Add equipment and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleEquipmentKeyPress}
                size="medium"
                disabled={uploadingVideo}
                suffix={
                  <Button
                    type="text"
                    onClick={addTag}
                    disabled={!tagInput.trim() || uploadingVideo}
                  >
                    Add
                  </Button>
                }
              />
              {equipmentTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {equipmentTags.map((equipment, index) => (
                    <Tag
                      key={index}
                      closable={!uploadingVideo}
                      onClose={() => removeTag(equipment)}
                      color="red"
                    >
                      {equipment}
                    </Tag>
                  ))}
                </div>
              )}
              {equipmentTags.length === 0 && (
                <p className="text-xs text-red-500">At least one equipment is required</p>
              )}
            </div>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Thumbnail Image" required={!isEditMode}>
            <Dragger {...thumbnailProps} disabled={uploadingVideo}>
              <p className="ant-upload-drag-icon">
                <FileImageOutlined style={{ color: thumbnailFile ? '@CA3939' : '#CA3939' }} />
              </p>
              <p className="ant-upload-text">
                {thumbnailFile ? 'Thumbnail Selected' : 'Click or drag to upload'}
              </p>
              <p className="ant-upload-hint">
                Support: JPG, PNG, WEBP (Max 5MB)
              </p>
            </Dragger>

            {thumbnailFile && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        {thumbnailFile.name}
                      </p>
                      <p className="text-xs text-green-600">
                        {formatFileSize(thumbnailFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() => setThumbnailFile(null)}
                    disabled={uploadingVideo}
                    danger
                  />
                </div>
              </div>
            )}

            {isEditMode && !thumbnailFile && currentVideo?.thumbnailUrl && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-600">
                  Current thumbnail will be kept if not changed
                </p>
              </div>
            )}
          </Form.Item>

          <Form.Item label="Video File" required={!isEditMode}>
            {isEditMode ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                <div className="text-center">
                  <VideoCameraOutlined className="text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-600 font-medium mb-1">Video Cannot Be Changed</p>
                  <p className="text-xs text-gray-500">
                    Video files are locked after upload for security reasons
                  </p>
                  {currentVideo?.videoId && (
                    <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                      <p className="text-xs text-gray-600">
                        Video ID: <span className="font-mono text-gray-800">{currentVideo.videoId}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Dragger {...videoProps} disabled={uploadingVideo}>
                  <p className="ant-upload-drag-icon">
                    <VideoCameraOutlined style={{ color: videoFile ? '#CA3939' : '#CA3939' }} />
                  </p>
                  <p className="ant-upload-text">
                    {videoFile ? 'Video Selected' : 'Click or drag to upload'}
                  </p>
                  <p className="ant-upload-hint">
                    Support: MP4, WEBM, MOV, AVI
                  </p>
                </Dragger>

                {videoFile && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            {videoFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {formatFileSize(videoFile.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseCircleOutlined />}
                        onClick={() => setVideoFile(null)}
                        disabled={uploadingVideo}
                        danger
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </Form.Item>
        </div>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: "Please enter description" },
            { min: 10, message: "Description must be at least 10 characters" }
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Enter video description (minimum 10 characters)"
            disabled={uploadingVideo}
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            size="large"
            onClick={onCancel}
            disabled={uploadingVideo}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={isLoading}
            disabled={uploadingVideo && uploadProgress < 100}
            icon={<CloudUploadOutlined />}
            className="bg-[#CA3939] text-white"
          >
            {uploadingVideo
              ? `Uploading... ${uploadProgress}%`
              : isEditMode
                ? "Update Video"
                : "Upload Video"
            }
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default VideoUploadModal;
