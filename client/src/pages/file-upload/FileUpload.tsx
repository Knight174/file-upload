import { useRef, useState } from "react";
import "./file-upload.css";
import axios, { AxiosResponse } from "axios";

interface MyFile {
  uuid?: string;
  size?: number | string;
  name?: string;
  blob: File;
}

interface MyResponse {
  code: string | number;
  data?: Array<string>[];
  message: string;
}

export const FileUpload: React.FC = () => {
  const uploader = useRef<HTMLInputElement>(null);
  const [imgs, setImgs] = useState<MyFile[] | null>(null);

  const handleFileChange = () => {
    console.log(uploader.current?.files); // 已选择文件的数据流
    // console.log(uploader.current?.value); // 已选择文件的路径

    const fileListArray = Array.from(
      uploader.current?.files as Iterable<File> | ArrayLike<File>
    ).map((file) => ({
      uuid: crypto.randomUUID(),
      size: returnFileSize(file.size),
      fileName: file.name,
      blob: file,
    }));
    setImgs(fileListArray);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    if (imgs) {
      for (const file of imgs) {
        formData.append("files", file.blob);
      }
    }

    const response: AxiosResponse<MyResponse> = await axios.post<MyResponse>(
      "http://localhost:3000/api/v1/upload/files",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    try {
      const responseData = response.data;
      if (responseData.code !== 200) {
        window.alert(responseData.message);
      } else {
        window.alert(responseData.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (uuid?: string) => {
    console.log("delete", uuid);
    if (imgs) {
      const updatedImgs = imgs.filter((img) => img.uuid !== uuid);
      setImgs(updatedImgs);
    }
  };

  const returnFileSize = (number: number) => {
    if (number < 1024) {
      return `${number} bytes`;
    } else if (number >= 1024 && number < 1048576) {
      return `${(number / 1024).toFixed(1)} KB`;
    } else if (number >= 1048576) {
      return `${(number / 1048576).toFixed(1)} MB`;
    }
  };

  return (
    <>
      <div className="upload-button">
        <input
          id="upload"
          className="upload-input"
          type="file"
          multiple
          ref={uploader}
          onChange={handleFileChange}
          accept="image/*"
        />
        <label htmlFor="upload" className="upload-label">
          <span className="upload-icon"></span>
          Choose images
        </label>
      </div>
      <div>
        <button onClick={handleUpload}>Upload</button>
      </div>
      <div className="preview">
        {!imgs ? <p>No files currently selected for upload</p> : null}
        <ul>
          {imgs
            ? imgs.map((img) => (
                <li key={img.uuid}>
                  name: {img.name} | size: {img.size} |
                  <button onClick={() => handleDelete(img.uuid)}>delete</button>
                </li>
              ))
            : null}
        </ul>
      </div>
    </>
  );
};
