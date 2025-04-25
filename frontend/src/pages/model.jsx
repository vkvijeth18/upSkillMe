import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { useLoader } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three"
const getNaturalBlinkTimings = () => {
    const blinkDuration = Math.random() * 300 + 100;
    let nextBlink = Math.random() * 5000 + 8000;
    if (Math.random() < 0.1) nextBlink += Math.random() * 5000 + 5000;
    if (Math.random() < 0.05) nextBlink = Math.random() * 1000 + 500;
    return { blinkDuration, nextBlink };
};
const shapeKeyDictionary = {
    // 🔹 **Phonemes**
    "CH": 51,
    "DD": 52,
    "E": 53,
    "FF": 54,
    "PP": 55,
    "RR": 56,
    "SS": 57,
    "TH": 58,
    "aa": 59,
    "ih": 60,
    "kk": 61,
    "nn": 62,
    "oh": 63,
    "ou": 64,
    "sil": 65,  // Silence

    // 🔹 **Eyebrows**
    "browDownLeft": 0,
    "browDownRight": 1,
    "browInnerUp": 2,
    "browOuterUpLeft": 3,
    "browOuterUpRight": 4,

    // 🔹 **Cheeks**
    "cheekPuff": 5,
    "cheekSquintLeft": 6,
    "cheekSquintRight": 7,

    // 🔹 **Eyes**
    "eyeBlinkLeft": 8,
    "eyeBlinkRight": 9,
    "eyeLookDownLeft": 10,
    "eyeLookDownRight": 11,
    "eyeLookInLeft": 12,
    "eyeLookInRight": 13,
    "eyeLookOutLeft": 14,
    "eyeLookOutRight": 15,
    "eyeLookUpLeft": 16,
    "eyeLookUpRight": 17,
    "eyeSquintLeft": 18,
    "eyeSquintRight": 19,
    "eyeWideLeft": 20,
    "eyeWideRight": 21,

    // 🔹 **Jaw**
    "jawForward": 22,
    "jawLeft": 23,
    "jawOpen": 24,
    "jawRight": 25,

    // 🔹 **Mouth**
    "mouthClose": 26,
    "mouthDimpleLeft": 27,
    "mouthDimpleRight": 28,
    "mouthFrownLeft": 29,
    "mouthFrownRight": 30,
    "mouthFunnel": 31,
    "mouthLeft": 32,
    "mouthLowerDownLeft": 33,
    "mouthLowerDownRight": 34,
    "mouthPressLeft": 35,
    "mouthPressRight": 36,
    "mouthPucker": 37,
    "mouthRight": 38,
    "mouthRollLower": 39,
    "mouthRollUpper": 40,
    "mouthShrugLower": 41,
    "mouthShrugUpper": 42,
    "mouthSmileLeft": 43,
    "mouthSmileRight": 44,
    "mouthStretchLeft": 45,
    "mouthStretchRight": 46,
    "mouthUpperUpLeft": 47,
    "mouthUpperUpRight": 48,

    // 🔹 **Nose**
    "noseSneerLeft": 49,
    "noseSneerRight": 50
};
const phonemeToShapeKeyMap = {
    // Map CMU phonemes to your shape keys
    "AA": "aa",    // as in "odd" - open mouth
    "AE": "aa",    // as in "at" - open mouth
    "AH": "aa",    // as in "hut" - slight open mouth
    "AO": "oh",    // as in "ought" - rounded lips
    "AW": "ou",    // as in "cow" - from aa to uw
    "AY": "aa",    // as in "hide" - from aa to ih
    "B": "PP",     // as in "be" - closed lips, slight pressure
    "CH": "CH",    // as in "cheese" - teeth slightly showing
    "D": "DD",     // as in "dee" - tongue tip touches upper teeth
    "DH": "TH",    // as in "thee" - tongue between teeth
    "EH": "E",     // as in "Ed" - slightly open mouth
    "ER": "RR",    // as in "hurt" - slightly open with tension
    "EY": "E",     // as in "ate" - from eh to ih
    "F": "FF",     // as in "fee" - upper teeth on lower lip
    "G": "kk",     // as in "green" - back of mouth closure
    "HH": "sil",   // as in "he" - slight open mouth
    "IH": "ih",    // as in "it" - relaxed small opening
    "IY": "E",     // as in "eat" - stretched slight opening
    "JH": "CH",    // as in "gee" - teeth showing with tension
    "K": "kk",     // as in "key" - back of mouth closure
    "L": "nn",     // as in "lee" - tongue tip up
    "M": "PP",     // as in "me" - closed lips
    "N": "nn",     // as in "knee" - tongue touches roof
    "NG": "nn",    // as in "ping" - back of tongue up
    "OW": "oh",    // as in "oat" - rounded lips
    "OY": "ou",    // as in "toy" - from oh to ih
    "P": "PP",     // as in "pee" - closed lips with pressure
    "R": "RR",     // as in "read" - slight open with tension
    "S": "SS",     // as in "sea" - teeth nearly closed
    "SH": "SS",    // as in "she" - teeth nearly closed, rounded
    "T": "DD",     // as in "tea" - tongue tip touches roof
    "TH": "TH",    // as in "thin" - tongue between teeth
    "UH": "oh",    // as in "hood" - relaxed rounding
    "UW": "ou",    // as in "two" - strong rounding
    "V": "FF",     // as in "vee" - upper teeth on lower lip
    "W": "ou",     // as in "we" - strong rounding, then relax
    "Y": "E",      // as in "yield" - from ih to stretched
    "Z": "SS",     // as in "zee" - teeth nearly closed
    "ZH": "SS",    // as in "seizure" - teeth nearly closed, rounded
    "???": "sil"     // For unknown phonemes
};

