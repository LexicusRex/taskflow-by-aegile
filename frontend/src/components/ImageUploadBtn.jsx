import { Button } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DoneIcon from '@mui/icons-material/Done';
import { useEffect, useState } from 'react';
import Compressor from 'compressorjs';

const blobIntoFile = (blobObj, fileName) => {
  blobObj.lastModifiedDate = new Date();
  blobObj.name = `${fileName}_compressed`;
  return blobObj;
};

const ImageUploadBtn = ({
  callback,
  compressedCallback,
  btnText,
  isToCompress = false,
  btnIcon = <FileUploadIcon />,
  color = 'primary',
}) => {
  const [thumbnail, setThumbnail] = useState(null);
  const [compressedImg, setCompressedImg] = useState(null);

  const convertImageToUrl = (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      imageFile instanceof File
        ? reader.readAsDataURL(imageFile)
        : reader.readAsDataURL(blobIntoFile(imageFile, 'profile_picture'));

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = (error) => {
        reject(error);
      };
    });
  };
  const parseImage = async (event) => {
    const imageFile = event.target.files[0];
    isToCompress &&
      new Compressor(imageFile, {
        quality: 0.6,
        success: (compressedResult) => {
          setCompressedImg(compressedResult);
        },
        width: 75,
        height: 75,
        resize: 'cover',
      });

    const imageUrl = await convertImageToUrl(imageFile);
    setThumbnail(imageUrl);
    callback(imageUrl);
  };

  useEffect(() => {
    const compressImage = async () => {
      const compressedImageUrl = await convertImageToUrl(compressedImg);
      compressedCallback(compressedImageUrl);
    };
    compressedImg && compressImage();
  }, [compressedImg, compressedCallback]);

  return (
    <Button
      variant="contained"
      color={thumbnail ? 'success' : color}
      component="label"
      startIcon={thumbnail ? <DoneIcon /> : btnIcon}
    >
      {thumbnail ? 'Uploaded' : btnText}
      <input
        type="file"
        hidden
        accept="image/jpg, image/jpeg, image/png"
        onChange={(event) => parseImage(event)}
      />
    </Button>
  );
};
export default ImageUploadBtn;
