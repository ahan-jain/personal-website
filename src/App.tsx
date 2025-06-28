import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ExternalLink, Mail, Linkedin, Github, FileText, X } from 'lucide-react';
import Particles from './components/Particles';

function App() {
  const [isNavbarSolid, setIsNavbarSolid] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Refs for fixed time-interval typewriter
  const animationRef = useRef();
  const lastUpdateTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const pauseStartRef = useRef(0);
  const targetTextRef = useRef('');

  const typingPhrases = [
    "a Computer Science Student @ Northeastern University",
    "an Incoming Software Engineer @ Darby",
    "a Pianist, Drummer, Guitarist and Vocalist",
    "a Backend Developer",
    "an AI & ML enthusiast",
    "a Soccer Aficionado"
  ];

  // Scroll to top on page load/refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavbarSolid(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.fade-in-up');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Handle modal open/close with scroll prevention
  const openModal = (index: number) => {
    setSelectedProject(index);
    setIsClosing(false);
    setIsModalAnimating(false);
    
    // Disable background scrolling
    document.body.style.overflow = 'hidden';
    
    // Trigger fade-in animation
    requestAnimationFrame(() => {
      setIsModalAnimating(true);
    });
  };

  const closeModal = () => {
    setIsClosing(true);
    setIsModalAnimating(false);
    
    // Wait for fade-out animation to complete
    setTimeout(() => {
      setSelectedProject(null);
      setIsClosing(false);
      // Re-enable background scrolling
      document.body.style.overflow = 'unset';
    }, 300);
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedProject !== null) {
      // Prevent wheel scrolling
      const preventScroll = (e: WheelEvent) => {
        e.preventDefault();
      };

      // Prevent keyboard scrolling (arrow keys, space, page up/down)
      const preventKeyScroll = (e: KeyboardEvent) => {
        const scrollKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End'];
        if (scrollKeys.includes(e.code)) {
          e.preventDefault();
        }
      };

      // Prevent touch scrolling
      const preventTouchScroll = (e: TouchEvent) => {
        if (e.touches.length > 1) return; // Allow pinch zoom
        e.preventDefault();
      };

      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('keydown', preventKeyScroll);
      document.addEventListener('touchmove', preventTouchScroll, { passive: false });

      return () => {
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('keydown', preventKeyScroll);
        document.removeEventListener('touchmove', preventTouchScroll);
      };
    }
  }, [selectedProject]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProject !== null) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedProject]);

  // Fixed time-interval typewriter with 120fps updates
  useEffect(() => {
    const CHAR_INTERVAL_TYPING = 80; // ms per character when typing
    const CHAR_INTERVAL_DELETING = 50; // ms per character when deleting
    const PAUSE_DURATION = 2000; // ms to pause before deleting
    const TARGET_FPS = 120; // 120fps for smooth updates
    const FRAME_INTERVAL = 1000 / TARGET_FPS; // ~8.33ms per frame

    const animate = (timestamp) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp;
      }

      const deltaTime = timestamp - lastUpdateTimeRef.current;
      
      // Only process if enough time has passed for our target FPS
      if (deltaTime >= FRAME_INTERVAL) {
        const targetPhrase = typingPhrases[currentIndex];
        
        // Initialize animation state
        if (!isAnimatingRef.current) {
          targetTextRef.current = isDeleting ? '' : targetPhrase;
          isAnimatingRef.current = true;
          pauseStartRef.current = 0;
          accumulatedTimeRef.current = 0;
        }

        // Handle pause before deleting
        if (!isDeleting && currentText === targetPhrase && !pauseStartRef.current) {
          pauseStartRef.current = timestamp;
        }

        if (pauseStartRef.current && timestamp - pauseStartRef.current >= PAUSE_DURATION) {
          setIsDeleting(true);
          isAnimatingRef.current = false;
          pauseStartRef.current = 0;
        } else if (!pauseStartRef.current) {
          // Accumulate time for character intervals
          accumulatedTimeRef.current += deltaTime;
          
          const charInterval = isDeleting ? CHAR_INTERVAL_DELETING : CHAR_INTERVAL_TYPING;
          
          // Only emit one character per interval, regardless of frame drops
          if (accumulatedTimeRef.current >= charInterval) {
            const intervalsToProcess = Math.floor(accumulatedTimeRef.current / charInterval);
            
            // Process exactly one character interval
            if (isDeleting) {
              if (currentText.length > 0) {
                setCurrentText(prev => prev.slice(0, -1));
              } else {
                setIsDeleting(false);
                setCurrentIndex((prev) => (prev + 1) % typingPhrases.length);
                isAnimatingRef.current = false;
              }
            } else {
              if (currentText.length < targetPhrase.length) {
                setCurrentText(targetPhrase.slice(0, currentText.length + 1));
              }
            }
            
            // Subtract only one interval, carry over leftover time
            accumulatedTimeRef.current -= charInterval;
          }
        }

        lastUpdateTimeRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [currentIndex, isDeleting, currentText, typingPhrases]);

  // Terminal cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  const portfolioProjects = [
    {
      title: "Husky Laundry",
      description: "Real-time laundry monitoring web app",
      fullDescription: "Real-time laundry monitoring web app that tracks machine availability across Northeastern dorms, computes live usage stats, and delivers predictive insights to help students minimize wait times.",
      image: "/laundry.png",
      githubLink: "https://github.com/Oasis-NEU/s24-group9/tree/main/husky-laundry",
      liveLink: null
    },
    {
      title: "Three Trios",
      description: "Dynamic two-player Java MVC card duel",
      fullDescription: "Dynamic two-player Java MVC card duel where each strategic placement triggers cascading flips across the grid, pitting Team Red vs. Team Blue in a battle for territorial domination.",
      image: "/midgame_final.png",
      githubLink: "https://github.com/ahan-jain/NEU-Projects/tree/main/Java%20Projects/Three%20Trios",
      liveLink: null
    },
    {
      title: "Next-Word Predictor",
      description: "LSTM neural sequence-learning model",
      fullDescription: "LSTM model trained on a \"fake-news\" dataset that can predict the next word in a sequence or generate paragraphs from a seed phrase, showcasing core neural sequence-learning capabilities.",
      image: "/neural_network_prediction.jpg",
      githubLink: "https://github.com/ahan-jain/Neural-Text-Generation/tree/main",
      liveLink: null
    }
  ];

  const toolboxData = [
    {
      category: "Languages",
      items: ["Python", "Java", "C", "SQL", "JavaScript", "R", "Racket"]
    },
    {
      category: "Web & Backend",
      items: ["Node.js", "Express.js", "React", "HTML5", "CSS3"]
    },
    {
      category: "Data Science & ML",
      items: ["NumPy", "Pandas", "Matplotlib", "SciPy", "scikit-learn", "TensorFlow", "NLTK", "Keras"]
    },
    {
      category: "Databases",
      items: ["PostgreSQL"]
    },
    {
      category: "Version Control & CI/CD",
      items: ["GitHub", "Git"]
    }
  ];

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="bg-[#0A0A0A] text-white font-['Inter'] overflow-x-hid