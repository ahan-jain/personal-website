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
    }, 300);
  };

  // Prevent background scroll when modal is open - keep scrollbar visible
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
    <div className="bg-[#0A0A0A] text-white font-['Inter'] overflow-x-hidden">
      {/* Fixed Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 transition-all duration-400 ${
        isNavbarSolid ? 'navbar-solid' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button 
            onClick={scrollToTop}
            className="text-xl font-semibold text-white hover:text-[#015FFC] transition-colors duration-300 cursor-pointer"
            aria-label="Return to home page"
          >
            AJ
          </button>
          <div className="hidden md:flex space-x-8">
            <a href="#about" className="hover:text-[#015FFC] transition-colors duration-300">About</a>
            <a href="#toolbox" className="hover:text-[#015FFC] transition-colors duration-300">Toolbox</a>
            <a href="#portfolio" className="hover:text-[#015FFC] transition-colors duration-300">Portfolio</a>
          </div>
        </div>
      </nav>

      {/* Hero Section with Green Particles Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A] px-4 sm:px-6 lg:px-8">
        {/* Green Particles Background with Continuous Animation */}
        <div className="absolute inset-0 w-full h-full">
          <Particles
            particleColors={['#00FF7F', '#32CD32', '#00FA9A']}
            particleCount={300}
            particleSpread={18}
            speed={0.03}
            particleBaseSize={120}
            moveParticlesOnHover={true}
            alphaParticles={false}
            disableRotation={false}
            particleHoverFactor={1.2}
            sizeRandomness={0.6}
            cameraDistance={22}
            smoothness={0.08}
          />
        </div>
        
        {/* Hero Content - Mobile Optimized */}
        <div className="text-center z-10 w-full max-w-6xl mx-auto">
          <h1 className="hero-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 fade-in-up leading-tight">
             Hi! I'm Ahan.
          </h1>
          <div className="hero-bio text-base sm:text-lg md:text-xl lg:text-2xl font-light tracking-wide mb-12 sm:mb-16 fade-in-up max-w-5xl mx-auto min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center text-center px-4" style={{letterSpacing: '0.2px'}}>
            <div className="font-mono w-full">
              <div className="text-center leading-relaxed">
                <span className="whitespace-nowrap">I'm&nbsp;</span>
                <span className="text-[#00FF7F] break-words">
                  {currentText}
                  <span 
                    className={`inline-block w-2 sm:w-3 bg-[#00FF7F] ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150`}
                    style={{ 
                      height: '1.2em',
                      transform: 'translateY(0.2em)'
                    }}
                  ></span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Navigable scroll arrow - points to about section */}
          <a 
            href="#about" 
            className="scroll-arrow inline-block mt-4 sm:mt-8 text-white/60 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer"
            aria-label="Scroll to About section"
          >
            <ChevronDown className="w-8 h-8 sm:w-10 sm:h-10 mx-auto animate-bounce" />
          </a>
        </div>
      </section>

      {/* Biography Section - Image Left, Text Right on Desktop */}
      <section id="about" className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
            {/* Image - First on mobile, first on desktop */}
            <div className="fade-in-up order-1">
              <img 
                src="/FullSizeRender.jpg" 
                alt="Ahan Jain Portrait" 
                className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] object-cover rounded-lg hover-zoom shadow-2xl"
              />
            </div>
            {/* Text - Second on mobile, second on desktop */}
            <div className="fade-in-up order-2 h-full flex flex-col justify-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-8 sm:mb-10">About Me</h2>
              <div className="space-y-6 sm:space-y-8 text-lg sm:text-xl font-light leading-relaxed">
                <p>
                  Junior CS student at Northeastern concentrating in AI, driven to build software that makes a real difference. 
                  I thrive on tackling complex challenges and bringing creative ideas to life.
                </p>
                <p>
                As a backend developer, I architect scalable APIs, build real-time data pipelines, and leverage machine-learning insights to drive smarter systems. 
                Off the clock, you'll find me jamming with friends, diving into my favorite games, or exploring new backend tools.
                </p>
                <p>
                  I'm passionate about turning complex problems into elegant solutions and sharing my work with the developer community.
                </p>
              </div>
              
              {/* Social Links */}
