export const MultipartUpload: React.FC = () => {
  const handleChange = (event?: Event) => {
    const file = event!.target;
    console.log(file);
  };

  return (
    <div>
      <input type="file" onChange={() => handleChange(event)} />
    </div>
  );
};
