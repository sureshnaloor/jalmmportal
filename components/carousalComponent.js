import React from "react";

function CarousalComponent() {
  return (
    <div className="bg-hero-section bg-no-repeat  bg-center bg-cover">
      <video
        autoPlay
        loop
        muted
        className="opacity-90  object-cover"
      >
        <source src="/images/video3.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

export default CarousalComponent;
