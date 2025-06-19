"use client";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import banner from "../public/banner.jpeg";

function Hero() {

    const imageRef = useRef();

    useEffect(() =>{

        const imageElement = imageRef.current;

        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const scrollThreshold = 60;

            if(scrollPosition > scrollThreshold) {
                imageElement.classList.add("scrolled");
            } else{
                imageElement.classList.remove("scrolled");
            }
        }

        window.addEventListener("scroll",handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        }
    },[])

  return (
    <div className="pb-20 px-4">
      <div className="mx-auto container text-center ">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] gradient-title pb-6">
          Manage your finances <br /> with intelligence
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
          An AI powered expense tracker that helps you manage your finances
          effectively with real-time insights.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Link href="/dashboard">
            <Button size="lg" className={"cursor-pointer"}>
              Get Start
            </Button>
          </Link>
          <Link href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant={"outline"} className={"cursor-pointer"}>
              Watch Demo
            </Button>
          </Link>
        </div>
        <div className="hero-image-wrapper">
            <div ref={imageRef} className="hero-image">
                <Image 
                src={banner} 
                alt="banner"
                priority
                className="mt-8 mx-auto rounded-lg shadow-2xl object-cover"
                width={1280}
                height={720}
                />
            </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
