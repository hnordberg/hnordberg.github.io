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
  caption?: string
}

const LightboxImage = ({ 
  src, 
  alt, 
  width = 800, 
  height = 600,
  className = '',
  title,
  caption
}: LightboxImageProps) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  return (
    <>
      <div style={{ display: 'inline-block', width: '100%' }} className={className}>
        <Image 
          src={src} 
          alt={alt} 
          title={title || 'Click to enlarge'}
          width={width} 
          height={height}
          onClick={() => setIsLightboxOpen(true)}
          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        />
        {caption && (
          <div 
            style={{
              fontSize: '0.875rem',
              fontStyle: 'italic',
              marginTop: '0.5rem',
              textAlign: 'center',
              lineHeight: '1.4'
            }}
            className="image-caption"
          >
            {caption}
          </div>
        )}
      </div>
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        slides={[{ src, alt }]}
        closeOnBackdropClick={true}
        on={{
          click: () => setIsLightboxOpen(false),
        }}
      />
    </>
  )
}

export default LightboxImage

