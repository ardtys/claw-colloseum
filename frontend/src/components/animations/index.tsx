'use client'

import { motion, useInView, useSpring, useTransform } from 'framer-motion'
import { useRef, useEffect, ReactNode } from 'react'

// Fade in animation wrapper
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = 'up',
  className = '',
}: {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}) {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scroll-triggered fade in
export function FadeInOnScroll({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  className = '',
  threshold = 0.1,
}: {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
  threshold?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: threshold })

  const directions = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { x: 60, y: 0 },
    right: { x: -60, y: 0 },
    none: { x: 0, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger children animation
export function StaggerContainer({
  children,
  delay = 0,
  staggerDelay = 0.1,
  className = '',
}: {
  children: ReactNode
  delay?: number
  staggerDelay?: number
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.25, 0.4, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Scroll-triggered stagger
export function StaggerOnScroll({
  children,
  delay = 0,
  staggerDelay = 0.1,
  className = '',
}: {
  children: ReactNode
  delay?: number
  staggerDelay?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated counter
export function AnimatedCounter({
  value,
  duration = 2,
  className = '',
}: {
  value: number
  duration?: number
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  })

  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  )

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [isInView, spring, value])

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}

// Scale on hover
export function ScaleOnHover({
  children,
  scale = 1.02,
  className = '',
}: {
  children: ReactNode
  scale?: number
  className?: string
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Glow pulse animation
export function GlowPulse({
  children,
  color = 'rgba(249, 115, 22, 0.4)',
  className = '',
}: {
  children: ReactNode
  color?: string
  className?: string
}) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px ${color}`,
          `0 0 40px ${color}`,
          `0 0 20px ${color}`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Typing animation
export function TypeWriter({
  text,
  delay = 0,
  speed = 50,
  className = '',
}: {
  text: string
  delay?: number
  speed?: number
  className?: string
}) {
  return (
    <motion.span className={className}>
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.01,
            delay: delay + index * (speed / 1000),
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  )
}

// Floating animation
export function Float({
  children,
  duration = 3,
  distance = 10,
  className = '',
}: {
  children: ReactNode
  duration?: number
  distance?: number
  className?: string
}) {
  return (
    <motion.div
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Shimmer effect for loading states
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

// Battle attack animation
export function AttackLine({
  isActive,
  direction = 'right',
}: {
  isActive: boolean
  direction?: 'left' | 'right'
}) {
  return (
    <motion.div
      className="absolute top-1/2 h-1 bg-gradient-to-r from-accent via-warning to-danger rounded-full"
      initial={{ width: 0, opacity: 0 }}
      animate={
        isActive
          ? {
              width: '100%',
              opacity: [0, 1, 1, 0],
              x: direction === 'right' ? [0, 0] : [0, 0],
            }
          : { width: 0, opacity: 0 }
      }
      transition={{ duration: 0.3 }}
      style={{
        left: direction === 'right' ? 0 : 'auto',
        right: direction === 'left' ? 0 : 'auto',
        transformOrigin: direction === 'right' ? 'left' : 'right',
      }}
    />
  )
}

// Page transition wrapper
export function PageTransition({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Reveal text animation
export function RevealText({
  children,
  delay = 0,
  className = '',
}: {
  children: string
  delay?: number
  className?: string
}) {
  const words = children.split(' ')

  return (
    <motion.span className={className}>
      {words.map((word, index) => (
        <span key={index} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.5,
              delay: delay + index * 0.05,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}
