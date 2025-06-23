import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ExternalLink, Mail, Linkedin, Github, FileText } from 'lucide-react';
import Particles from './components/Particles';

function App() {
  const [isNavbarSolid, setIsNavbarSolid] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  
  // Refs for fixed time-interval typewriter
  const animationRef = useRef();
  const lastUpdateTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const pauseStartRef = useRef(0);
  const targetTextRef = useRef('');

  const typingPhrases = [
    "Computer Science @ Northeastern University",
    "Incoming Software Engineer @ Darby",
    "Backend Developer",
    "AI & ML enthusiast"
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
      description: "Real-time laundry status app for Northeastern students",
      image: "/laundry.png",
      githubLink: "https://github.com/Oasis-NEU/s24-group9/tree/main/husky-laundry",
      liveLink: null
    },
    {
      title: "Three Trios",
      description: "MVC card game implementation in Java",
      image: "/midgame_final.png",
      githubLink: "https://github.com/ahan-jain/NEU-Projects/tree/main/Java%20Projects/Three%20Trios",
      liveLink: null
    },
    {
      title: "Next-Word Predictor",
      description: "LSTM text model for intelligent word prediction",
      image: "/neural_network_prediction.jpg",
      githubLink: "https://github.com/ahan-jain/Neural-Text-Generation/blob/main/README.md",
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
      <nav className={`fixed top-0 left-0 right-0 z-50 px-8 py-6 transition-all duration-400 ${
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
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
        
        {/* Hero Content - No backdrop box */}
        <div className="text-center z-10 px-8 relative">
          <h1 className="hero-headline text-6xl md:text-7xl lg:text-8xl font-bold mb-8 fade-in-up">
             Hi! I'm Ahan.
          </h1>
          <div className="hero-bio text-xl md:text-2xl font-light tracking-wide mb-16 fade-in-up max-w-2xl mx-auto min-h-[3rem] flex items-center justify-center text-center" style={{letterSpacing: '0.2px'}}>
            <div className="font-mono flex items-center">
              <span className="inline-block min-h-[1.5em] flex items-center">
                {currentText}
              </span>
              <span 
                className={`inline-block w-3 h-7 bg-[#00FF7F] ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150`}
              ></span>
            </div>
          </div>
          
          {/* Navigable scroll arrow - points to about section */}
          <a 
            href="#about" 
            className="scroll-arrow inline-block mt-8 text-white/60 hover:text-white hover:scale-110 transition-all duration-300 cursor-pointer"
            aria-label="Scroll to About section"
          >
            <ChevronDown className="w-10 h-10 mx-auto animate-bounce" />
          </a>
        </div>
      </section>

      {/* Biography Section */}
      <section id="about" className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="fade-in-up">
              <img 
                src="/FullSizeRender.jpg" 
                alt="Ahan Jain Portrait" 
                className="w-full h-[400px] md:h-[600px] object-cover rounded-lg hover-zoom"
              />
            </div>
            <div className="fade-in-up">
              <h2 className="text-3xl md:text-4xl font-semibold mb-8">About Me</h2>
              <div className="space-y-6 text-lg font-light leading-relaxed">
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
              <div className="flex space-x-6 mt-12">
                <a 
                  href="https://linkedin.com/in/ahanjain" 
                  className="flex items-center space-x-2 text-gray-400 hover:text-[#0077B5] transition-colors duration-300"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="underline-animation">LinkedIn</span>
                </a>
                <a 
                  href="https://github.com/ahan-jain" 
                  className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-5 h-5" />
                  <span className="underline-animation">GitHub</span>
                </a>
                <a 
                  href="/Ahan_Jain_Resume.pdf" 
                  className="flex items-center space-x-2 text-gray-400 hover:text-[#00FF7F] transition-colors duration-300"
                  aria-label="Resume"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="w-5 h-5" />
                  <span className="underline-animation">Resume</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Toolbox Section - Enhanced and Bigger */}
      <section id="toolbox" className="min-h-screen flex items-center justify-center grain-texture px-8 py-40">
        <div className="max-w-8xl mx-auto w-full">
          <h2 className="text-4xl md:text-5xl font-semibold mb-20 text-center fade-in-up">
            My Toolbox
          </h2>
          
          {/* Desktop Table View - Enhanced */}
          <div className="hidden lg:block fade-in-up">
            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2a2a2a] border-b border-gray-700">
                    {toolboxData.map((category, index) => (
                      <th key={index} className="px-8 py-6 text-left font-semibold text-[#00FF7F] text-xl">
                        {category.category}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {toolboxData.map((category, categoryIndex) => (
                      <td key={categoryIndex} className="px-8 py-8 align-top border-r border-gray-800 last:border-r-0">
                        <div className="space-y-4">
                          {category.items.map((item, itemIndex) => (
                            <div 
                              key={itemIndex}
                              className="bg-[#0A0A0A] px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-[#015FFC] hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default transform"
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

          {/* Mobile/Tablet Card View - Enhanced */}
          <div className="lg:hidden space-y-10 fade-in-up">
            {toolboxData.map((category, index) => (
              <div key={index} className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800 shadow-xl">
                <h3 className="text-2xl font-semibold text-[#00FF7F] mb-6">
                  {category.category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {category.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="bg-[#0A0A0A] px-4 py-3 rounded-lg text-base font-medium text-white hover:bg-[#015FFC] hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default text-center transform"
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

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-16 text-center fade-in-up">
            Projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolioProjects.map((project, index) => (
              <div key={index} className="fade-in-up card-hover">
                <a 
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-[#1a1a1a] rounded-lg overflow-hidden group h-full flex flex-col cursor-pointer"
                >
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className={`w-full h-full transition-all duration-400 ${
                        project.title === "Husky Laundry" 
                          ? "object-cover object-center scale-110 grayscale group-hover:grayscale-0" 
                          : "object-cover grayscale group-hover:grayscale-0"
                      }`}
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-4 font-light flex-1">{project.description}</p>
                  </div>
                </a>
              </div>
            ))}
          </div>
          
          {/* View All Projects Button */}
          <div className="text-center mt-12 fade-in-up">
            <a 
              href="https://github.com/ahan-jain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-white hover:bg-[#015FFC] text-black hover:text-white px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <span>View All Projects</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 font-light mb-4 md:mb-0">
              © Ahan Jain
            </p>
            
            {/* Footer Social Links */}
            <div className="flex space-x-6">
              <a 
                href="https://github.com/ahan-jain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
              <a 
                href="https://linkedin.com/in/ahanjain"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#0077B5] transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;