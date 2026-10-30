import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { heroScenes } from '../config/heroScenes';

const SCENE_DURATION = 4500;

export function SportsHeroBackground() {
  const [activeScene, setActiveScene] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const nextScene = (activeScene + 1) % heroScenes.length;
    const image = new Image();
    image.src = heroScenes[nextScene].src;
  }, [activeScene, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      setActiveScene((current) => (current + 1) % heroScenes.length);
    }, SCENE_DURATION);
    return () => window.clearInterval(timer);
  }, [activeScene, reduceMotion]);

  const selectScene = (index: number) => setActiveScene(index);
  const scene = heroScenes[activeScene];

  return (
    <div className="sports-hero-bg" aria-label="Four-sport cinematic hero background">
      <AnimatePresence initial={false}>
        <motion.div
          key={activeScene}
          className="sports-hero-scene"
          style={{ backgroundColor: scene.fallback }}
          initial={{ opacity: reduceMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduceMotion ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 1.15, ease: 'easeInOut' }}
        >
          <motion.img
            src={scene.src}
            alt={scene.alt}
            draggable={false}
            initial={reduceMotion ? false : { scale: 1.04, x: activeScene % 2 ? 18 : -18 }}
            animate={reduceMotion ? undefined : { scale: [1.04, 1.115], x: activeScene % 2 ? [-18, 18] : [18, -18] }}
            transition={{ duration: 4.8, ease: 'easeOut' }}
            style={{ objectPosition: scene.position }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="sports-hero-overlay" />
      <div className="sports-hero-light streak-blue" />
      <div className="sports-hero-light streak-orange" />
      <div className="scene-indicators" role="tablist" aria-label="Hero sports scenes">
        {heroScenes.map((item, index) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={index === activeScene}
            className={index === activeScene ? 'active' : ''}
            onClick={() => selectScene(index)}
          >
            <span>{item.label}</span>
            <i><b key={`${activeScene}-${index}`} /></i>
          </button>
        ))}
      </div>
    </div>
  );
}