<div className="flex flex-col sm:flex-row sm:items-start sm:space-x-8 mt-12 sm:mt-16">
  <a
    href="mailto:ahan@ahanjain.com,jain.aha@northeastern.edu"
    className="flex items-center space-x-3 text-gray-400 hover:text-[#00FF7F] transition-colors duration-300 mb-4 sm:mb-0"
  >
    <Mail className="w-5 h-5 flex-shrink-0" />
    <span className="underline-animation">Email</span>
  </a>

  <a
    href="https://linkedin.com/in/ahanjain"
    className="flex items-center space-x-3 text-gray-400 hover:text-[#0077B5] transition duration-300 mb-4 sm:mb-0"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Linkedin className="w-5 h-5 flex-shrink-0"
      style={{ transform: 'translateY(0px)' }}/>
    <span className="linkedin-underline">LinkedIn</span>
  </a>

  <a
    href="https://github.com/ahan-jain"
    className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 mb-4 sm:mb-0"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Github className="w-5 h-5 flex-shrink-0" />
    <span className="underline-animation">GitHub</span>
  </a>

  <a
    href="/Ahan_Jain_Resume.pdf"
    className="flex items-center space-x-3 text-gray-400 hover:text-[#00FF7F] transition-colors duration-300"
    target="_blank"
    rel="noopener noreferrer"
  >
    <FileText className="w-5 h-5 flex-shrink-0" />
    <span className="underline-animation">Resume</span>
  </a>
