import { useState } from 'react';

const useModal = () => {
  const [isModalShown, setIsModalShown] = useState(false);

  const toggleModal = () => {
    setIsModalShown(!isModalShown);
  };

  return {
    isModalShown,
    toggleModal,
  };
};

export default useModal;
