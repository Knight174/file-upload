import axios from 'axios';

export const MultipartUpload: React.FC = () => {
  const handleUpload = async (file: File) => {
    const chunkSize = 1024 * 1024; // 每个切片的大小（这里设置为1MB）
    const totalChunks = Math.ceil(file.size / chunkSize); // 总的切片数
    let uploadedChunks = 0; // 已上传的切片数
    const uuid = crypto.randomUUID();

    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize);
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('name', uuid);
      formData.append('index', uuid + '@' + String(start / chunkSize));
      formData.append('totalChunks', String(totalChunks));

      try {
        await uploadChunk(formData); // 上传切片

        uploadedChunks++;
        const progress = Math.round((uploadedChunks / totalChunks) * 100);
        console.log(
          `Uploading chunk ${uploadedChunks} of ${totalChunks} - ${progress}%`
        );
      } catch (error) {
        console.log(`Error uploading chunk ${uploadedChunks + 1}:`, error);
        // 失败重试
        await retryChunk(formData);
        uploadedChunks--;
      }
    }

    console.log('Upload complete');
    const response = await axios.post(
      'http://localhost:3000/api/v1/upload/multipart_merge',
      {
        name: uuid, // 文件名称
        extname: file.name.split('.').slice(-1)[0], // 文件后缀
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    window.alert(response.data.message);
  };

  const uploadChunk = (formData: FormData) => {
    // 发送切片上传请求
    // 返回一个 Promise，可以使用 fetch 或其他的 HTTP 请求库发送请求
    // 例如：return fetch('/upload', { method: 'POST', body: formData })
    // 替换上面的 fetch 请求为你实际使用的方式

    // 模拟异步请求
    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     // 模拟上传成功
    //     resolve('success');

    //     // 模拟上传失败
    //     // reject(new Error('Upload failed'));
    //   }, 1000);
    // });

    return axios.post(
      'http://localhost:3000/api/v1/upload/multipart',
      formData
    );
  };

  const retryChunk = async (formData: FormData) => {
    // 失败重试
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        await uploadChunk(formData);
        return; // 上传成功，退出重试循环
      } catch (error) {
        console.log(`Error retrying chunk upload:`, error);
        retryCount++;
      }
    }

    console.log('Max retries exceeded');
    throw new Error('Max retries exceeded');
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    console.log(files);
    if (files && files.length > 0) {
      const file = files[0];
      await handleUpload(file);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleChange} />
    </div>
  );
};
