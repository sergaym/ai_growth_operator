"use client";
import React from "react";

export function PageBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      {/* Noise texture */}
      <div className="absolute inset-0 bg-noise opacity-10"></div>
      
      {/* Gradient spheres */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[40%] bg-gradient-to-br from-blue-600/10 via-purple-500/5 to-transparent blur-3xl opacity-20 rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[30%] bg-gradient-to-tl from-amber-500/10 via-red-500/5 to-transparent blur-3xl opacity-20 rounded-full"></div>
      
      {/* Animated stars */}
      <div className="absolute inset-0">
        <div className="stars-container">
          <div className="star" style={{ top: '10%', left: '15%' }}></div>
          <div className="star" style={{ top: '25%', left: '60%' }}></div>
          <div className="star" style={{ top: '40%', left: '25%' }}></div>
          <div className="star" style={{ top: '70%', left: '80%' }}></div>
          <div className="star" style={{ top: '85%', left: '40%' }}></div>
        </div>
      </div>
      
      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-gradient-to-t from-black to-transparent"></div>
    </div>
  );
} 