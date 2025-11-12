'use client'

import { useState } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

interface LightboxImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  title?: string
}

const LightboxImage = ({ 
  src, 
  alt, 
  width = 800, 
  height = 600,
  className = '',
  title
}: LightboxImageProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  return (
    <>
      <Image 
        src={src} 
        alt={alt} 
        title={title || 'Click to enlarge'}
        width={width} 
        height={height}
        className={className}
        onClick={() => setIsLightboxOpen(true)}
        style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1'
        }}
      />
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={[{ src, alt }]}
      />
    </>
  )
}

export default LightboxImage

