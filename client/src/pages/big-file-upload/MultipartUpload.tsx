export const MultipartUpload: React.FC = () => {
  const handleUpload = (file: File) => {
    const chunkSize = 1024 * 1024; // 每个切片的大小（这里设置为1MB）
    const totalChunks = Math.ceil(file.size / chunkSize); // 总的切片数
    const chunks: Blob[] = []; // 存储切片的数组

    // 将文件切割成多个块
    for (let start = 0; start < file.size; start += chunkSize) {
      const chunk = file.slice(start, start + chunkSize);
      chunks.push(chunk);
    }

    // 上传每个切片
    chunks.forEach((chunk, index) => {
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('index', String(index));
      formData.append('totalChunks', String(totalChunks));

      // 发送切片上传请求
      // 可以使用 fetch 或其他的 HTTP 请求库发送请求
      // 例如：fetch('/upload', { method: 'POST', body: formData })
      // 替换上面的 fetch 请求为你实际使用的方式

      console.log(`Uploading chunk ${index + 1} of ${totalChunks}`);
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      handleUpload(file);
    }
  };

  return (
    <div>
      <input type="file" multiple onChange={handleChange} />
    </div>
  );
};
