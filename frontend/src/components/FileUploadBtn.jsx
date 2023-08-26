import { Button } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DoneIcon from '@mui/icons-material/Done';
import { useState } from 'react';

const FileUploadBtn = ({
  fileCallback,
  filenameCallback,
  btnText,
  btnIcon = <FileUploadIcon />,
  color = 'primary',
}) => {
  const [thumbnail, setThumbnail] = useState(null);

  const convertFileToUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const parseFile = async (event) => {
    const file = event.target.files[0];
    const filename = event.target.files[0].name;
    filenameCallback(filename);
    const fileUrl = await convertFileToUrl(file);
    setThumbnail(fileUrl);
    fileCallback(fileUrl);
  };

  return (
    <Button
      variant='contained'
      color={thumbnail ? 'success' : color}
      component='label'
      startIcon={thumbnail ? <DoneIcon /> : btnIcon}
      sx={{ width: '150px' }}
    >
      {thumbnail ? 'Uploaded' : btnText}
      <input
        type='file'
        hidden
        //accept="image/jpg, image/jpeg, image/png"
        onChange={(event) => parseFile(event)}
      />
    </Button>
  );
};
export default FileUploadBtn;
