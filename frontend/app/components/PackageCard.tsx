'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MapPin, Clock, Star, Users, Heart } from 'lucide-react';
import Button from './Button';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  rating: number;
  image: string;
  agency: string;
  maxPeople: number;
}

interface PackageCardProps {
  package: Package;
  index?: number;
}

const PackageCard = ({ package: pkg, index = 0 }: PackageCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      className="card-elevated overflow-hidden group relative"
    >
      {/* Image Container */}
      <div className="relative h-56 overflow-hidden rounded-t-xl">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Price Badge */}
        <motion.div 
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-lg font-bold text-green-600">${pkg.price}</span>
        </motion.div>
        
        {/* Wishlist Button */}
        <motion.button
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
        </motion.button>
        
        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg">
          <Star className="w-4 h-4 text-amber-400 fill-current" />
          <span className="text-sm font-semibold text-gray-700">{pkg.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-h3 line-clamp-1 group-hover:text-green-600 transition-colors duration-300">
            {pkg.name}
          </h3>
        </div>

        <p className="text-body mb-4 line-clamp-2">
          {pkg.description}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          <motion.div 
            className="flex items-center space-x-3 text-small"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2 bg-green-50 rounded-lg">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-neutral-600">{pkg.location}</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-3 text-small"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-neutral-600">{pkg.duration}</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-3 text-small"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2 bg-amber-50 rounded-lg">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-neutral-600">Max {pkg.maxPeople} people</span>
          </motion.div>
        </div>

        {/* Agency */}
        <div className="mb-6">
          <p className="text-small text-neutral-400">
            by <span className="font-medium text-neutral-600">{pkg.agency}</span>
          </p>
        </div>

        {/* Action Button */}
        <Link href={`/packages/${pkg.id}`}>
          <Button 
            variant="primary" 
            size="md" 
            className="w-full hover-glow"
          >
            View Details
          </Button>
        </Link>
      </div>
      
      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-green-200 transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
};

export default PackageCard;
