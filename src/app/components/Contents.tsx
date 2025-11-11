'use client'

import { useEffect, useCallback } from 'react'
import styles from './Contents.module.css'

interface Article {
  id: string
  title: string
}

interface ContentsProps {
  articles: Article[]
}

export default function Contents({ articles }: ContentsProps) {
  const highlightCard = useCallback((id: string, scroll: boolean = true) => {
    const element = document.getElementById(id)
    if (element) {
      // Remove selected class from all cards
      document.querySelectorAll('.card.selected').forEach(card => {
        card.classList.remove('selected')
      })
      
      // Add selected class to the target card
      element.classList.add('selected')
      
      if (scroll) {
        const header = document.querySelector('header')
        const headerHeight = header ? header.offsetHeight : 0
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
        const offsetPosition = elementPosition - headerHeight - 20 // 20px extra padding
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
      
      // Remove selected class after 3 seconds (keep hash in URL for bookmarking)
      setTimeout(() => {
        element.classList.remove('selected')
      }, 3000)
    }
  }, [])

  const handleClick = (id: string) => {
    // Update URL hash for :target pseudo-class and bookmarking
    window.history.pushState(null, '', `#${id}`)
    highlightCard(id, true)
  }

  // Handle initial page load with hash
  useEffect(() => {
    const hash = window.location.hash.slice(1) // Remove the #
    if (hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        highlightCard(hash, false) // Don't scroll on initial load if already scrolled
      }, 100)
    }
  }, [highlightCard])

  if (articles.length === 0) {
    return null
  }

  return (
    <div className={styles.contents}>
      <div className={styles.contentsTitle}>Contents</div>
      <ul className={styles.contentsList}>
        {articles.map((article) => (
          <li key={article.id}>
            <button
              onClick={() => handleClick(article.id)}
              className={styles.contentsLink}
            >
              {article.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

