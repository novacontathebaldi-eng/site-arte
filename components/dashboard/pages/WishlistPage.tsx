import React from 'react';
import { useWishlist } from '../../../hooks/useWishlist';
import { useCart } from '../../../hooks/useCart';
import { useI18n } from '../../../hooks/useI18n';
import Button from '../../common/Button';
import { useToast } from '../../../hooks/useToast';
import Spinner from '../../common/Spinner';

const WishlistPage: React.FC = () => {
  const { wishlistItems, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { t, language } = useI18n();
  
  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    addToast(t('cart.added'), 'success');
  };

  if (loading) {
      return <div className="flex justify-center"><Spinner /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold mb-6">{t('wishlist.title')}</h1>
      {wishlistItems.length === 0 ? (
        <p>{t('wishlist.empty')}</p>
      ) : (
        <div className="divide-y divide-black/10">
          {wishlistItems.map(item => (
            <div key={item.id} className="flex items-center py-4">
              <img src={item.images?.[0]?.thumbnailUrl || item.images?.[0]?.url} alt={item.translations?.[language]?.title} className="w-20 h-20 rounded object-cover"/>
              <div className="ml-4 flex-grow">
                <p className="font-semibold">{item.translations?.[language]?.title || item.translations?.en?.title}</p>
                <p className="text-sm text-brand-black/60">€{(item.price.amount / 100).toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => handleMoveToCart(item)}>{t('wishlist.moveToCart')}</Button>
                  <Button size="sm" variant="tertiary" onClick={() => removeFromWishlist(item.id)}>{t('wishlist.removed')}</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;