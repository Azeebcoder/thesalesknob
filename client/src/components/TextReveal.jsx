// Splits text into accessible, animated word or character spans.
import { cloneElement, Fragment, isValidElement } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const letterGroupVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.014 } },
}
const characterVariants = {
  rise: {
    hidden: { opacity: 0, y: '110%' },
    visible: {
      opacity: 1,
      y: '0%',
      transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
    },
  },
  flip: {
    hidden: { opacity: 0, rotateX: -85, y: 8 },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: { duration: 0.64, ease: [0.22, 1, 0.36, 1] },
    },
  },
  pop: {
    hidden: { opacity: 0, scale: 0.72, y: 12 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] },
    },
  },
}
const slideWordVariants = {
  hidden: { opacity: 0, x: -24, rotateY: -12 },
  visible: {
    opacity: 1,
    x: 0,
    rotateY: 0,
    transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
  },
}

// Recursively converts text children into spans configured for reveal animation.
function splitText(children, variant, key = 'text') {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children).split(/(\s+)/).map((part, index) => {
      if (!part.trim()) return part
      if (variant === 'slide') {
        return (
          <motion.span className="text-reveal-word text-reveal-word--slide" variants={slideWordVariants} key={`${key}-word-${index}`}>
            {part}
          </motion.span>
        )
      }
      return (
        <motion.span className="text-reveal-word" variants={letterGroupVariants} key={`${key}-word-${index}`}>
          {Array.from(part).map((character, characterIndex) => (
            <motion.span
              className="text-reveal-char"
              variants={characterVariants[variant] || characterVariants.rise}
              key={`${key}-char-${index}-${characterIndex}`}
            >
              {character}
            </motion.span>
          ))}
        </motion.span>
      )
    })
  }
  if (Array.isArray(children)) {
    return children.map((child, index) => (
      <Fragment key={`${key}-${index}`}>{splitText(child, variant, `${key}-${index}`)}</Fragment>
    ))
  }
  if (isValidElement(children)) {
    return cloneElement(children, {
      children: splitText(children.props.children, variant, `${key}-child`),
    })
  }
  return children
}

// Extracts readable plain text from nested React children for screen readers.
function plainText(children) {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(plainText).join('')
  if (isValidElement(children)) {
    return children.type === 'br' ? ' ' : plainText(children.props.children)
  }
  return ''
}

// Renders decorative animated text alongside an accessible plain-text equivalent.
export function TextReveal({ children, variant = 'rise' }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <>
      <motion.span
        className={`text-reveal-visual text-reveal-visual--${variant}`}
        aria-hidden="true"
        initial={shouldReduceMotion ? false : 'hidden'}
        whileInView={shouldReduceMotion ? undefined : 'visible'}
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: variant === 'slide' ? 0.09 : 0.045, delayChildren: 0.03 } },
        }}
      >
        {splitText(children, variant)}
      </motion.span>
      <span className="figma-visually-hidden">{plainText(children)}</span>
    </>
  )
}
