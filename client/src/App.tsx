import './App.css';
import { MultipartUpload } from './pages/big-file-upload/MultiPartUpload';
import { FileUpload } from './pages/file-upload/FileUpload';

function App() {
  return (
    <>
      <FileUpload />
      <p>=======================</p>
      <MultipartUpload />
    </>
  );
}

export default App;
