"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, BedDouble, Bath, Car, MapPin } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/types/property";

/**
 * Enhanced property card with clickable interactions, image zoom, and working heart button
 * ------------------------------------------------------------------------------------
 * Features:
 *  • Entire card is clickable with hover effects
 *  • Image zoom on hover with smooth transitions
 *  • Working heart button with like/unlike state
 *  • Enhanced Framer Motion animations
 *  • Glass morphism effects
 *  • Better visual hierarchy
 */
export function PropertyCard({
  id,
  address,
  beds,
  baths,
  garage,
  sqft,
  price,
  description,
  image,
  property_type,
  sale_type,
}: Property) {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Link href={`/property/${id}`} className="block">
        <Card className="rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white dark:bg-gray-900">
          {/* Hero image with zoom effect */}
          <div className="relative aspect-video bg-muted/20 overflow-hidden">
            <motion.div
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Image
                src={image}
                alt={`Image of ${address}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.jpg";
                }}
              />
            </motion.div>

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Top overlay with property type and heart button */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-start justify-between">
              <Badge 
                variant="secondary" 
                className="bg-white/90 dark:bg-black/70 backdrop-blur-sm text-gray-900 dark:text-white border-0 font-medium"
              >
                {property_type.charAt(0).toUpperCase() + property_type.slice(1)}
              </Badge>

              {/* Heart button with animation */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-white/80 dark:bg-black/60 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-black/80 transition-colors"
                  onClick={handleHeartClick}
                  aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
                >
                  <AnimatePresence mode="wait">
                    {isLiked ? (
                      <motion.div
                        key="liked"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="not-liked"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Heart className="h-5 w-5 text-white hover:text-red-400 transition-colors" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>

            {/* Bottom overlay with price and rating */}
            <div className="absolute bottom-0 inset-x-0 p-4">
              <div className="flex items-end justify-between">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-white font-bold text-xl drop-shadow-lg">
                    {price}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Content section */}
          <CardHeader className="pt-4 pb-2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-start justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base font-semibold leading-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {address}
                </CardTitle>
                
                <CardDescription className="mt-2 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  <motion.span 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <BedDouble className="h-4 w-4" />
                    <span className="font-medium">{beds}</span>
                  </motion.span>
                  
                  <motion.span 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Bath className="h-4 w-4" />
                    <span className="font-medium">{baths}</span>
                  </motion.span>
                  
                  <motion.span 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Car className="h-4 w-4" />
                    <span className="font-medium">{garage}</span>
                  </motion.span>
                  
                  {sqft && (
                    <motion.span 
                      className="flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="font-medium">{sqft.toLocaleString()} sqft</span>
                    </motion.span>
                  )}
                </CardDescription>
              </div>
            </motion.div>
          </CardHeader>

          <CardContent className="pb-4 pt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                {description}
              </p>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white border-0 transition-all duration-300 group-hover:shadow-lg font-medium">
                  View Details
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
