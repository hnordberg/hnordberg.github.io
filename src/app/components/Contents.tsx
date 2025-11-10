'use client'

import styles from './Contents.module.css'

interface Article {
  id: string
  title: string
}

interface ContentsProps {
  articles: Article[]
}

export default function Contents({ articles }: ContentsProps) {
  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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

