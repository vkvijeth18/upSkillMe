import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";
import useResumeStore from "../Store/ResumeStore";
import useInterviewStore from "../Store/InterviewStore";
import axios from "axios";
import Scene from "./model"; // Avatar component
import { toast } from "react-hot-toast";
import VideoStream from "../components/videoStream";

const INTERVIEW_TIME_LIMIT = 20 * 60 * 1000; // 20 minutes
const RESPONSE_TIME_LIMIT = 40000; // 30 seconds
const GEMINI_API_KEY = "AIzaSyCo1bGaPS2Ucl1rIC8G76k-TGmU7NE5XYI";

export default function InterviewPage() {
    const resumeText = useResumeStore((state) => state.resumeText);
    const InterviewType = useInterviewStore((state) => state.interviewType);
    const navigate = useNavigate();

    // Primary state
    const [questionList, setQuestionList] = useState([]);
    const [question, setQuestion] = useState("");
    const [timer, setTimer] = useState(INTERVIEW_TIME_LIMIT / 1000);
    const [responses, setResponses] = useState({});
    const [currentResponse, setCurrentResponse] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isListeningActive, setIsListeningActive] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [phonemes, setPhonemes] = useState("");

    // New conversation state
    const [conversationHistory, setConversationHistory] = useState([]);
    const [isProcessingResponse, setIsProcessingResponse] = useState(false);
    const [emotionState, setEmotionState] = useState("neutral"); // track detected emotion

    // Voice state
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const selectedVoiceRef = useRef(null);

    const [isIntroduced, setIsIntroduced] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [interviewStage, setInterviewStage] = useState("greeting"); // greeting, smalltalk, questions, conclusion

    // Video recording sta

    // Refs for tracking session state
    const interviewTimer = useRef(null);
    const silenceTimer = useRef(null);
    const speechUtterance = useRef(null);
    const recognition = useRef(null);
    const processingAction = useRef(false);
    const isInterviewOver = useRef(false);
    const genAI = useRef(null);
    const aiModel = useRef(null);

    // Initialize the interview
    useEffect(() => {
        // Setup basics
        loadVoices();
        initializeAI();

        // Request permissions and start interview timer
        requestMicrophonePermission()
            .then(() => requestCameraPermission())
            .then(() => {
                startInterviewTimer();
                setIsLoading(false);
            })
            .catch(() => {
                toast.error("Please provide camera and microphone permissions for the interview.");
                navigate("/interview");
            });

        // Generate questions based on resume
        generateQuestionList();

        // Clean up on unmount
        return () => {
            clearInterval(interviewTimer.current);
            clearTimeout(silenceTimer.current);
            stopListening();
            if (speechUtterance.current) window.speechSynthesis.cancel();

        };
    }, []);

    // Initialize AI helper
    const initializeAI = () => {
        genAI.current = new GoogleGenerativeAI(GEMINI_API_KEY);
        aiModel.current = genAI.current.getGenerativeModel({ model: "gemini-1.5-flash" });
    };

    // Update voice ref when selectedVoice changes
    useEffect(() => {
        if (selectedVoice) {
            selectedVoiceRef.current = selectedVoice;
        }
    }, [selectedVoice]);

    // When questions are loaded and introduction is complete, start with greetings
    useEffect(() => {
        if (isIntroduced && questionList.length > 0 && currentQuestionIndex === -1 && !processingAction.current) {
            setTimeout(() => startInterviewConversation(), 1000);
        }
    }, [isIntroduced, questionList, currentQuestionIndex]);

    const loadVoices = () => {
        const synth = window.speechSynthesis;

        const updateVoices = () => {
            const availableVoices = synth.getVoices();

            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                // Try to find a female voice
                const femaleVoice = availableVoices.find(
                    (v) => v.name.toLowerCase().includes("female") ||
                        v.name.toLowerCase().includes("samantha")
                );
                const voiceToUse = femaleVoice || availableVoices[0];
                setSelectedVoice(voiceToUse);
                selectedVoiceRef.current = voiceToUse;
            }
        };

        // Try to get voices immediately
        updateVoices();

        // Also set up the onvoiceschanged event
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = updateVoices;
        }

        // Final fallback if voices still not loaded after 2 seconds
        setTimeout(() => {
            if (!selectedVoice && synth.getVoices().length > 0) {
                updateVoices();
            }
        }, 2000);
    };

    const requestMicrophonePermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            return true;
        } catch (error) {
            console.error("Microphone permission denied:", error);
            throw error;
        }
    };

    const requestCameraPermission = async () => {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            return true;
        } catch (error) {
            console.error("Camera permission denied:", error);
            throw error;
        }
    };

    const startInterviewTimer = () => {
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

    const generateQuestionList = async () => {
        // Default questions in case API call fails
        const defaultQuestions = [
            "Tell me about yourself.",
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
            const prompt = `Generate 10 ${InterviewType} interview questions based on this resume: ${resumeText || "Generic resume"}.
                Respond with only the questions in a numbered list format, no explanations, no extra text, make sure based on this ${InterviewType} only.`;

            const result = await model.generateContent({
                contents: [{ parts: [{ text: prompt }] }]
            });

            const aiResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            if (!aiResponse) {
                console.warn("No response from API, using default questions");
                setQuestionList(defaultQuestions);
                introduceInterview();
                return;
            }

            const questions = aiResponse
                .split(/\n+/)
                .map((q) => q.replace(/^\d+[).]?\s*/, "").trim())
                .filter((q) => q.length > 5);

            if (questions.length === 0) {
                console.warn("No valid questions from API, using defaults");
                setQuestionList(defaultQuestions);
            } else {
                console.log(`Generated ${questions.length} questions from API`);
                // Don't force "Tell me about yourself" - allow AI to generate appropriate questions
                const finalQuestions = questions.slice(0, 10);
                setQuestionList(finalQuestions);
            }

            introduceInterview();
        } catch (error) {
            console.error("Error generating questions:", error);
            setQuestionList(defaultQuestions);
            introduceInterview();
        }
    };

    const introduceInterview = () => {
        if (processingAction.current) return;
        processingAction.current = true;

        speakResponse("Hello! I'm Camalia, your AI interviewer. I'll be conducting your interview today. How are you feeling?", () => {
            // Add this to conversation history
            updateConversationHistory("interviewer", "Hello! I'm Camalia, your AI interviewer. I'll be conducting your interview today. How are you feeling?");
            setIsIntroduced(true);
            processingAction.current = false;
            startListening(); // Start listening immediately for their response
        });
    };

    // Start the interview conversation flow
    const startInterviewConversation = async () => {
        if (interviewStage === "greeting") {
            // We already greeted, now conduct some small talk based on their response
            setInterviewStage("smalltalk");
            startListening();
        } else if (interviewStage === "questions" && currentQuestionIndex === -1) {
            // Begin formal questions
            moveToNextQuestion();
        }
    };

    // Add new entry to conversation history
    const updateConversationHistory = (speaker, text) => {
        setConversationHistory(prev => [...prev, { speaker, text, timestamp: Date.now() }]);
    };

    const fetchPhonemes = async (text) => {
        try {
            const response = await axios.post(
                "https://upskillme-e2tz.onrender.com/api/v1/mockinterview/getPhenomes",
                { text },
                { headers: { "Content-Type": "application/json" }, withCredentials: true }
            );

            if (response.data && response.data.phonemes) {
                setPhonemes(response.data.phonemes);
            }
        } catch (error) {
            console.error("Error fetching phonemes:", error);
        }
    };

    const speakResponse = async (text, callback) => {
        if (!selectedVoiceRef.current || isInterviewOver.current) {
            if (callback) callback();
            return;
        }

        // Set speaking state to true
        setIsSpeaking(true);

        // Cancel any ongoing utterance
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            await new Promise((resolve) => setTimeout(resolve, 300)); // wait 300ms
        }

        // Create new utterance
        const synth = window.speechSynthesis;
        speechUtterance.current = new SpeechSynthesisUtterance(text);

        // Configure voice
        speechUtterance.current.voice = selectedVoiceRef.current;
        speechUtterance.current.lang = selectedVoiceRef.current.lang || 'en-US';
        speechUtterance.current.rate = 0.9;
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

        // Handle completion
        speechUtterance.current.onend = () => {
            clearInterval(keepSpeechAlive);
            speechUtterance.current = null;
            setIsSpeaking(false);

            if (callback) {
                setTimeout(() => callback(), 500);
            }
        };

        // Handle errors
        speechUtterance.current.onerror = (err) => {
            console.error("Speech error:", err);
            clearInterval(keepSpeechAlive);
            speechUtterance.current = null;
            setIsSpeaking(false);

            if (callback) {
                setTimeout(() => callback(), 500);
            }
        };

        // Start speaking
        try {
            synth.speak(speechUtterance.current);
            fetchPhonemes(text); // don't await
            // For avatar lip-sync

            // Fallback in case onend is not called
            const estimatedDuration = Math.max(5000, text.length * 80);
            setTimeout(() => {
                if (speechUtterance.current) {
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

    // Process the user's response with AI to generate an appropriate reply
    const processUserResponse = async (userText) => {
        if (!userText || !aiModel.current) return null;

        setIsProcessingResponse(true);

        try {
            // Build context from conversation history (last 6 exchanges)
            const recentHistory = conversationHistory.slice(-6);
            const contextString = recentHistory.map(entry =>
                `${entry.speaker === "interviewer" ? "Interviewer" : "Candidate"}: ${entry.text}`
            ).join("\n");

            let prompt;

            if (interviewStage === "greeting" || interviewStage === "smalltalk") {
                // For small talk, make it conversational and friendly
                prompt = `You are an AI interviewer named Camalia. You are conducting a ${InterviewType} interview.
                
                Recent conversation:
                ${contextString}
                
                The candidate just said: "${userText}"
                
                Respond naturally as if you're having a friendly conversation. Be supportive and encouraging.
                Your response should acknowledge what they said and either continue the small talk or naturally transition
                into beginning the interview. Keep your response under 3 sentences. Don't ask formal interview questions yet.`;
            } else {
                // For formal interview questions, analyze answers and give follow-ups
                const currentQ = questionList[currentQuestionIndex];

                prompt = `You are an AI interviewer named Camalia. You're conducting a ${InterviewType} interview.
                
                Recent conversation:
                ${contextString}
                
                Your current question was: "${currentQ}"
                The candidate just answered: "${userText}"
                
                Based on their answer, respond with ONE of the following:
                1. A follow-up question that digs deeper into something interesting in their answer
                2. A brief acknowledgment and transition to the next question if their answer was thorough
                3. A clarifying question if their answer was vague or incomplete
                
                Keep your response under 2 sentences. Be professional yet friendly. Don't tell them if their answer was good or bad.`;
            }

            const result = await aiModel.current.generateContent({
                contents: [{ parts: [{ text: prompt }] }]
            });

            const response = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

            setIsProcessingResponse(false);
            return response || null;
        } catch (error) {
            console.error("Error processing response:", error);
            setIsProcessingResponse(false);
            return null;
        }
    };

    // Analyze user's speech for emotions (basic - could be enhanced with ML)
    const analyzeEmotion = (text) => {
        const lowerText = text.toLowerCase();

        // Simple keyword matching - could be replaced with sentiment analysis
        if (/nervous|anxious|worried|stress|scared/.test(lowerText)) {
            return "nervous";
        } else if (/happy|great|good|excellent|excited|wonderful/.test(lowerText)) {
            return "happy";
        } else if (/sad|upset|disappointed|unhappy|bad|terrible/.test(lowerText)) {
            return "sad";
        } else if (/confused|unsure|don't understand|unclear/.test(lowerText)) {
            return "confused";
        }

        return "neutral";
    };

    const startListening = () => {
        if (isInterviewOver.current || isListeningActive || isSpeaking) {
            return;
        }

        setIsListeningActive(true);
        setCurrentResponse("");

        // Stop any existing recognition
        stopListening();

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                console.error("Speech recognition not supported in this browser");
                toast.error("Speech recognition not supported in your browser");
                return;
            }

            recognition.current = new SpeechRecognition();
            recognition.current.lang = "en-US";
            recognition.current.continuous = true;
            recognition.current.interimResults = true;
            recognition.current.maxAlternatives = 1;

            recognition.current.onresult = (event) => {
                const lastResultIndex = event.results.length - 1;
                const transcript = event.results[lastResultIndex][0].transcript.trim();

                // Update the current response as user speaks
                setCurrentResponse(transcript);

                // Reset silence timer as we're receiving speech
                clearTimeout(silenceTimer.current);

                // Set a new silence timer
                silenceTimer.current = setTimeout(async () => {
                    stopListening();

                    // Detect emotion from text
                    const detectedEmotion = analyzeEmotion(transcript);
                    setEmotionState(detectedEmotion);

                    // Add user's response to history
                    updateConversationHistory("candidate", transcript);

                    // For interview questions, save formal responses
                    if (interviewStage === "questions" && currentQuestionIndex >= 0 && currentQuestionIndex < questionList.length) {
                        setResponses(prev => ({
                            ...prev,
                            [questionList[currentQuestionIndex]]: transcript
                        }));
                    }

                    // Process the response and get AI's reply
                    const aiResponse = await processUserResponse(transcript);

                    if (aiResponse) {
                        // Add AI response to history and speak it
                        updateConversationHistory("interviewer", aiResponse);

                        speakResponse(aiResponse, () => {
                            // If we're in small talk and there's a reference to starting or being ready
                            if (interviewStage === "smalltalk" &&
                                /start|begin|ready|let's go|proceed|interview|question/i.test(transcript)) {
                                setInterviewStage("questions");
                                setTimeout(() => moveToNextQuestion(), 1000);
                            }
                            // If we're in greetings, move to small talk
                            else if (interviewStage === "greeting") {
                                setInterviewStage("smalltalk");
                                setTimeout(() => startListening(), 500);
                            }
                            // If we're in questions but not ready for the next one
                            else if (interviewStage === "questions" &&
                                !/next|continue|another|move on/i.test(aiResponse)) {
                                // Keep discussing the current question
                                setTimeout(() => startListening(), 500);
                            }
                            // Otherwise move to the next question
                            else if (interviewStage === "questions") {
                                setTimeout(() => moveToNextQuestion(), 1000);
                            } else {
                                // Default - continue listening
                                setTimeout(() => startListening(), 500);
                            }
                        });
                    } else {
                        // Fallback if AI fails
                        if (interviewStage === "questions") {
                            moveToNextQuestion();
                        } else {
                            speakResponse("Let's start with the interview questions now.", () => {
                                setInterviewStage("questions");
                                moveToNextQuestion();
                            });
                        }
                    }
                }, 2000); // 2 seconds of silence to process response
            };

            recognition.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                stopListening();
            };

            recognition.current.onend = () => {
                // If recognition ended but we weren't done, restart it
                if (isListeningActive && !isInterviewOver.current) {
                    try {
                        recognition.current.start();
                    } catch (e) {
                        console.error("Failed to restart recognition:", e);
                    }
                }
            };

            recognition.current.start();

            // Set silence timer for no response case
            silenceTimer.current = setTimeout(() => {
                stopListening();

                // Handle silence based on interview stage
                if (interviewStage === "greeting" || interviewStage === "smalltalk") {
                    speakResponse("I notice you're quiet. Are you ready to begin the interview questions?", () => {
                        setInterviewStage("questions");
                        setTimeout(() => moveToNextQuestion(), 1000);
                    });
                } else {
                    speakResponse("I didn't catch your response. Let's move on to the next question.", () => {
                        moveToNextQuestion();
                    });
                }
            }, RESPONSE_TIME_LIMIT);

        } catch (error) {
            console.error("Error setting up speech recognition:", error);
            stopListening();
        }
    };

    const stopListening = () => {
        setIsListeningActive(false);
        clearTimeout(silenceTimer.current);

        if (recognition.current) {
            try {
                recognition.current.stop();
            } catch (e) {
                console.warn("Error stopping recognition:", e);
            }
            recognition.current = null;
        }
    };

    const moveToNextQuestion = () => {
        if (processingAction.current || isInterviewOver.current) {
            return;
        }

        processingAction.current = true;

        // Clear current response
        setCurrentResponse("");

        // Check if we have more questions
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex >= questionList.length) {
            processingAction.current = false;
            endInterview();
            return;
        }

        // Set the next question
        const nextQuestion = questionList[nextIndex];
        setCurrentQuestionIndex(nextIndex);
        setQuestion(nextQuestion);

        // Speak the question and start listening for response
        speakResponse(nextQuestion, () => {
            processingAction.current = false;
            startListening();
        });
    };

    const repeatCurrentQuestion = () => {
        if (isSpeaking || processingAction.current || !question) return;

        processingAction.current = true;
        speakResponse(question, () => {
            processingAction.current = false;
            startListening();
        });
    };

    const submitResponse = () => {
        if (!currentResponse) return;

        stopListening();

        // Add to conversation history
        updateConversationHistory("candidate", currentResponse);

        // For formal questions, save the response
        if (interviewStage === "questions" && currentQuestionIndex >= 0) {
            const currentQ = questionList[currentQuestionIndex];
            setResponses(prev => ({ ...prev, [currentQ]: currentResponse }));
        }

        // Process the response asynchronously
        processUserResponse(currentResponse).then(aiResponse => {
            if (aiResponse) {
                updateConversationHistory("interviewer", aiResponse);
                speakResponse(aiResponse, () => {
                    if (interviewStage === "smalltalk" &&
                        /start|begin|ready|let's go|proceed|interview|question/i.test(currentResponse)) {
                        setInterviewStage("questions");
                        setTimeout(() => moveToNextQuestion(), 1000);
                    }
                    else if (interviewStage === "questions" &&
                        !/next|continue|another|move on/i.test(aiResponse)) {
                        setTimeout(() => startListening(), 500);
                    }
                    else if (interviewStage === "questions") {
                        setTimeout(() => moveToNextQuestion(), 1000);
                    } else {
                        setTimeout(() => startListening(), 500);
                    }
                });
            } else {
                // Fallback if AI fails
                if (interviewStage === "questions") {
                    moveToNextQuestion();
                } else {
                    setInterviewStage("questions");
                    moveToNextQuestion();
                }
            }
        });
    };

    const skipQuestion = () => {
        stopListening();
        setTimeout(() => moveToNextQuestion(), 500);
    };

    const endInterview = () => {
        if (isInterviewOver.current) return;

        isInterviewOver.current = true;
        clearInterval(interviewTimer.current);
        stopListening();



        // Generate a personalized conclusion based on the conversation
        generateConclusion().then(conclusion => {
            const finalMessage = conclusion || "Thank you for completing the interview. We appreciate your time and responses!";

            speakResponse(finalMessage, () => {

                toast.success("Interview completed successfully");
                setTimeout(() => navigate("/"), 2000);
            });
        });
    };

    // Generate a personalized conclusion
    const generateConclusion = async () => {
        if (!aiModel.current) return null;

        try {
            // Build context from all the formal question responses
            const responseSummary = Object.entries(responses)
                .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
                .join("\n\n");

            const prompt = `You are an AI interviewer named Camalia who just finished conducting a ${InterviewType} interview.
            
            The candidate provided these responses to your questions:
            ${responseSummary}
            
            Create a friendly, encouraging conclusion to end the interview. Thank them for their time, mention 1-2 specific
            positive aspects of their responses, and wish them well. Keep it under 3 sentences and professional.`;

            const result = await aiModel.current.generateContent({
                contents: [{ parts: [{ text: prompt }] }]
            });

            return result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
        } catch (error) {
            console.error("Error generating conclusion:", error);
            return null;
        }
    };



    const handleVideoStop = async () => {
        if (recordedChunks.length === 0) return;

        const blob = new Blob(recordedChunks, { type: "video/webm" });
        setRecordedChunks([]);

        const formData = new FormData();
        formData.append("video", blob, "interview.webm");
        formData.append("interviewType", InterviewType);

        try {
            const response = await axios.post(
                "https://upskillme-e2tz.onrender.com/api/v1/uploadtocloud",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                toast.success("Interview video saved successfully");
            }
        } catch (error) {
            console.error("Error uploading video:", error);
            toast.error("Failed to save interview recording");
        }
    };

    // Format timer for display
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-gray-900 text-white flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-xl">Preparing your interview...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-900 text-white p-4 flex items-center justify-center">
            <div className="w-full max-w-[80%] h-full bg-gray-800 rounded-xl border-rounded overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-gray-900 py-4 px-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-400">AI INTERVIEWER</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-white text-sm">
                            {interviewStage === "questions" &&
                                `Question ${currentQuestionIndex + 1}/${questionList.length}`}
                        </div>
                        <div className="text-red-500 font-medium text-lg">
                            {`Time: ${formatTime(timer)}`}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Left Side - Interviewer */}
                    <div className="w-full md:w-1/2 flex flex-col p-6 space-y-6">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            <Scene phonemes={phonemes} isSpeaking={isSpeaking} />
                        </div>
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-blue-400 mb-2">Question {currentQuestionIndex + 1}/{questionList.length}:</h2>
                            <p>{question || "Waiting for a question..."}</p>
                        </div>
                    </div>

                    {/* Right Side - Candidate */}
                    <div className="w-full md:w-1/2 flex flex-col p-6 space-y-6">
                        <div className="relative aspect-square bg-gray-700 rounded-lg overflow-hidden">
                            <VideoStream isInterviewOver={isInterviewOver.current} />

                            <div className="absolute top-2 left-2 flex items-center space-x-2 bg-black bg-opacity-50 px-3 py-1 rounded-full text-xs text-white">
                                <span className="h-2.5 w-2.5 bg-red-500 rounded-full animate-ping"></span>
                                <span>LIVE</span>
                            </div>
                            {isListeningActive && (
                                <div className="absolute bottom-2 right-2 bg-green-500 px-3 py-1 rounded-full text-xs text-white">
                                    Listening...
                                </div>
                            )}
                        </div>

                        {/* Answer Input */}
                        <div className="flex flex-col flex-1">
                            <h2 className="text-lg font-semibold text-purple-400 mb-2">Your Response:</h2>
                            <div className="flex-1 bg-gray-700 p-4 rounded-lg overflow-auto">
                                {currentResponse || "Your answer will appear here as you speak..."}
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={endInterview}
                                className="py-2 px-4 bg-red-500 hover:bg-red-600 rounded-lg font-medium"
                            >
                                End Interview
                            </button>

                            <button
                                onClick={isListeningActive ? stopListening : startListening}
                                disabled={isSpeaking || processingAction.current}
                                className={`py-2 px-4 ${isListeningActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} rounded-lg font-medium disabled:opacity-50`}
                            >
                                {isListeningActive ? 'Stop Listening' : 'Start Listening'}
                            </button>

                            <button
                                onClick={submitResponse}
                                disabled={!currentResponse || processingAction.current}
                                className="py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium disabled:opacity-50"
                            >
                                Submit Response
                            </button>
                        </div>

                        {/* Extra Controls */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={repeatCurrentQuestion}
                                disabled={!question || isSpeaking || processingAction.current}
                                className="py-2 px-4 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium disabled:opacity-50"
                            >
                                Repeat Question
                            </button>
                            <button
                                onClick={skipQuestion}
                                disabled={processingAction.current}
                                className="py-2 px-4 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-medium disabled:opacity-50"
                            >
                                Skip Question
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}