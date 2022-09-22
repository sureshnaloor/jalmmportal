import React from "react";
import Image from "next/image";

function carousalComponent() {
  return (
    <>
      <div className="carousel w-full">
        <div id="item1" className="carousel-item w-full">
          <Image src="https://placeimg.com/800/200/arch" className="w-full" alt="image" width={50} height={50}/>
        </div>
        <div id="item2" className="carousel-item w-full">
          <Image src="https://placeimg.com/800/200/arch" className="w-full" alt="image" width={50} height={50}/>
        </div>
        <div id="item3" className="carousel-item w-full">
          <Image src="https://placeimg.com/800/200/arch" className="w-full" alt="image" width={50} height={50} />
        </div>
        <div id="item4" className="carousel-item w-full">
          <Image src="https://placeimg.com/800/200/arch" className="w-full" alt="image" width={50} height={50} />
        </div>
      </div>
      <div className="flex justify-center w-full py-2 gap-2">
        <a href="#item1" className="btn btn-xs">
          1
        </a>
        <a href="#item2" className="btn btn-xs">
          2
        </a>
        <a href="#item3" className="btn btn-xs">
          3
        </a>
        <a href="#item4" className="btn btn-xs">
          4
        </a>
      </div>
    </>
  );
}

export default carousalComponent;
