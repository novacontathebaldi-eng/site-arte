import React, { useState } from 'react';
import { ProductImage } from '../../firebase-types';

interface ImageGalleryProps {
    images: ProductImage[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-black/5 rounded-md flex items-center justify-center text-brand-black/50">No Image</div>;
    }
    
    const activeImage = images[activeIndex];

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
                {images.map((image, index) => (
                    <button 
                        key={index} 
                        onClick={() => setActiveIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden ring-offset-2 focus:outline-none focus:ring-2 focus:ring-brand-gold ${activeIndex === index ? 'ring-2 ring-brand-gold' : ''}`}
                    >
                        <img src={image.thumbnailUrl || image.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
            <div className="flex-1 aspect-w-3 aspect-h-4 w-full overflow-hidden bg-black/5 rounded-md">
                <img src={activeImage.url} alt={activeImage.alt || `Product image ${activeIndex + 1}`} className="w-full h-full object-cover" />
            </div>
        </div>
    );
};
export default ImageGallery;