</div>
            </div>
          </div>
        </div>
      </section>

      {/* My Toolbox Section - Mobile Optimized */}
      <section id="toolbox" className="min-h-screen flex items-center justify-center grain-texture px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#111111]">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-16 sm:mb-20 text-center fade-in-up">
            My Toolbox
          </h2>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block fade-in-up">
            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2a2a2a] border-b border-gray-700">
                    {toolboxData.map((category, index) => (
                      <th key={index} className="px-8 py-7 text-left font-semibold text-[#00FF7F] text-xl">
                        {category.category}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {toolboxData.map((category, categoryIndex) => (
                      <td key={categoryIndex} className="px-8 py-8 align-top border-r border-gray-800 last:border-r-0 pointer-events-auto">
                        <div className="space-y-4">
                          {category.items.map((item, itemIndex) => (
                            <div 
                              key={itemIndex}
                              className="toolbox-item bg-[#0A0A0A] px-4 py-3 rounded-lg text-base font-medium text-white cursor-default"
                              style={{
                                willChange: 'transform, background-color, box-shadow',
                                transition: 'all 200ms ease-in-out',
                                transformOrigin: 'center'
                              }}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-8 sm:space-y-10 fade-in-up">
            {toolboxData.map((category, index) => (
              <div key={index} className="bg-[#1a1a1a] rounded-xl p-6 sm:p-8 border border-gray-800 shadow-xl">
                <h3 className="text-xl sm:text-2xl font-semibold text-[#00FF7F] mb-4 sm:mb-6">
                  {category.category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {category.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="toolbox-item bg-[#0A0A0A] px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium text-white cursor-default text-center"
                      style={{
                        willChange: 'transform, background-color, box-shadow',
                        transition: 'all 200ms ease-in-out',
                        transformOrigin: 'center'
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section - Mobile Optimized */}
      <section id="portfolio" className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-16 sm:mb-20 text-center fade-in-up">
            Projects
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {portfolioProjects.map((project, index) => (
              <div key={index} className="fade-in-up card-hover">
                <button 
                  onClick={() => openModal(index)}
                  className="block bg-[#1a1a1a] rounded-xl overflow-hidden group h-full flex flex-col cursor-pointer shadow-xl w-full text-left border border-[#1a1a1a] transition-all duration-400 focus:outline-none focus:ring-0"
                >
                  <div className="aspect-video overflow-hidden">
  <img 
    src={project.image} 
    alt={project.title}
    className={`w-full h-full transition-all duration-400 grayscale group-hover:grayscale-0 ${
      project.title === "Husky Laundry" 
        ? "object-cover object-top scale-100" 
        : project.title === "Three Trios"
        ? "object-cover scale-100"      // we’ll override its position via style
        : "object-fill"
    }`}
    style={
      project.title === "Three Trios"
        ? { objectPosition: '2% 2%' }  // ← tweak these X% Y% until you frame your desired region
        : undefined
    }
  />
</div>
                  <div className="p-6 sm:p-8 flex-1 flex flex-col">
                    <h3 className="text-xl sm:text-2xl font-semibold mb-3">{project.title}</h3>
                    <p className="text-gray-400 mb-6 font-light flex-1 text-base sm:text-lg">{project.description}</p>
                  </div>
                </button>
              </div>
            ))}
          </div>
          
          {/* View All Projects Button */}
          <div className="text-center mt-12 sm:mt-16 fade-in-up">
            <a 
              href="https://github.com/ahan-jain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-white hover:bg-[#015FFC] text-black hover:text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl text-base sm:text-lg"
            >
              <span>View All Projects</span>
            </a>
          </div>
        </div>
      </section>

      {/* Project Modal */}
      {selectedProject !== null && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Backdrop with blur - fade animation */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-[8px] transition-opacity duration-300 ease-out"
            style={{
              opacity: isModalAnimating ? 1 : 0
            }}
          />
          
          {/* Modal Content - fade animation only */}
          <div 
            className="relative bg-[#1a1a1a] rounded-xl max-w-4xl w-full shadow-2xl border border-[#1a1a1a] transition-opacity duration-300 ease-out"
            style={{
              opacity: isModalAnimating ? 1 : 0
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white hover:text-gray-300 transition-all duration-200 focus:outline-none focus:ring-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

{/* Project Image */}
<div className="aspect-video overflow-hidden rounded-t-xl">
  <img
    src={portfolioProjects[selectedProject].image}
    alt={portfolioProjects[selectedProject].title}
    className="w-full h-full transition-all duration-300"
    style={
      portfolioProjects[selectedProject].title === "Husky Laundry"
        // keep your existing Husky Laundry framing
        ? { objectFit: 'cover', objectPosition: 'center top' }
        : portfolioProjects[selectedProject].title === "Three Trios"
        // now match the same crop you used on the tile
        ? { objectFit: 'cover', objectPosition: '2% 2%' }
        // all others just center‐cover
        : { objectFit: 'cover', objectPosition: 'center center' }
    }
  />
</div>

            {/* Project Content */}
            <div className="p-6 sm:p-8">
              <h3 className="text-2xl sm:text-3xl font-semibold mb-4 text-white">
                {portfolioProjects[selectedProject].title}
              </h3>
              
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-8">
                {portfolioProjects[selectedProject].fullDescription}
              </p>

              {/* Open Repository Button */}
              <div className="flex justify-center">
                <a 
                  href={portfolioProjects[selectedProject].githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-[#015FFC] text-black hover:text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl text-base sm:text-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  Open Repository
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-gray-800 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 font-light mb-6 md:mb-0 text-base sm:text-lg">
              © Ahan Jain
            </p>
            
            {/* Footer Social Links */}
            <div className="flex space-x-8">
              <a 
                href="mailto:ahan@ahanjain.com,jain.aha@northeastern.edu"
                className="text-gray-400 hover:text-[#00FF7F] transition-colors duration-300"
                aria-label="Email"
              >
                <Mail className="w-6 h-6 sm:w-7 sm:h-7" />
              </a>
              <a 
                href="https://github.com/ahan-jain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6 sm:w-7 sm:h-7" />
              </a>
              <a 
                href="https://linkedin.com/in/ahanjain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#0077B5] transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6 sm:w-7 sm:h-7" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced CSS for Smooth Toolbox Hover Animations + Custom LinkedIn Underline */}
      <style jsx>{`
        .toolbox-item:hover {
          background-color: #015FFC !important;
          color: white !important;
          transform: scale(1.05) !important;
          box-shadow: 0 8px 25px -8px rgba(1, 95, 252, 0.4) !important;
        }
        
        /* Ensure smooth transitions even during rapid cursor movement */
        .toolbox-item {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
        
        /* Prevent hover dead zones */
        td {
          margin: 0 !important;
          padding: 2rem !important;
        }
        
        .space-y-4 > * + * {
          margin-top: 1rem !important;
        }
        
        .gap-4 {
          gap: 1rem !important;
        }

        /* Custom LinkedIn underline animation */
        .linkedin-underline {
          position: relative;
         overflow: hidden;
         padding-bottom: 0px;
        }
        
        .linkedin-underline::after {
          content: '';
          position: absolute;
          bottom: 0; /* Custom distance for LinkedIn */
          left: -100%;
          width: 100%;
          height: 2px;
          background: #015FFC; /* LinkedIn blue color */
          transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .linkedin-underline:hover::after {
          left: 0;
        }

        /* Restore original card hover effects */
        .card-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: scale(1.03);
          box-shadow: 0 25px 50px -12px rgba(1, 95, 252, 0.25);
        }
        
        .card-hover:hover img {
          filter: grayscale(0%);
        }
      `}</style>
    </div>
  );
}

export default App;