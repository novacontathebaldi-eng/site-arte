'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Heart, Star } from 'lucide-react';
import { useProductsStore } from '@/store/productsStore';
import { ProductCard } from '@/components/products/ProductCard';
import { NewsletterSignup } from '@/components/common/NewsletterSignup';

export default function HomePage() {
  const { t } = useTranslation();
  const { featuredProducts, loadFeaturedProducts } = useProductsStore();

  useEffect(() => {
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/hero-image.jpg"
            alt="Melissa Pelussi Art"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            Melissa Pelussi
          </motion.h1>
          
          <motion.p
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 font-light"
          >
            Contemporary Artist
          </motion.p>
          
          <motion.p
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="text-lg mb-12 max-w-2xl mx-auto"
          >
            Bridging traditional and digital media to create unique artworks that capture the essence of modern European aesthetics.
          </motion.p>
          
          <motion.div
            variants={heroVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-medium rounded-md hover:bg-gray-100 transition-colors"
            >
              {t('explore-catalog')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-medium rounded-md hover:bg-white hover:text-primary transition-colors"
            >
              {t('learn-more')}
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <ArrowRight className="w-6 h-6 rotate-90" />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('featured-artworks')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular pieces, each telling a unique story through color, form, and emotion.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
            >
              {t('view-all-artworks')}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-6">
                {t('about-the-artist')}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Melissa Pelussi, known in the art world as Meeh, is a contemporary artist based in Luxembourg 
                whose work bridges traditional and digital media. Born with an innate passion for color and form, 
                Meeh has developed a distinctive style that captures the essence of modern European aesthetics.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Her artistic journey began with painting, exploring the interplay of light and shadow through 
                oil and acrylic. Over the years, her creative expression expanded to include jewelry design, 
                where each piece becomes a wearable sculpture, and digital art, where she pushes the boundaries 
                of technology and imagination.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-white font-medium rounded-md hover:bg-secondary-dark transition-colors"
              >
                {t('read-more')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-square rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/artist-portrait.jpg"
                  alt="Melissa Pelussi"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-heading text-2xl font-bold">Meeh</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('art-categories')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore different forms of artistic expression, from traditional paintings to contemporary digital art.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: t('paintings'),
                description: t('paintings-description'),
                image: '/category-paintings.jpg',
                href: '/catalog?category=paintings'
              },
              {
                title: t('jewelry'),
                description: t('jewelry-description'),
                image: '/category-jewelry.jpg',
                href: '/catalog?category=jewelry'
              },
              {
                title: t('digital-art'),
                description: t('digital-art-description'),
                image: '/category-digital.jpg',
                href: '/catalog?category=digital'
              },
              {
                title: t('prints'),
                description: t('prints-description'),
                image: '/category-prints.jpg',
                href: '/catalog?category=prints'
              }
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg shadow-lg"
              >
                <div className="aspect-square">
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-heading text-xl font-bold mb-2">{category.title}</h3>
                  <p className="text-sm text-gray-200 mb-4">{category.description}</p>
                  <Link
                    href={category.href}
                    className="inline-flex items-center text-sm font-medium hover:text-secondary transition-colors"
                  >
                    {t('explore')}
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('what-our-clients-say')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from collectors who have brought Melissa's art into their lives.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sophie M.',
                location: 'Luxembourg',
                text: 'The painting I purchased exceeded all my expectations. The colors are even more vibrant in person, and it brings such joy to my living room.',
                rating: 5
              },
              {
                name: 'Jean-Pierre L.',
                location: 'Belgium',
                text: 'Melissa\'s jewelry pieces are true works of art. I wear my pendant every day and always receive compliments. The craftsmanship is exceptional.',
                rating: 5
              },
              {
                name: 'Maria G.',
                location: 'Germany',
                text: 'The digital artwork I commissioned perfectly captures the emotion I was looking for. Melissa understood my vision and brought it to life beautifully.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-medium text-primary">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              {t('stay-connected')}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Subscribe to our newsletter for exclusive previews of new artworks and special offers.
            </p>
            <NewsletterSignup />
          </motion.div>
        </div>
      </section>
    </div>
  );
}