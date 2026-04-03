/// <reference path="../../three-elements.d.ts" />
"use client";
import React from 'react';

import { Canvas } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Stars, Sparkles } from "@react-three/drei";
import { Suspense } from "react";

export function ThreeDScene() {
    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80" style={{ mixBlendMode: 'screen' }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={5} />
                <pointLight position={[10, -10, 10]} color="#d946ef" intensity={5} />
                
                <Suspense fallback={null}>
                    {/* Main floating orb simulating the AI brain */}
                    <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
                        <Sphere args={[1.5, 64, 64]} scale={1.2}>
                            <MeshDistortMaterial 
                                color="#2e1065" 
                                attach="material" 
                                distort={0.6} 
                                speed={1.5} 
                                roughness={0.2}
                                metalness={0.9}
                                emissive="#581c87"
                                emissiveIntensity={0.5}
                            />
                        </Sphere>
                    </Float>

                    {/* Background stars */}
                    <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
                    
                    {/* Magical sparkles */}
                    <Sparkles count={100} scale={12} size={2} speed={0.4} opacity={0.3} color="#d946ef" />

                    {/* Small accent floating orbs */}
                    <Float speed={2.5} rotationIntensity={2} floatIntensity={4}>
                         <Sphere args={[0.2, 32, 32]} position={[-3, 2, -2]}>
                            <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2} toneMapped={false} />
                         </Sphere>
                    </Float>
                    <Float speed={2} rotationIntensity={3} floatIntensity={3.5}>
                         <Sphere args={[0.15, 32, 32]} position={[3, -2, -1]}>
                            <meshStandardMaterial color="#e879f9" emissive="#e879f9" emissiveIntensity={2} toneMapped={false} />
                         </Sphere>
                    </Float>
                    <Float speed={3} rotationIntensity={1} floatIntensity={5}>
                         <Sphere args={[0.1, 32, 32]} position={[0, -3, 1]}>
                            <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={2} toneMapped={false} />
                         </Sphere>
                    </Float>
                </Suspense>
            </Canvas>
        </div>
    );
}
