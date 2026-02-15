import React from 'react';

const NavBar = ({ navigateTo, currentView }) => {
  const getLinkClass = (viewName) => {
    const isActive = currentView === viewName;
    return `text-white no-underline relative pb-[2px] transition-colors duration-200 hover:text-[#ed5656] cursor-pointer ${
      isActive ? 'border-b-2 border-white font-bold' : ''
    }`;
  };

  return (
    <nav className="flex gap-6 pt-8 px-12 text-[1.1rem] absolute top-0 left-0 w-full z-20">
      <button
        onClick={() => navigateTo('home')}
        className={getLinkClass('home')}
      >
        Home
      </button>
      <button
        onClick={() => navigateTo('about')}
        className={getLinkClass('about')}
      >
        About us
      </button>
    </nav>
  );
};

const AboutUs = ({ navigateTo, currentView = 'about' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5] text-[#333] relative bg-cover bg-center bg-no-repeat bg-[url('./assets/Home.jpg')]">
      
      <NavBar navigateTo={navigateTo} currentView={currentView} />

      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="z-10 text-center p-10 bg-white/10 backdrop-blur-md rounded-[51px] shadow-2xl border border-white/20 max-w-[800px] mx-4">
        <h1 className="text-[4rem] font-bold text-white mb-6 tracking-tight">About Us</h1>
        <p className="text-[1.2rem] text-white/90 leading-relaxed">
          Welcome to <span className="text-[#ed5656] font-semibold">Shop Assistance!</span>
          <br /><br />
          This is the About Us page. We provide cutting-edge solutions for your POS system 
          and shop management. Our goal is to make your business smoother and more efficient.
        </p>
        
        <button 
          onClick={() => navigateTo('home')}
          className="mt-8 py-3 px-8 bg-[#ed5656] text-white rounded-full font-bold hover:scale-105 transition-transform active:scale-95 shadow-lg"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default AboutUs;