import './App.css'
import { FaLinkedin, FaGithub, FaEnvelope, FaPhone, FaUniversalAccess } from 'react-icons/fa'
import MatrixBackground from './MatrixBackground'
import { useState, useEffect } from 'react'

function App() {
  const [showAccessibilityMenu, setShowAccessibilityMenu] = useState(false)
  const [noAnimation, setNoAnimation] = useState(false)
  const [highVisibility, setHighVisibility] = useState(false)

  return (
    <div className={`App ${(noAnimation || highVisibility) ? 'no-animation' : ''} ${highVisibility ? 'high-visibility' : ''}`}>
      {!(noAnimation || highVisibility) && <MatrixBackground />}
      
      {/* Skip to main content link */}
      <a href="#main" className="skip-link">Skip to main content</a>
      
      <header className="header">
        <nav className="nav" role="navigation" aria-label="Main navigation">
          <img src="/images/profile.jpg" alt="Robert Zeijlon" className="profile-image" />
          <div className="nav-content">
            <h1>Robert Zeijlon</h1>
            <ul>
              <li>
                <button 
                  className="accessibility-toggle"
                  onClick={() => setShowAccessibilityMenu(!showAccessibilityMenu)}
                  aria-label="Accessibility options"
                  aria-expanded={showAccessibilityMenu}
                >
                  <FaUniversalAccess />
                </button>
                {showAccessibilityMenu && (
                  <div className="accessibility-menu" role="menu">
                    <label className="accessibility-option" role="menuitem">
                      <input 
                        type="checkbox" 
                        checked={highVisibility}
                        onChange={(e) => setHighVisibility(e.target.checked)}
                      />
                      High visibility mode
                    </label>
                    <label className="accessibility-option" role="menuitem">
                      <input 
                        type="checkbox" 
                        checked={noAnimation}
                        onChange={(e) => setNoAnimation(e.target.checked)}
                      />
                      Disable animations
                    </label>
                  </div>
                )}
              </li>
              <li><a href="#about">About</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </nav>
      </header>

      <main id="main" role="main">
        <section id="hero" className="hero">
          <div className="hero-title">
            <h2>AI Developer & Infrastructure Enthusiast</h2>
          </div>
          <div className="hero-text">
            <p>Specializing in local AI models, self-hosted solutions, and cutting-edge machine learning technologies</p>
          </div>
        </section>

        <section id="about" className="about">
          <div className="about-header">
            <h2>About Me</h2>
          </div>
          <div className="about-content">
            <div className="about-intro">
              <p>
                Recent AI Developer graduate with a passion for cutting-edge artificial intelligence and machine learning technologies. 
                I specialize in building robust AI solutions from research to production, with a strong focus on local models and self-hosted infrastructure.
              </p>
            </div>
            
            <div className="skills-grid">
              <div className="skill-category">
                <h3>AI/ML Technologies</h3>
                <ul>
                  <li>Machine Learning: TensorFlow, PyTorch, scikit-learn</li>
                  <li>Generative AI: Local LLM implementations, API integrations</li>
                  <li>Speech Processing: Near real-time transcription (KB-Whisper)</li>
                  <li>Computer Vision: ComfyUI, custom vision models</li>
                  <li>Model Deployment: LM-Studio, local model optimization</li>
                </ul>
              </div>

              <div className="skill-category">
                <h3>Development Stack</h3>
                <ul>
                  <li>Languages: Python, R, JavaScript, TypeScript</li>
                  <li>Frameworks: FastAPI, React, Node.js</li>
                  <li>Data Science: pandas, numpy, Jupyter</li>
                  <li>Cloud: AWS, Google Cloud, Azure ML</li>
                </ul>
              </div>

              <div className="skill-category">
                <h3>Infrastructure & DevOps</h3>
                <ul>
                  <li>Kubernetes: k3s 3-node HA cluster deployment</li>
                  <li>Linux Distributions: Arch, Fedora, NixOS, Debian, Ubuntu</li>
                  <li>Containerization: Podman, Docker, Docker Compose</li>
                  <li>Self-Hosting: Custom server builds and management</li>
                  <li>Home Automation: Home Assistant, Mosquitto, Zigbee2MQTT</li>
                </ul>
              </div>

              <div className="skill-category">
                <h3>Specializations</h3>
                <ul>
                  <li>Local AI model deployment and optimization</li>
                  <li>High-availability Kubernetes cluster management</li>
                  <li>Self-hosted infrastructure architecture</li>
                  <li>Real-time AI applications</li>
                  <li>Cross-platform development environments</li>
                </ul>
              </div>
            </div>

            <p className="passion-statement">
              <strong>My Philosophy:</strong> I believe in the power of local, self-hosted AI solutions that give users control over their data 
              while delivering enterprise-grade performance. I'm passionate about making AI accessible and practical for real-world applications.
            </p>
          </div>
        </section>

        <section id="projects" className="projects">
          <div className="projects-header">
            <h2>Featured Projects</h2>
          </div>
          <div className="project-grid">
            <div className="project-card featured">
              <div className="project-image">
                <img src="/images/transcriptomatic-comparison.png" alt="Transcriptomatic Performance Analysis" />
              </div>
              <h3>🎙️ Transcriptomatic</h3>
              <p className="project-tech">Python • FastAPI • React • Docker • AI/ML</p>
              <p className="project-description">
                A comprehensive speech-to-text evaluation framework and transcription platform developed collaboratively. 
                Features multiple AI model comparisons including Azure, Deepgram, ElevenLabs, and local Whisper implementations.
              </p>
              <div className="project-highlights">
                <h4>Key Achievements:</h4>
                <ul>
                  <li>🚀 Built full-stack transcription platform with React frontend and FastAPI backend</li>
                  <li>📊 Developed comprehensive evaluation framework comparing 6+ transcription models</li>
                  <li>🤖 Integrated custom AI agents for enhanced transcription capabilities</li>
                  <li>📈 Achieved measurable performance improvements through model optimization</li>
                  <li>🐳 Containerized entire application stack with Docker Compose</li>
                </ul>
              </div>
              <div className="project-links">
                <a href="https://github.com/AtBice-AB/Transcriptomatic" target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              </div>
            </div>
            
            <div className="project-card featured">
              <h3>🖥️ DIY AI Server Build</h3>
              <p className="project-tech">Hardware • Dell PowerEdge R730 • NVIDIA Tesla P100 • Linux</p>
              <p className="project-description">
                A humorous journey documenting the trials and triumphs of building a custom AI training server from scratch. 
                What started as a simple hardware upgrade became an epic adventure in creative problem-solving.
              </p>
              <div className="project-highlights">
                <h4>Epic Challenges Conquered:</h4>
                <ul>
                  <li>🔧 Transformed Dell Precision 5600 into functional AI workstation</li>
                  <li>⚡ Manually rewired power supply for GPU compatibility</li>
                  <li>🏠 Relocated entire server to outbuilding for noise/heat management</li>
                  <li>🎯 Achieved stable AI model training environment</li>
                  <li>📝 Documented entire journey in journal-style format</li>
                </ul>
              </div>
              <div className="project-links">
                <a href="https://github.com/Atbice/ai-server" target="_blank" rel="noopener noreferrer">
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="contact-header">
            <h2>Get In Touch</h2>
          </div>
          
          <div className="contact-intro">
            <p>Let's connect and discuss opportunities in AI development and technology!</p>
          </div>
          
          <div className="contact-links">
            <a href="https://www.linkedin.com/in/robert-zeijlon-14015928b" target="_blank" rel="noopener noreferrer" className="contact-link linkedin">
              <FaLinkedin className="contact-icon" />
              <span>LinkedIn</span>
            </a>
            
            <a href="https://github.com/RZeijlon" target="_blank" rel="noopener noreferrer" className="contact-link github">
              <FaGithub className="contact-icon" />
              <span>GitHub</span>
            </a>
            
            <a href="mailto:robert.zeijlon.92@gmail.com" className="contact-link email">
              <FaEnvelope className="contact-icon" />
              <span>robert.zeijlon.92@gmail.com</span>
            </a>
            
            <a href="tel:+46722331626" className="contact-link phone">
              <FaPhone className="contact-icon" />
              <span>072-233 16 26</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