// Jaw and teeth configuration for different phoneme groups
const phonemeJawTeethConfig = {
    // Vowels typically show more jaw opening
    "AA": { jaw: 0.7, teeth: 0.5 },  // Open vowel
    "AE": { jaw: 0.6, teeth: 0.5 },
    "AH": { jaw: 0.4, teeth: 0.3 },
    "AO": { jaw: 0.5, teeth: 0.4 },
    "AW": { jaw: 0.6, teeth: 0.5 },
    "AY": { jaw: 0.5, teeth: 0.4 },
    "EH": { jaw: 0.4, teeth: 0.4 },
    "ER": { jaw: 0.3, teeth: 0.3 },
    "EY": { jaw: 0.4, teeth: 0.4 },
    "IH": { jaw: 0.3, teeth: 0.3 },
    "IY": { jaw: 0.3, teeth: 0.3 },
    "OW": { jaw: 0.4, teeth: 0.3 },
    "OY": { jaw: 0.5, teeth: 0.4 },
    "UH": { jaw: 0.3, teeth: 0.2 },
    "UW": { jaw: 0.3, teeth: 0.2 },

    // Consonants typically show less jaw movement but may show teeth
    "B": { jaw: 0.1, teeth: 0.0 },
    "CH": { jaw: 0.2, teeth: 0.5 },
    "D": { jaw: 0.2, teeth: 0.4 },
    "DH": { jaw: 0.3, teeth: 0.7 },  // Tongue between teeth
    "F": { jaw: 0.2, teeth: 0.6 },   // Upper teeth on lower lip
    "G": { jaw: 0.2, teeth: 0.1 },
    "HH": { jaw: 0.2, teeth: 0.1 },
    "JH": { jaw: 0.2, teeth: 0.5 },
    "K": { jaw: 0.1, teeth: 0.1 },
    "L": { jaw: 0.2, teeth: 0.3 },
    "M": { jaw: 0.1, teeth: 0.0 },
    "N": { jaw: 0.2, teeth: 2 },
    "NG": { jaw: 0.1, teeth: 0.1 },
    "P": { jaw: 0.1, teeth: 0.0 },
    "R": { jaw: 0.2, teeth: 0.2 },
    "S": { jaw: 0.2, teeth: 0.5 },   // Teeth nearly closed
    "SH": { jaw: 0.2, teeth: 0.5 },
    "T": { jaw: 0.2, teeth: 0.3 },
    "TH": { jaw: 0.2, teeth: 0.7 },  // Tongue between teeth
    "V": { jaw: 0.2, teeth: 0.6 },   // Upper teeth on lower lip
    "W": { jaw: 0.2, teeth: 0.1 },
    "Y": { jaw: 0.2, teeth: 0.2 },
    "Z": { jaw: 0.2, teeth: 0.5 },
    "ZH": { jaw: 0.2, teeth: 0.5 },
    "???": { jaw: 0.1, teeth: 0.0 }    // Default/unknown
};


