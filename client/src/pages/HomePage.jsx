import React from 'react';

const NavBar = ({ navigateTo, currentView }) => {
  const isAboutPage = currentView === 'about';

  const getLinkClass = (viewName) => {
    const isActive = currentView === viewName;
    return `text-white no-underline relative pb-[2px] transition-colors duration-200 hover:text-[#ed5656] cursor-pointer ${
      isActive ? 'border-b-2 border-white font-bold' : ''
    }`;
  };

  return (
    <nav className={`flex gap-6 pt-8 px-12 text-[1.1rem] ${isAboutPage ? 'opacity-90' : ''}`}>
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

const HomePage = ({ navigateTo, currentView = 'home' }) => {
  return (
    <>
      <style>
        {`
          @font-face {
            font-family: 'Horizon';
            src: url('../public/fonts/Horizon-Font/Horizon.woff2') format('woff2'),
                 url('../public/fonts/Horizon-Font/Horizon.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
          }
          .font-horizon {
            font-family: 'Horizon', 'Orbitron', sans-serif;
          }
        `}
      </style>

      <div className="flex flex-col items-start justify-center h-screen bg-cover bg-center bg-no-repeat relative bg-[url('./assets/Home.jpg')]">
        
        <div className="absolute top-0 left-0 w-full z-10">
          <NavBar navigateTo={navigateTo} currentView={currentView} />
        </div>
        
        <div className="text-left text-white ml-0 pl-12 mt-[-5rem] z-10">
          <h1 className="font-horizon text-[5rem] m-0 tracking-[0.1em] leading-tight">WELCOME,</h1>
          <h1 className="font-horizon text-[5rem] m-0 tracking-[0.1em] leading-tight">SHOP</h1>
          <h1 className="font-horizon text-[5rem] m-0 tracking-[0.1em] leading-tight">ASSISTANCE</h1>
        </div>

        <div className="absolute bottom-[15%] flex justify-center w-full z-10">
          <button 
            onClick={() => navigateTo('login')}
            className="w-[12%] p-[15px] mx-[10px] bg-[#c44747] text-[#fff6d3] text-center text-base font-semibold cursor-pointer rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            Login
          </button>
          <button 
            onClick={() => navigateTo('register')}
            className="w-[12%] p-[15px] mx-[10px] bg-[#fff6d3] text-[#c44747] text-center text-base font-semibold cursor-pointer rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg"
          >
            Sign up
          </button>
        </div>

        <div className="absolute inset-0 bg-black/20 z-0"></div>
      </div>
    </>
  );
}

export default HomePage;