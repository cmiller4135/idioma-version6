import React, { useEffect, useState } from 'react';


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
        const apiKey = import.meta.env.VITE_PIXABAY_API_KEY;
        const sanitizedDescription = description.replace(/[^\w\s]/gi, ''); // Remove non-alphanumeric characters
        const response = await fetch(
          `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(sanitizedDescription)}&image_type=photo&orientation=horizontal&per_page=3&safesearch=true&min_width=800`
        );
        const data = await response.json();
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
      {imageUrl ? (
        <img src={imageUrl} alt={description} className="mb-1 rounded-lg shadow-md" />
      ) : (
        <p className="mt-4 text-red-500">{error}</p>
      )}
    </div>
  );
};

export default PixabayImage;
