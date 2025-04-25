import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import useResumeStore from "../Store/ResumeStore";
import useInterviewStore from "../Store/InterviewStore";
import axios from "axios";
import Scene from "./model"; // Import the Scene component
import { toast } from "react-hot-toast";
import VideoStream from "../components/videoStream";
const INTERVIEW_TIME_LIMIT = 20 * 60 * 1000; // 20 minutes
const RESPONSE_TIME_LIMIT = 30000; // 30 seconds
const GEMINI_API_KEY = "AIzaSyCo1bGaPS2Ucl1rIC8G76k-TGmU7NE5XYI";

export default function InterviewPage() {
    const resumeText = useResumeStore((state) => state.resumeText);
    const InterviewType = useInterviewStore((state) => state.interviewType);
    const navigate = useNavigate();

    const [questionList, setQuestionList] = useState([]);
    const [question, setQuestion] = useState("");
    const [timer, setTimer] = useState(INTERVIEW_TIME_LIMIT / 1000);
    const [responses, setResponses] = useState({});
    const [currentResponse, setCurrentResponse] = useState("");
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isIntroduced, setIsIntroduced] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isListeningActive, setIsListeningActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [manualListening, setManualListening] = useState(false);
    const [debug, setDebug] = useState({
        resumeLoaded: false,
        questionsGenerated: false,
        introComplete: false,
        currentStep: "initializing"
    });
    const [phonemes, setPhonemes] = useState("");
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedChunks, setRecordedChunks] = useState([]);
    const videoRef = useRef(null);


    const interviewTimer = useRef(null);
    const silenceTimer = useRef(null);
    const speechUtterance = useRef(null);
    const recognition = useRef(null);
    const isListening = useRef(false);
    const isInterviewOver = useRef(false);
    const currentQuestion = useRef("");
    const questionsProcessed = useRef(0);
    const recognitionAttempts = useRef(0);
    const processingAction = useRef(false);
    const currentQuestionsList = useRef([]);
    const selectedVoiceRef = useRef(null); // Store selected voice in ref for consistency

    // Immediately log initial state on component mount
    useEffect(() => {
        // //console.log("Component mounted. Initial state:");
        // //console.log("Resume text available:", !!resumeText);
        // //console.log("Interview type:", InterviewType);
        // Fallback questions in case API fails
        const fallbackQuestions = [
            "I am curious to know about you. Could you tell me about yourself?",
            "What are your greatest strengths?",
            "What do you consider to be your weaknesses?",
            "Why are you interested in this position?",
            "Where do you see yourself in five years?",
            "Can you describe a challenging situation you faced at work and how you handled it?",
            "What are your salary expectations?",
            "Why should we hire you?",
            "Do you have any questions for me?",
            "What motivates you to do your best work?"
        ];

        loadVoices();
        requestMicrophonePermission()
            .then(() => requestCameraPermission())
            .then(() => {
                startInterviewTimer();
                startVideoStream();
            })
            .catch(() => {
                toast.error("Please provide all required permissions.");
                navigate("/interview");
            });

        // Set fallback questions if resume is empty or not available
        if (!resumeText || resumeText.trim() === "") {
            // //console.log("No resume text found, using fallback questions");
            currentQuestionsList.current = [...fallbackQuestions];
            setQuestionList(fallbackQuestions);
            setDebug(prev => ({ ...prev, resumeLoaded: false, questionsGenerated: true, currentStep: "using fallback questions" }));
            setTimeout(() => {
                introduceInterview();
            }, 1000);
        } else {
            // //console.log("Resume text found, will generate custom questions");
            setDebug(prev => ({ ...prev, resumeLoaded: true, currentStep: "resume loaded" }));
            generateQuestionList();
        }

        // window.addEventListener("beforeunload", endInterview);
        // document.addEventListener("visibilitychange", handleVisibilityChange);

        // return () => {
        //     window.removeEventListener("beforeunload", endInterview);
        //     document.removeEventListener("visibilitychange", handleVisibilityChange);
        //     clearInterval(interviewTimer.current);
        //     clearTimeout(silenceTimer.current);
        //     stopListening();
        //     if (speechUtterance.current) window.speechSynthesis.cancel();
        //     stopVideoStream();
        // };
    }, []);

    // Update ref when selectedVoice changes to maintain consistency
    useEffect(() => {
        if (selectedVoice) {
            selectedVoiceRef.current = selectedVoice;
        }
    }, [selectedVoice]);

    // Handle changes to the introduced state
    useEffect(() => {
        // //console.log("Introduction state changed:", isIntroduced);
        setDebug(prev => ({ ...prev, introComplete: isIntroduced }));

        if (isIntroduced && currentQuestionsList.current.length > 0 && !processingAction.current) {
            // //console.log("Introduction complete and questions available, moving to first question");
            setTimeout(() => moveToNextQuestion(), 1500); // Added delay before moving to the first question
        }
    }, [isIntroduced]);

    // Handle changes to the question list
    useEffect(() => {
        // ////console.log("Question list updated. Length:", questionList.length);
        setDebug(prev => ({ ...prev, questionsGenerated: questionList.length > 0 }));

        // Update our ref to match the state
        currentQuestionsList.current = [...questionList];

        if (questionList.length > 0 && isIntroduced && !question && !processingAction.current) {
            ////console.log("Ready to start first question");
            setTimeout(() => moveToNextQuestion(), 1000);
        }
    }, [questionList]);

    // Monitor listening state
    useEffect(() => {
        if (isListeningActive && !manualListening) {
            //console.log("Listening activated, starting silence timer");
            // Make sure we move on even if speech recognition is stuck
            silenceTimer.current = setTimeout(() => {
                //console.log("Silence timer triggered - no response detected");
                stopListening();
                speakResponse("I didn't hear your response. Let's move on.", () => {
                    questionsProcessed.current += 1;
                    moveToNextQuestion();
                });
            }, RESPONSE_TIME_LIMIT);

            return () => {
                clearTimeout(silenceTimer.current);
            };
        }
    }, [isListeningActive, manualListening]);


    const loadVoices = () => {
        //console.log("Loading voices...");
        const synth = window.speechSynthesis;

        // Initialize voices first
        let availableVoices = synth.getVoices();

        const updateVoices = () => {
            availableVoices = synth.getVoices();
            //console.log(`Found ${availableVoices.length} voices`);

            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                // Prioritize female voices with name containing "female" or "samantha"
                const femaleVoice = availableVoices.find(
                    (v) => v.name.toLowerCase().includes("female") ||
                        v.name.toLowerCase().includes("samantha")
                );
                const selectedV = femaleVoice || availableVoices[0];
                //console.log("Selected voice:", selectedV?.name || "None");
                setSelectedVoice(selectedV);
                selectedVoiceRef.current = selectedV; // Set the voice reference
                setIsLoading(false);
            } else {
                // If no voices available yet, try again in a moment
                setTimeout(updateVoices, 500);
            }
        };

        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = updateVoices;
        }

        // Try immediately and also with a delay as a fallback
        updateVoices();

        // Final fallback if voices still not loaded after 3 seconds
        setTimeout(() => {
            if (selectedVoice === null && synth.getVoices().length > 0) {
                const voices = synth.getVoices();
                setVoices(voices);
                const femaleVoice = voices.find(
                    (v) => v.name.toLowerCase().includes("female") ||
                        v.name.toLowerCase().includes("samantha")
                );
                const voiceToUse = femaleVoice || voices[0];
                setSelectedVoice(voiceToUse);
                selectedVoiceRef.current = voiceToUse;
                setIsLoading(false);
            }
        }, 3000);
    };

    const fetchPhonemes = async (text) => {
        try {
            const response = await axios.post(
                "/api/v1/mockinterview/getPhenomes",
                { text },
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );

            if (response.data && response.data.phonemes) {
                setPhonemes(response.data.phonemes); // Update state
            } else {
                console.error("❌ Invalid phoneme response:", response.data);
            }
        } catch (error) {
            console.error("❌ Error fetching phonemes:", error);
        }
    };


    const requestMicrophonePermission = async () => {
        //console.log("Requesting microphone permission...");
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            //console.log("Microphone permission granted");
        } catch (error) {
            console.error("Microphone permission denied:", error);
            toast.error("Microphone access is required for the interview. Please reload the page and allow microphone access.");
        }
    };

    const requestCameraPermission = async () => {
        //console.log("Requesting camera permission...");
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            //console.log("Camera permission granted");
        } catch (error) {
            console.error("Camera permission denied:", error);
            throw error;
        }
    };

    const startInterviewTimer = () => {
        //console.log("Starting interview timer...");
        interviewTimer.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1 || isInterviewOver.current) {
                    clearInterval(interviewTimer.current);
                    endInterview();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const speakResponse = async (text, callback) => {
        //console.log("Speaking:", text);
        if (!selectedVoiceRef.current || isInterviewOver.current) {
            console.warn("Cannot speak: No voice selected or interview is over");
            if (callback) callback();
            return;
        }

        // Set speaking state to true
        setIsSpeaking(true);

        // Cancel any ongoing utterance
        if (window.speechSynthesis.speaking) {
            //console.log("Cancelling ongoing speech");
            window.speechSynthesis.cancel();
        }

        // Create new utterance
        const synth = window.speechSynthesis;
        speechUtterance.current = new SpeechSynthesisUtterance(text);

        // Always use the saved female voice reference to ensure consistency
        speechUtterance.current.voice = selectedVoiceRef.current;
        speechUtterance.current.lang = selectedVoiceRef.current.lang || 'en-US';
        speechUtterance.current.rate = 0.85;
        speechUtterance.current.pitch = 1.1;

        // Ensure speech synthesis doesn't get cut off
        const keepSpeechAlive = setInterval(() => {
            if (synth.speaking) {
                synth.pause();
                synth.resume();
            } else {
                clearInterval(keepSpeechAlive);
            }
        }, 5000);

        speechUtterance.current.onend = () => {
            //console.log("Speech completed");
            clearInterval(keepSpeechAlive);
            speechUtterance.current = null;
            setIsSpeaking(false);

            if (callback) {
                //console.log("Executing speech callback");
                setTimeout(() => callback(), 500); // Small delay before callback
            }
        };

        speechUtterance.current.onerror = (err) => {
            console.error("Speech error:", err);
            clearInterval(keepSpeechAlive);
            speechUtterance.current = null;
            setIsSpeaking(false);

            if (callback) {
                setTimeout(() => callback(), 500);
            }
        };

        try {
            synth.speak(speechUtterance.current);
            await fetchPhonemes(text); // Fetch phonemes and update state
            // Fallback in case onend is not called
            const estimatedDuration = Math.max(5000, text.length * 80); // At least 5 seconds
            setTimeout(() => {
                if (speechUtterance.current) {
                    //console.log("Speech callback fallback triggered");
                    clearInterval(keepSpeechAlive);
                    speechUtterance.current = null;
                    setIsSpeaking(false);

                    if (callback) callback();
                }
            }, estimatedDuration);
        } catch (err) {
            console.error("Error during speech:", err);
            clearInterval(keepSpeechAlive);
            setIsSpeaking(false);

            if (callback) callback();
        }
    };

    const introduceInterview = () => {
        if (processingAction.current) return;
        processingAction.current = true;

        //console.log("Introducing interview...");
        setDebug(prev => ({ ...prev, currentStep: "introducing" }));

        speakResponse("Hello! I am Camalia, your AI interviewer. Let's begin your interview.", () => {
            //console.log("Introduction completed");
            setIsIntroduced(true);
            setDebug(prev => ({ ...prev, introComplete: true, currentStep: "introduction complete" }));
            processingAction.current = false;
        });
    };

    const generateQuestionList = async () => {
        //console.log("Generating questions...");
        setDebug(prev => ({ ...prev, currentStep: "generating questions" }));

        // Default questions in case API call fails
        const defaultQuestions = [
            "I am curious to know about you. Could you tell me about yourself?",
            "What are your greatest strengths?",
            "What do you consider to be your weaknesses?",
            "Why are you interested in this position?",
            "Where do you see yourself in five years?",
            "Can you describe a challenging situation you faced at work and how you handled it?",
            "What are your salary expectations?",
            "Why should we hire you?",
            "Do you have any questions for me?",
            "What motivates you to do your best work?"
        ];

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Your Camalia an Ai Interviewer act and speak like real interviewer .Generate 10 ${InterviewType} questions based on this resume: ${resumeText || "Generic resume"}.
                Respond with only the questions in a numbered list format, no explanations, no extra text,make sure based on this ${InterviewType} only `;

            const result = await model.generateContent({ contents: [{ parts: [{ text: prompt }] }] });

            const aiResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!aiResponse) {
                console.warn("No response from API, using default questions");
                currentQuestionsList.current = [...defaultQuestions];
                setQuestionList(defaultQuestions);
                setDebug(prev => ({ ...prev, currentStep: "API failed, using defaults" }));
                introduceInterview();
                return;
            }

            const questions = aiResponse
                .split(/\n+/)
                .map((q) => q.replace(/^\d+[).]?\s*/, "").trim())
                .filter((q) => q.length > 5);

            if (questions.length === 0) {
                console.warn("No valid questions from API, using defaults");
                currentQuestionsList.current = [...defaultQuestions];
                setQuestionList(defaultQuestions);
            } else {
                //console.log(`Generated ${questions.length} questions from API`);
                const finalQuestions = ["I am curious to know about you. Could you tell me about yourself?", ...questions.slice(0, 9)];
                currentQuestionsList.current = [...finalQuestions];
                setQuestionList(finalQuestions);
            }

            setDebug(prev => ({ ...prev, questionsGenerated: true, currentStep: "questions generated" }));
            introduceInterview();
        } catch (error) {
            console.error("Error generating questions:", error);
            currentQuestionsList.current = [...defaultQuestions];
            setQuestionList(defaultQuestions);
            setDebug(prev => ({ ...prev, currentStep: "API error, using defaults" }));
            introduceInterview();
        }
    };

    const stopListening = () => {
        //console.log("Stopping speech recognition");
        setIsListeningActive(false);
        isListening.current = false;
        clearTimeout(silenceTimer.current);

        if (recognition.current) {
            try {
                recognition.current.stop();
                recognition.current = null;
            } catch (e) {
                console.warn("Error stopping recognition:", e);
            }
        }
    };

    const startListening = (currentQ, manual = false) => {
        //console.log("Starting listening for:", currentQ, "Manual:", manual);
        if (isInterviewOver.current || isListening.current || isSpeaking) {
            console.warn("Cannot start listening: Interview over, already listening, or currently speaking");
            return;
        }

        isListening.current = true;
        setIsListeningActive(true);
        setManualListening(manual);
        recognitionAttempts.current += 1;
        setDebug(prev => ({ ...prev, currentStep: `listening for response (attempt ${recognitionAttempts.current})` }));

        // Clear current response if starting a new listening session
        if (!manual) {
            setCurrentResponse("");
        }

        // Stop any existing recognition
        stopListening();

        try {
            // Check if SpeechRecognition is available
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                console.error("Speech recognition not supported in this browser");

                // Move on automatically after a delay since we can't listen
                setTimeout(() => {
                    //console.log("No speech recognition support, moving to next question");
                    questionsProcessed.current += 1;
                    setIsListeningActive(false);
                    moveToNextQuestion();
                }, 5000);

                return;
            }

            recognition.current = new SpeechRecognition();
            recognition.current.lang = "en-US";
            recognition.current.continuous = true; // Set to true to capture longer responses
            recognition.current.interimResults = false;
            recognition.current.maxAlternatives = 1;

            recognition.current.onresult = (event) => {
                //console.log("Got speech result");

                const lastResultIndex = event.results.length - 1;
                const userResponse = event.results[lastResultIndex][0].transcript.trim();
                //console.log("User response:", userResponse);

                // Update current response state for display
                setCurrentResponse(userResponse);

                // Only check for repetition requests if not in manual mode
                if (!manual && /sorry|repeat|again|didn'?t get/i.test(userResponse)) {
                    //console.log("User asked for repetition");
                    stopListening();
                    speakResponse(`Sure, I'll repeat: ${currentQ}`, () => startListening(currentQ));
                    return;
                }

                if (manual) {
                    // In manual mode, don't automatically move to next question
                    stopListening();
                } else {
                    stopListening();
                    setResponses((prev) => ({ ...prev, [currentQ]: userResponse }));
                    questionsProcessed.current += 1;
                    setDebug(prev => ({ ...prev, currentStep: "response recorded" }));

                    // Small delay before moving to next question
                    setTimeout(() => moveToNextQuestion(), 1000);
                }
            };

            recognition.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                stopListening();

                if (manual) {
                    // Just stop in manual mode, don't proceed automatically
                    return;
                }

                // If we've tried a few times and still have errors, just move on
                if (recognitionAttempts.current >= 2) {
                    setDebug(prev => ({ ...prev, currentStep: "recognition failed, moving on" }));
                    questionsProcessed.current += 1;
                    setTimeout(() => moveToNextQuestion(), 1000);
                } else {
                    // Try one more time
                    speakResponse("I'm having trouble hearing you. Let me try again.", () => {
                        setTimeout(() => startListening(currentQ), 500);
                    });
                }
            };

            recognition.current.onend = () => {
                //console.log("Recognition ended");

                // In manual mode, just update the listening state
                if (manual) {
                    isListening.current = false;
                    setIsListeningActive(false);
                    return;
                }

                // If we're still supposed to be listening, but recognition ended unexpectedly
                if (isListening.current) {
                    //console.log("Recognition ended unexpectedly, restarting...");
                    if (recognitionAttempts.current < 3) {
                        // Try to restart the recognition once with a small delay
                        setTimeout(() => {
                            try {
                                if (recognition.current) {
                                    recognition.current.start();
                                } else {
                                    // If recognition was cleared, create a new one
                                    startListening(currentQ);
                                }
                            } catch (e) {
                                console.error("Failed to restart recognition:", e);
                                stopListening();
                                setTimeout(() => moveToNextQuestion(), 1000);
                            }
                        }, 500);
                    } else {
                        // If we've tried too many times, move on
                        //console.log("Too many recognition attempts, moving on");
                        stopListening();
                        questionsProcessed.current += 1;
                        setTimeout(() => moveToNextQuestion(), 1000);
                    }
                }
            };

            recognition.current.start();
            //console.log("Speech recognition started");

        } catch (error) {
            console.error("Error setting up speech recognition:", error);
            stopListening();

            if (!manual) {
                questionsProcessed.current += 1;
                setTimeout(() => moveToNextQuestion(), 1000); // Move on despite error
            }
        }
    };

    const moveToNextQuestion = () => {
        if (processingAction.current || isInterviewOver.current) {
            //console.log("Already processing an action or interview is over, not moving to next question");
            return;
        }

        processingAction.current = true;
        //console.log("Moving to next question...");
        setDebug(prev => ({ ...prev, currentStep: "moving to next question" }));

        // Reset recognition attempts for the next question
        recognitionAttempts.current = 0;

        // Clear current response for the new question
        setCurrentResponse("");

        // Work with our ref copy of the questions list to avoid race conditions
        if (currentQuestionsList.current.length === 0) {
            //console.log("No more questions, ending interview");
            processingAction.current = false;
            endInterview();
            return;
        }

        // Get the first question and remove it from the list
        const nextQuestion = currentQuestionsList.current.shift();
        setQuestionList([...currentQuestionsList.current]); // Update state with remaining questions
        setQuestion(nextQuestion);
        currentQuestion.current = nextQuestion;

        //console.log(`Next question: "${nextQuestion}"`);
        //console.log(`Questions processed: ${questionsProcessed.current}, remaining: ${currentQuestionsList.current.length}`);

        setDebug(prev => ({
            ...prev,
            currentStep: "asking question",
        }));

        speakResponse(nextQuestion, () => {
            processingAction.current = false;
            startListening(nextQuestion);
        });
    };

    const repeatCurrentQuestion = () => {
        if (isSpeaking || processingAction.current || !question) return;

        processingAction.current = true;
        speakResponse(question, () => {
            processingAction.current = false;
        });
    };

    const toggleManualListening = () => {
        if (isSpeaking || !question) return;

        if (isListeningActive) {
            stopListening();
        } else {
            startListening(question, true);
        }
    };

    const submitResponse = () => {
        if (!currentResponse || !question) return;

        stopListening();
        setResponses((prev) => ({ ...prev, [question]: currentResponse }));
        questionsProcessed.current += 1;

        setTimeout(() => moveToNextQuestion(), 500);
    };

    const endInterview = () => {
        toast.success("Interview Completed Successfully");
        //console.log("Ending interview");
        if (isInterviewOver.current) return;

        isInterviewOver.current = true;
        setDebug(prev => ({ ...prev, currentStep: "ending interview" }));

        clearInterval(interviewTimer.current);
        stopListening();

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        speakResponse("Thank you for completing the interview. We appreciate your time!", () => {
            //console.log("Interview complete, stopping video stream and uploading video");
            stopVideoStream();
            setTimeout(() => navigate("/"), 4000);
        });
    };

    const handleVisibilityChange = () => {
        if (document.hidden) {
            toast.error("Interview Stoped:Tab Switch Detected Don't Switch Tab During Interview..")
            endInterview();
        }
    };

    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            const recorder = new MediaRecorder(stream);
            recorder.ondataavailable = handleDataAvailable;
            recorder.onstop = handleStop;
            setMediaRecorder(recorder);
            recorder.start(); // Start recording immediately
        } catch (error) {
            console.error("Error accessing media devices.", error);
            toast.error("Error accessing media devices.");
            navigate("/interview");
        }
    };

    const stopVideoStream = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        if (mediaRecorder) {
            mediaRecorder.stop(); // Stop recording
        }
    };

    const handleDataAvailable = (event) => {
        if (event.data.size > 0) {
            setRecordedChunks(prev => [...prev, event.data]);
        }
    };

    const handleStop = async () => {
        if (recordedChunks.length === 0) {
            console.error("No recorded data available. Skipping upload.");
            toast.error("No video recorded. Please ensure your camera is working.");
            return;
        }

        const blob = new Blob(recordedChunks, { type: "video/webm" });
        setRecordedChunks([]); // Reset recorded chunks after creating Blob

        const formData = new FormData();
        //console.log("Interview Page is uploading");
        formData.append("video", blob, "interview.webm");
        formData.append("interviewType", InterviewType);
        try {
            const response = await axios.post("/api/v1/uploadtocloud", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true, // ✅ This ensures cookies are sent
            });

            if (response.status === 200) {
                toast.success("Video uploaded successfully");
                //console.log("Video uploaded successfully", response.data);
            } else {
                toast.error("Error uploading video");
            }
        } catch (error) {
            toast.error("Error uploading video");
            console.error("Error uploading video", error);
        }

        if (onRecordingStop) {
            onRecordingStop();
        }
    };


    return (
        <div className="min-h-screen w-full bg-gray-900 text-white p-4 flex items-center justify-center overflow-hidden">
            <div className="w-full max-w-[80%] h-screen bg-gray-800 rounded-xl overflow-hidden shadow-xl flex flex-col">

                {/* Header */}
                <div className="bg-gray-800 py-3 px-6 flex justify-between items-center border-b border-gray-700">
                    <h1 className="text-3xl font-bold text-blue-400">AI INTERVIEWER</h1>
                    <div className="text-red-500 font-medium">
                        Time: {Math.floor(timer / 60)}:{("0" + Math.floor(timer % 60)).slice(-2)}
                    </div>
                </div>

                {/* Content Layout */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                    {/* Left - Avatar and Video */}
                    <div className="w-full md:w-3/5 p-4 flex flex-col">
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                            <Scene phonemes={phonemes} isSpeaking={isSpeaking} />
                        </div>

                        <div className="flex-1">
                            <VideoStream onRecordingStop={endInterview} />
                        </div>
                    </div>

                    {/* Right - Questions and Controls */}
                    <div className="w-full md:w-2/5 bg-gray-800 p-4 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col">
                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-xl">Loading interview system...</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {question && (
                                    <div className="mb-4">
                                        <h2 className="text-lg font-medium text-blue-400 mb-2">Question:</h2>
                                        <div className="bg-gray-700 p-3 rounded-lg">
                                            <p>{question}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Response area */}
                                <div className="flex-1 overflow-auto mb-4">
                                    <h2 className="text-lg font-medium text-purple-400 mb-2">Your Response:</h2>
                                    <div className="bg-gray-700 p-3 rounded-lg min-h-[6rem] max-h-[12rem]">
                                        {currentResponse || "Your answer will appear here..."}
                                    </div>
                                </div>

                                {/* Buttons Row */}
                                <div className="flex justify-center space-x-6 mt-2">
                                    <button onClick={endInterview} className="p-3 bg-purple-500 rounded-full hover:bg-red-600">
                                        <span className="text-2xl">❌</span>
                                    </button>
                                    <button onClick={toggleManualListening} className={`p-3 rounded-full ${isListeningActive ? 'bg-red-500' : 'bg-blue-500'} hover:brightness-110`}>
                                        <span className="text-2xl">🎙️</span>
                                    </button>
                                    <button
                                        onClick={submitResponse}
                                        className="p-3 bg-green-500 rounded-full hover:bg-green-600"
                                        disabled={!currentResponse || processingAction.current}
                                    >
                                        <span className="text-2xl">✅</span>
                                    </button>
                                </div>

                                {/* Bottom buttons */}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={repeatCurrentQuestion}
                                        className="py-2 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600"
                                        disabled={!question || isSpeaking || processingAction.current}
                                    >
                                        Repeat
                                    </button>
                                    <button
                                        onClick={() => {
                                            stopListening();
                                            processingAction.current = false;
                                            moveToNextQuestion();
                                        }}
                                        className="py-2 px-4 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600"
                                        disabled={processingAction.current}
                                    >
                                        Skip
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );

}