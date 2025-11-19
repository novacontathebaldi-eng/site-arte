import React from 'react';
import Button from './common/Button';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh]">
            <h1 className="text-6xl font-serif font-bold text-brand-black/20">404</h1>
            <h2 className="mt-4 text-3xl font-serif font-bold text-brand-black">Page Not Found</h2>
            <p className="mt-2 text-brand-black/70">
                The artwork you're looking for might have been sold, moved, or never existed.
            </p>
            <div className="mt-8">
                <Button as="a" href="#/catalog" variant="primary" size="lg">
                    Back to Catalog
                </Button>
            </div>
        </div>
    );
};

export default NotFoundPage;
