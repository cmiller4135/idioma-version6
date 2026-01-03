import React, { useEffect, useState } from 'react';
import { searchPixabay } from '../lib/edgeFunctions';

interface PixabayImageProps {
  description: string;
}

const PixabayImage: React.FC<PixabayImageProps> = ({ description }) => {
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
          setError('No images found');
        }
      } catch (err) {
        setError('Error fetching image');
      }
    };

    fetchImage();
  }, [description]);

  return (
    <div>
    <div>
      {imageUrl ? (
        <img src={imageUrl} alt={description} className="mb-1 rounded-lg shadow-md" />
      ) : (
        <p className="mt-4 text-red-500">{error}</p>
      )}
    </div>
      </div>
  );
};

export default PixabayImage;