const SetBackgroundImage = ({ imagePath }) => {
    const { scene } = useThree();
    useEffect(() => {
        const loader = new TextureLoader();
        loader.load(imagePath, (texture) => {
            scene.background = texture;
        });
        return () => { scene.background = null; };
    }, [scene, imagePath]);
    return null;
};

const Model = ({ phonemes, isSpeaking }) => {
    const gltf = useLoader(GLTFLoader, "/fin.glb", (loader) => {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
        loader.setDRACOLoader(dracoLoader);
    });
    const modelRef = useRef();
    const headRef = useRef();

    useEffect(() => {
        if (modelRef.current) {
            let avatarHead = null;
            let avatarEyelashes = null;
            let avatarTeethUpper = null;
            let avatarTeethLower = null;

            modelRef.current.traverse((child) => {
                if (child.isMesh) {
                    if (child.name === "AvatarHead") avatarHead = child;
                    if (child.name === "AvatarEyelashes") avatarEyelashes = child;
                    if (child.name === "AvatarTeethUpper") avatarTeethUpper = child;
                    if (child.name === "AvatarTeethLower") avatarTeethLower = child;
                }
                if (child.isBone && child.name === "Neck") child.rotation.set(-0.2, 0, 0);
                if (child.isBone && child.name === "Jaw") {
                    let jawMovement = [0, 0.2, 0, -0.1, 0];
                    let index = 0;
                    const animateJaw = () => {
                        if (index < jawMovement.length) {
                            child.rotation.x = jawMovement[index];
                            index++;
                            setTimeout(animateJaw, 300);
                        }
                    };
                    animateJaw();
                }
                if (child.isBone && child.name === "LeftArm") child.rotation.set(1.5, 0, -0.2);
                if (child.isBone && child.name === "RightArm") child.rotation.set(1.5, 0, 0.2);
            });

            // **Blink Animation**
            if (avatarHead) {
                const blink = () => {
                    if (
                        avatarHead.morphTargetDictionary["eyeBlinkLeft"] !== undefined &&
                        avatarHead.morphTargetDictionary["eyeBlinkRight"] !== undefined
                    ) {
                        const { blinkDuration, nextBlink } = getNaturalBlinkTimings();

                        // **Blink the head**
                        avatarHead.morphTargetInfluences[avatarHead.morphTargetDictionary["eyeBlinkLeft"]] = 1.0;
                        avatarHead.morphTargetInfluences[avatarHead.morphTargetDictionary["eyeBlinkRight"]] = 1.0;

                        // **Sync Eyelashes if they exist**
                        if (avatarEyelashes && avatarEyelashes.morphTargetDictionary) {
                            avatarEyelashes.morphTargetInfluences[avatarEyelashes.morphTargetDictionary["eyeBlinkLeft"]] = 1.0;
                            avatarEyelashes.morphTargetInfluences[avatarEyelashes.morphTargetDictionary["eyeBlinkRight"]] = 1.0;
                        }

                        setTimeout(() => {
                            avatarHead.morphTargetInfluences[avatarHead.morphTargetDictionary["eyeBlinkLeft"]] = 0.0;
                            avatarHead.morphTargetInfluences[avatarHead.morphTargetDictionary["eyeBlinkRight"]] = 0.0;

                            if (avatarEyelashes && avatarEyelashes.morphTargetDictionary) {
                                avatarEyelashes.morphTargetInfluences[avatarEyelashes.morphTargetDictionary["eyeBlinkLeft"]] = 0.0;
                                avatarEyelashes.morphTargetInfluences[avatarEyelashes.morphTargetDictionary["eyeBlinkRight"]] = 0.0;
                            }

                            setTimeout(blink, nextBlink);
                        }, blinkDuration);
                    }
                };
                blink();
            }
        }
    }, [gltf]);
    useEffect(() => {
        if (modelRef.current && phonemes && isSpeaking) {
            const avatarHead = modelRef.current.getObjectByName("AvatarHead");
            const avatarTeethLower = modelRef.current.getObjectByName("AvatarTeethLower");
            const avatarTeethUpper = modelRef.current.getObjectByName("AvatarTeethUpper");

            // Find the jaw bone for direct manipulation
            let jawBone = null;
            modelRef.current.traverse((child) => {
                if (child.isBone && child.name === "Jaw") {
                    jawBone = child;
                }
            });

            if (avatarHead && avatarHead.morphTargetDictionary) {
                // Parse phonemes, removing numbers (stress markers)
                const phonemeArray = phonemes.split(" ").map(phoneme => phoneme.replace(/\d/g, ''));
                const coArticulatedPhonemes = createCoArticulation(phonemeArray);
                let phonemeIndex = 0;
                let animationFrame = null;

                // Clear any existing animation
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                }

                // Reset all morphs initially
                resetMorphs(avatarHead);
                if (avatarTeethLower) resetMorphs(avatarTeethLower);
                if (avatarTeethUpper) resetMorphs(avatarTeethUpper);

                // Get indexes for jaw and teeth controls
                const jawOpenIndex = avatarHead.morphTargetDictionary["jawOpen"];
                const mouthRollLowerIndex = avatarHead.morphTargetDictionary["mouthRollLower"];
                const mouthRollUpperIndex = avatarHead.morphTargetDictionary["mouthRollUpper"];

                // Check for jawOpen in other meshes
                const teethLowerJawOpenIndex = avatarTeethLower?.morphTargetDictionary?.["jawOpen"];
                const teethUpperJawOpenIndex = avatarTeethUpper?.morphTargetDictionary?.["jawOpen"];

                // Track the last time we updated the viseme
                let lastUpdateTime = performance.now();
                const phonemeDuration = 150; // milliseconds per phoneme

                // Current and target values for each mesh
                let headCurrentValues = avatarHead ? new Array(avatarHead.morphTargetInfluences.length).fill(0) : [];
                let headTargetValues = [...headCurrentValues];

                let teethLowerCurrentValues = avatarTeethLower?.morphTargetInfluences ?
                    new Array(avatarTeethLower.morphTargetInfluences.length).fill(0) : [];
                let teethLowerTargetValues = [...teethLowerCurrentValues];

                let teethUpperCurrentValues = avatarTeethUpper?.morphTargetInfluences ?
                    new Array(avatarTeethUpper.morphTargetInfluences.length).fill(0) : [];
                let teethUpperTargetValues = [...teethUpperCurrentValues];

                // Current jaw rotation and target
                let currentJawRotation = 0;
                let targetJawRotation = 0;

                // Animation function for smoother transitions
                const animate = (currentTime) => {
                    // Update viseme targets if it's time for a new phoneme
                    if (currentTime - lastUpdateTime > phonemeDuration && phonemeIndex < coArticulatedPhonemes.length) {
                        const { phoneme, weight, duration } = coArticulatedPhonemes[phonemeIndex];
                        const shapeKey = phonemeToShapeKeyMap[phoneme];

                        // Reset target values (keep jaw values for smoothness)
                        const prevJawValue = headTargetValues[jawOpenIndex];
                        headTargetValues.fill(0);
                        if (jawOpenIndex !== undefined) headTargetValues[jawOpenIndex] = prevJawValue;

                        // Keep separate copies for teeth meshes
                        teethLowerTargetValues.fill(0);
                        teethUpperTargetValues.fill(0);

                        // Set the main viseme target
                        if (shapeKey && shapeKeyDictionary[shapeKey] !== undefined) {
                            const visemeIndex = shapeKeyDictionary[shapeKey];
                            if (visemeIndex < headTargetValues.length) {
                                headTargetValues[visemeIndex] = weight; // Main viseme strength
                            }
                        }

                        // Set jaw and teeth targets based on the current phoneme
                        const config = phonemeJawTeethConfig[phoneme] || phonemeJawTeethConfig["???"];

                        // Apply jawOpen morph target to head
                        if (jawOpenIndex !== undefined) {
                            const jawValue = config.jaw;
                            headTargetValues[jawOpenIndex] = jawValue;

                            // Apply same jawOpen value to teeth meshes
                            if (teethLowerJawOpenIndex !== undefined && avatarTeethLower) {
                                teethLowerTargetValues[teethLowerJawOpenIndex] = jawValue;
                            }

                            if (teethUpperJawOpenIndex !== undefined && avatarTeethUpper) {
                                teethUpperTargetValues[teethUpperJawOpenIndex] = jawValue * 0.3; // Less movement for upper teeth
                            }
                        }

                        // Set jaw bone rotation target
                        if (jawBone) {
                            targetJawRotation = config.jaw * 0.5; // Scale the jaw movement appropriately
                        }

                        // Handle teeth visibility
                        if (config.teeth > 0) {
                            if (mouthRollLowerIndex !== undefined) {
                                headTargetValues[mouthRollLowerIndex] = config.teeth * 0.8;
                            }
                            if (mouthRollUpperIndex !== undefined) {
                                headTargetValues[mouthRollUpperIndex] = config.teeth * 0.6;
                            }
                        }

                        phonemeIndex++;
                        lastUpdateTime = currentTime;
                    }

                    // Smoothly interpolate current values toward target values for head
                    if (avatarHead) {
                        for (let i = 0; i < headCurrentValues.length; i++) {
                            headCurrentValues[i] += (headTargetValues[i] - headCurrentValues[i]) * 0.3;
                            avatarHead.morphTargetInfluences[i] = headCurrentValues[i];
                        }
                    }

                    // Smoothly interpolate for lower teeth
                    if (avatarTeethLower && avatarTeethLower.morphTargetInfluences) {
                        for (let i = 0; i < teethLowerCurrentValues.length; i++) {
                            teethLowerCurrentValues[i] += (teethLowerTargetValues[i] - teethLowerCurrentValues[i]) * 0.3;
                            avatarTeethLower.morphTargetInfluences[i] = teethLowerCurrentValues[i];
                        }
                    }

                    // Smoothly interpolate for upper teeth
                    if (avatarTeethUpper && avatarTeethUpper.morphTargetInfluences) {
                        for (let i = 0; i < teethUpperCurrentValues.length; i++) {
                            teethUpperCurrentValues[i] += (teethUpperTargetValues[i] - teethUpperCurrentValues[i]) * 0.3;
                            avatarTeethUpper.morphTargetInfluences[i] = teethUpperCurrentValues[i];
                        }
                    }

                    // Smoothly animate jaw bone rotation
                    if (jawBone) {
                        currentJawRotation += (targetJawRotation - currentJawRotation) * 0.3;
                        jawBone.rotation.x = currentJawRotation;
                    }

                    // If we've processed all phonemes and a bit of time has passed, gradually reset
                    if (phonemeIndex >= coArticulatedPhonemes.length && currentTime - lastUpdateTime > phonemeDuration * 2) {
                        let allZero = true;

                        // Reset head morph targets
                        if (avatarHead) {
                            for (let i = 0; i < headCurrentValues.length; i++) {
                                headTargetValues[i] = 0;
                                headCurrentValues[i] += (headTargetValues[i] - headCurrentValues[i]) * 0.2;
                                avatarHead.morphTargetInfluences[i] = headCurrentValues[i];

                                // Check if we're effectively at zero
                                if (Math.abs(headCurrentValues[i]) > 0.01) allZero = false;
                            }
                        }

                        // Reset lower teeth
                        if (avatarTeethLower && avatarTeethLower.morphTargetInfluences) {
                            for (let i = 0; i < teethLowerCurrentValues.length; i++) {
                                teethLowerTargetValues[i] = 0;
                                teethLowerCurrentValues[i] += (teethLowerTargetValues[i] - teethLowerCurrentValues[i]) * 0.2;
                                avatarTeethLower.morphTargetInfluences[i] = teethLowerCurrentValues[i];

                                if (Math.abs(teethLowerCurrentValues[i]) > 0.01) allZero = false;
                            }
                        }

                        // Reset upper teeth
                        if (avatarTeethUpper && avatarTeethUpper.morphTargetInfluences) {
                            for (let i = 0; i < teethUpperCurrentValues.length; i++) {
                                teethUpperTargetValues[i] = 0;
                                teethUpperCurrentValues[i] += (teethUpperTargetValues[i] - teethUpperCurrentValues[i]) * 0.2;
                                avatarTeethUpper.morphTargetInfluences[i] = teethUpperCurrentValues[i];

                                if (Math.abs(teethUpperCurrentValues[i]) > 0.01) allZero = false;
                            }
                        }

                        // Reset jaw rotation
                        if (jawBone) {
                            targetJawRotation = 0;
                            currentJawRotation += (targetJawRotation - currentJawRotation) * 0.2;
                            jawBone.rotation.x = currentJawRotation;

                            if (Math.abs(currentJawRotation) > 0.01) allZero = false;
                        }

                        // If everything has faded to zero, stop the animation
                        if (allZero) return;
                    }

                    // Continue the animation loop
                    animationFrame = requestAnimationFrame(animate);
                };

                // Start the animation
                animationFrame = requestAnimationFrame(animate);

                // Clean up function
                return () => {
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                    }

                    // Reset all morphs
                    if (avatarHead) resetMorphs(avatarHead);
                    if (avatarTeethLower) resetMorphs(avatarTeethLower);
                    if (avatarTeethUpper) resetMorphs(avatarTeethUpper);

                    // Reset jaw bone
                    if (jawBone) {
                        jawBone.rotation.x = 0;
                    }
                };
            }
        }
    }, [phonemes, isSpeaking]);

    // Helper function to reset all morph targets
    const resetMorphs = (mesh) => {
        if (mesh && mesh.morphTargetInfluences) {
            mesh.morphTargetInfluences.fill(0);
        }
    };

    // Function to create co-articulation between phonemes (blending between sounds)
    const createCoArticulation = (phonemeArray) => {
        const result = [];
        let prevPhoneme = null;

        for (let i = 0; i < phonemeArray.length; i++) {
            const currentPhoneme = phonemeArray[i];
            const nextPhoneme = i < phonemeArray.length - 1 ? phonemeArray[i + 1] : null;

            // Add the current phoneme
            result.push({
                phoneme: currentPhoneme,
                weight: 1.0,
                duration: 1.0
            });

            // If we have a next phoneme, add a transition
            if (nextPhoneme) {
                // Transitions between certain phoneme types might be handled differently
                // For example, transitions to/from consonants might be quicker
                result.push({
                    phoneme: blendPhonemes(currentPhoneme, nextPhoneme),
                    weight: 0.5,
                    duration: 0.3
                });
            }

            prevPhoneme = currentPhoneme;
        }

        return result;
    };

    // Helper function to create blended phoneme configurations
    const blendPhonemes = (phoneme1, phoneme2) => {
        // This would be a simplified approach - in a real implementation
        // you might use more sophisticated blending based on phoneme characteristics
        const config1 = phonemeJawTeethConfig[phoneme1] || phonemeJawTeethConfig["???"];
        const config2 = phonemeJawTeethConfig[phoneme2] || phonemeJawTeethConfig["???"];

        return {
            jaw: (config1.jaw + config2.jaw) / 2,
            teeth: (config1.teeth + config2.teeth) / 2
        };
    };
    // Helper function to reset all morph targets

    // Helper function for smoother transitions between visemes
    const transitionToViseme = (avatarHead, targetIndex, strength = 0.8) => {
        if (!avatarHead || targetIndex === undefined) return;

        // Gradually decrease all other shapes
        for (let i = 0; i < avatarHead.morphTargetInfluences.length; i++) {
            if (i !== targetIndex) {
                // Fade out other shapes
                avatarHead.morphTargetInfluences[i] *= 0.5;
            }
        }

        // Set the target shape
        avatarHead.morphTargetInfluences[targetIndex] = strength;

        // Optionally add a small amount of jaw movement for more natural speech
        const jawOpenIndex = shapeKeyDictionary["jawOpen"];
        if (jawOpenIndex !== undefined && targetIndex !== jawOpenIndex) {
            avatarHead.morphTargetInfluences[jawOpenIndex] = 0.2;
        }
    };

    let time = 0;
    let isPaused = false;

    // Motion variations (changes movement style every few seconds)
    const motionVariations = [
        { factor: 0.1, speed: 0.002 },
        { factor: 0.2, speed: 0.005 },
        { factor: 0.15, speed: 0.003 },
    ];

    let currentMotion = motionVariations[0];

    setInterval(() => {
        currentMotion = motionVariations[Math.floor(Math.random() * motionVariations.length)];
    }, 5000); // Change motion every 5s

    setInterval(() => {
        isPaused = Math.random() > 0.7; // 30% chance to pause for natural movement
    }, Math.random() * 3000 + 3000);

    useFrame(() => {
        if (!isPaused && modelRef.current) {
            modelRef.current.traverse((child) => {
                if (child.isBone) {
                    const { factor, speed } = currentMotion;

                    if (child.name === "Neck") {
                        // Smooth random horizontal (yaw) movement
                        child.rotation.z = THREE.MathUtils.lerp(
                            child.rotation.z, Math.cos(time * speed) * factor, 0.01
                        );
                        child.rotation.y = THREE.MathUtils.lerp(
                            child.rotation.x, Math.cos(time * speed) * factor, 0.01
                        );
                        // **Nodding movement** (up-down motion)
                        child.rotation.x = THREE.MathUtils.lerp(
                            child.rotation.x, Math.sin(time * 0.3) * 0.2, 0.02
                        );
                    }
                    if (child.name === "Hips") {
                        child.rotation.z = THREE.MathUtils.lerp(
                            child.rotation.z, Math.sin(time * speed) * factor, 0.1
                        );
                        child.rotation.x = THREE.MathUtils.lerp(
                            child.rotation.x, Math.sin(time * speed) * factor, 0.1
                        );
                    }

                    if (child.name === "LeftForeArm" || child.name === "RightForeArm") {
                        child.rotation.x = THREE.MathUtils.lerp(
                            child.rotation.x, Math.sin(time * 0.2) * 0.15, 0.015
                        );
                        child.rotation.y = THREE.MathUtils.lerp(
                            child.rotation.y, Math.cos(time * 0.2) * 0.1, 0.015
                        );
                    }
                }
            });
        }
        time += 0.01; // Keep incrementing time for smooth randomness
    });


    return <primitive ref={modelRef} object={gltf.scene} scale={8} position={[0, -12.4, -5]} />;
};

const Scene = ({ phonemes, isSpeaking }) => { // Add this line for debugging
    return (
        <Canvas camera={{ position: [0, 0, 0], fov: 50 }} gl={{ toneMappingExposure: 1.2 }}>
            <SetBackgroundImage imagePath="/store.jpg" />
            <Suspense fallback={null}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 4, 5]} intensity={2} castShadow />
                <pointLight position={[-2, 2, 2]} intensity={0.8} />
                <Model phonemes={phonemes} isSpeaking={isSpeaking} />
                <OrbitControls />
            </Suspense>
        </Canvas>
    );
};

export default Scene;