import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { searchPixabay } from '../lib/edgeFunctions';

interface PixabayImageProps {
  description: string;
}

const PixabayImage: React.FC<PixabayImageProps> = ({ description }) => {
  const { t } = useTranslation('common');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      console.log('Fetching Pixabay image for description:', description);
      try {
        const sanitizedDescription = description.replace(/[^\w\s]/gi, ''); // Remove non-alphanumeric characters
        const data = await searchPixabay(sanitizedDescription, {
          imageType: 'photo',
          orientation: 'horizontal',
          perPage: 3
        });

        if (data.hits && data.hits.length > 0) {
          setImageUrl(data.hits[0].webformatURL);
        } else {
          setError(t('imageErrors.noImages'));
        }
      } catch {
        setError(t('imageErrors.fetchError'));
      }
    };

    fetchImage();
  }, [description, t]);

  return (
    <div>
      {imageUrl ? (
        <img src={imageUrl} alt={description} className="mb-1 rounded-lg shadow-md" />
      ) : (
        <p className="mt-4 text-red-500">{error}</p>
      )}
    </div>
  );
};

export default PixabayImage;
