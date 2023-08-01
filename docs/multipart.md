## 大文件切片上传

### 1. 文件切片

根据分片大小对 Blob 文件进行分片。

- e.target.files => FileList 数组中里面放着用户选中的 File，底层是 Blob 二进制类型的数据流，太大需要切分
- e.target.files[0] 第一个文件 => file.size 文件总大小
- 切片大小 chunkSize
- 计算总切片数 totalChunks
- 已上传切片数 uploadedChunks，用于计算上传进度

  ```ts
  for (let start = 0; start < file.size; start += chunkSize) {
    // ...
  }
  ```

### 2. 分片上传

循环每一片，进行上传。

- 构建 FormData 对象
  - chunk => Blob 数据片段
  - name => uuid
  - index => uuid@1
  - totalChunks => 总片数
- 上传 FormData 数据
  - uploadChunk(formData)

### 3. 上传进度

如果上传分片成功，更新上传进度。

```ts
uploadedChunks++;
const progress = Math.round((uploadedChunks / totalChunks) * 100);
console.log(
  `Uploading chunk ${uploadedChunks} of ${totalChunks} - ${progress}%`
);
```

### 4. 失败重试

如果上传分片失败，进入失败重试逻辑，在允许次数内调用 uploadChunk(formData)，如果上传成功则退出。

- retryCount 重试次数
- maxRetries 最大重试次数

```ts
while (retryCount < maxRetries) {
  try {
    await uploadChunk(formData);
    return; // 上传成功，退出重试循环
  } catch (error) {
    console.log(`Error retrying chunk upload:`, error);
    retryCount++;
  }
}
```

### 5. 合并请求

在把切片全都上传到服务端以后，需要告知服务端发送完毕，可以进行文件合并了。
