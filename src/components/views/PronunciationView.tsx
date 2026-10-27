import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../db/linguaDb';
import {
  Mic,
  MicOff,
  Volume2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Award,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Check,
  Flame,
  Play,
  Square,
  HelpCircle,
  Headphones
} from 'lucide-react';

interface WordAnalysis {
  word: string;
  spokenAs: string;
  status: 'correct' | 'mispronounced' | 'omitted' | 'extra';
  ipa?: string;
  phoneticTipUz?: string;
}

interface PronunciationResult {
  transcription?: string;
  score: number;
  accuracyRating: 'excellent' | 'good' | 'needs_work';
  wordsAnalysis: WordAnalysis[];
  soundTipsUz: string[];
  summaryUz: string;
  isDemo?: boolean;
}

interface PracticeItem {
  id: string;
  text: string;
  translationUz: string;
  category: 'words' | 'phrases' | 'twisters' | 'custom';
  ipa?: string;
  difficulty: 'A1' | 'A2' | 'B1' | 'B2';
  focusSoundUz?: string;
}

export const PronunciationView: React.FC = () => {
  const { targetLanguage, cefrLevel } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<'words' | 'phrases' | 'twisters' | 'custom'>('words');
  const [practiceList, setPracticeList] = useState<PracticeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Custom text input
  const [customInputText, setCustomInputText] = useState('');
  const [testSpeechInput, setTestSpeechInput] = useState('');

  // Speech recording & playback states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.8 | 1.0>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Real audio recording & user voice replay
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);

  // History of practiced items
  const [practicedHistory, setPracticedHistory] = useState<Array<{
    text: string;
    score: number;
    timestamp: string;
  }>>([]);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const langTitle = targetLanguage === 'ru' ? 'Rus tili' : 'Ingliz tili';
  const flag = targetLanguage === 'ru' ? '🇷🇺' : '🇬🇧';

  // Preset exercises for English & Russian
  const defaultPhrases: Record<string, PracticeItem[]> = {
    en: [
      {
        id: 'p-1',
        text: 'Practice makes perfect.',
        translationUz: 'Mashq qilish mukammallikka yetaklaydi.',
        category: 'phrases',
        ipa: '/ˈpræk.tɪs meɪks ˈpɜː.fɪkt/',
        difficulty: 'A1',
        focusSoundUz: "'p' va 'r' tovushlarining ravon talaffuzi"
      },
      {
        id: 'p-2',
        text: 'I would like to improve my pronunciation.',
        translationUz: 'Men talaffuzimni yaxshilashni xohlayman.',
        category: 'phrases',
        ipa: '/aɪ wʊd laɪk tuː ɪmˈpruːv maɪ prəˌnʌn.siˈeɪ.ʃən/',
        difficulty: 'A2',
        focusSoundUz: "'pronunciation' so'zidagi urg'u 'a' bo'g'inida"
      },
      {
        id: 'p-3',
        text: 'Could you please speak a little slower?',
        translationUz: 'Iltimos, biroz sekinroq gapira olasizmi?',
        category: 'phrases',
        ipa: '/kʊd juː pliːz spiːk ə ˈlɪt.əl ˈsləʊ.ər/',
        difficulty: 'A2',
        focusSoundUz: "'could' va 'please' so'zlaridagi yumshoq talaffuz"
      },
      {
        id: 'p-4',
        text: 'Consistency is essential for language learning.',
        translationUz: 'Izchillik til o\'rganish uchun juda muhimdir.',
        category: 'phrases',
        ipa: '/kənˈsɪs.tən.si ɪz ɪˈsen.ʃəl fɔːr ˈlæŋ.ɡwɪdʒ ˈlɜː.nɪŋ/',
        difficulty: 'B1',
        focusSoundUz: "'essential' [ɪˈsen.ʃəl] va 'consistency' urg'usi"
      }
    ],
    ru: [
      {
        id: 'ru-p-1',
        text: 'Повторение — мать учения.',
        translationUz: 'Takrorlash — bilimning onasidir.',
        category: 'phrases',
        ipa: '/pəvtɐˈrʲenʲɪje matʲ ʊˈt͡ɕenʲɪjə/',
        difficulty: 'A1',
        focusSoundUz: "'е' va 'я' harflarining yumshatib o'qilishi"
      },
      {
        id: 'ru-p-2',
        text: 'Я хочу научиться говорить свободно.',
        translationUz: 'Men erkin gapirishni o\'rganmoqchiman.',
        category: 'phrases',
        ipa: '/ja xɐˈt͡ɕu nəʊˈt͡ɕit͡sə ɡəvɐˈrʲitʲ svɐˈbodnə/',
        difficulty: 'A2',
        focusSoundUz: "'говорить' so'zidagi urg'usiz 'о' harflari [а] kabi aytiladi"
      },
      {
        id: 'ru-p-3',
        text: 'Каждый день я делаю новые успехи.',
        translationUz: 'Har kuni men yangi muvaffaqiyatlarga erishaman.',
        category: 'phrases',
        ipa: '/ˈkaʐdɨj dʲenʲ ja ˈdʲeləjʊ ˈnovɨje ʊsˈpʲexʲɪ/',
        difficulty: 'B1',
        focusSoundUz: "'каждый' so'zida 'ж' qattiq tovushi"
      }
    ]
  };

  const defaultTwisters: Record<string, PracticeItem[]> = {
    en: [
      {
        id: 'tw-1',
        text: 'She sells seashells by the seashore.',
        translationUz: 'U dengiz sohilida dengiz chig\'anoqlarini sotadi.',
        category: 'twisters',
        ipa: '/ʃiː selz ˈsiː.ʃelz baɪ ðə ˈsiː.ʃɔːr/',
        difficulty: 'A2',
        focusSoundUz: "[ʃ] ('sh') va [s] ('s') tovushlarini almashtirib yubormaslik"
      },
      {
        id: 'tw-2',
        text: 'Thirty-three thankful thieves thought thoroughly.',
        translationUz: 'O\'ttiz uch minnatdor o\'g\'ri chuqur o\'ylashdi.',
        category: 'twisters',
        ipa: '/ˈθɜː.ti θriː ˈθæŋk.fəl θiːvz θɔːt ˈθʌr.ə.li/',
        difficulty: 'B1',
        focusSoundUz: "[θ] ('th') tishlar orasiga tilni qo'yib havoni chiqarish"
      },
      {
        id: 'tw-3',
        text: 'Red lorry, yellow lorry, red lorry, yellow lorry.',
        translationUz: 'Qizil yuk mashinasi, sariq yuk mashinasi...',
        category: 'twisters',
        ipa: '/red ˈlɒr.i ˈjel.əʊ ˈlɒr.i/',
        difficulty: 'B1',
        focusSoundUz: "[r] va [l] tovushlarining tez almashinuvi"
      }
    ],
    ru: [
      {
        id: 'ru-tw-1',
        text: 'Шла Саша по шоссе и сосала сушку.',
        translationUz: 'Sasha shosseda ketayotib quritilgan non (sushka) shimib borardi.',
        category: 'twisters',
        ipa: '/ʃla ˈsaʂə pə ʂɐsʲˈse i sɐˈsalə ˈsuʂkʊ/',
        difficulty: 'A2',
        focusSoundUz: "[ш] va [с] tovushlarini aniq farqlash"
      },
      {
        id: 'ru-tw-2',
        text: 'Карл у Клары украл кораллы, а Клара у Карла украла кларнет.',
        translationUz: 'Karl Klaradan marjonlarni o\'g\'irladi, Klara esa Karldan klarnetni...',
        category: 'twisters',
        ipa: '/karl u ˈklarɨ ʊˈkral kɐˈralɨ/',
        difficulty: 'B1',
        focusSoundUz: "Ketma-ket kelgan 'р' va 'л' undoshlarining ravonligi"
      }
    ]
  };

  useEffect(() => {
    loadVocabularyItems();
    return () => {
      cleanupAudio();
    };
  }, [targetLanguage]);

  const cleanupAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const loadVocabularyItems = async () => {
    try {
      const dictWords = await db.dictionary
        .filter((d) => d.language === targetLanguage)
        .limit(10)
        .toArray();

      const wordItems: PracticeItem[] = dictWords.map((w, idx) => ({
        id: `vw-${idx}`,
        text: w.term,
        translationUz: w.uzbekTranslation,
        category: 'words',
        ipa: w.pronunciation || undefined,
        difficulty: (cefrLevel as any) || 'A1',
        focusSoundUz: `${w.term} so'zining to'g'ri bo'g'in va urg'usi`
      }));

      const finalWords = wordItems.length > 0 ? wordItems : (
        targetLanguage === 'ru' ? [
          { id: 'vw-1', text: 'Здравствуйте', translationUz: 'Assalomu alaykum', category: 'words', ipa: '/ˈzdrastvʊjtʲe/', difficulty: 'A1', focusSoundUz: "'в' harfi aytilmaydi (zdrast-vuy-te)" },
          { id: 'vw-2', text: 'Пожалуйста', translationUz: 'Iltimos / Arzimaydi', category: 'words', ipa: '/pɐˈʐalʊstə/', difficulty: 'A1', focusSoundUz: "'й' harfi yutilib ketadi" },
          { id: 'vw-3', text: 'Спасибо', translationUz: 'Rahmat', category: 'words', ipa: '/spɐˈsʲibə/', difficulty: 'A1', focusSoundUz: "'о' urg'usiz bo'lib [а] eshitiladi" }
        ] : [
          { id: 'vw-1', text: 'Pronunciation', translationUz: 'Talaffuz', category: 'words', ipa: '/prəˌnʌn.siˈeɪ.ʃən/', difficulty: 'A2', focusSoundUz: "'pro-NUN-si-a-tion'" },
          { id: 'vw-2', text: 'Comfortable', translationUz: 'Qulay', category: 'words', ipa: '/ˈkʌm.fə.tə.bəl/', difficulty: 'B1', focusSoundUz: "'comf-ter-ble' deb o'qiladi ('for' aytilmaydi)" },
          { id: 'vw-3', text: 'Opportunity', translationUz: 'Imkoniyat', category: 'words', ipa: '/ˌɒp.əˈtjuː.nə.ti/', difficulty: 'B1', focusSoundUz: "Urg'u 'tu' bo'g'inida" }
        ]
      );

      updatePracticeList('words', finalWords);
    } catch (err) {
      console.warn('Error loading words:', err);
    }
  };

  const updatePracticeList = (cat: 'words' | 'phrases' | 'twisters' | 'custom', wordsListOverride?: PracticeItem[]) => {
    setActiveCategory(cat);
    setCurrentIndex(0);
    setResult(null);
    setSpokenTranscript('');
    setInterimText('');
    setErrorMessage(null);
    setUserAudioUrl(null);

    if (cat === 'words') {
      if (wordsListOverride) {
        setPracticeList(wordsListOverride);
      }
    } else if (cat === 'phrases') {
      setPracticeList(defaultPhrases[targetLanguage] || defaultPhrases.en);
    } else if (cat === 'twisters') {
      setPracticeList(defaultTwisters[targetLanguage] || defaultTwisters.en);
    } else if (cat === 'custom') {
      setPracticeList([
        {
          id: 'custom-1',
          text: customInputText.trim() || (targetLanguage === 'ru' ? 'Я говорю на русском языке.' : 'I speak English clearly and fluently.'),
          translationUz: 'O\'zingiz kiritgan erkin matn',
          category: 'custom',
          difficulty: 'B1',
          focusSoundUz: 'Erkin nutq mashqi'
        }
      ]);
    }
  };

  const currentItem: PracticeItem | undefined = practiceList[currentIndex];

  // Native Speech Synthesis
  const playSampleAudio = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLanguage === 'ru' ? 'ru-RU' : 'en-US';
    utterance.rate = playbackSpeed;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // User recorded audio player toggle
  const togglePlayUserAudio = () => {
    if (!userAudioUrl) return;

    if (!userAudioPlayerRef.current) {
      userAudioPlayerRef.current = new Audio(userAudioUrl);
      userAudioPlayerRef.current.onended = () => setIsPlayingUserAudio(false);
      userAudioPlayerRef.current.onerror = () => setIsPlayingUserAudio(false);
    }

    if (isPlayingUserAudio) {
      userAudioPlayerRef.current.pause();
      setIsPlayingUserAudio(false);
    } else {
      userAudioPlayerRef.current.currentTime = 0;
      userAudioPlayerRef.current.play().then(() => {
        setIsPlayingUserAudio(true);
      }).catch((e) => {
        console.warn('Play user audio error:', e);
        setIsPlayingUserAudio(false);
      });
    }
  };

  // Robust Dual Microphone Engine:
  // Uses getUserMedia + MediaRecorder for actual voice recording & level visualization,
  // while running Web Speech Recognition in parallel for instant text.
  // If Web Speech API throws "not-allowed" due to iframe sandbox policy,
  // MediaRecorder CONTINUES recording seamlessly, and audio is analyzed via Gemini!
  const handleStartRecording = async () => {
    setErrorMessage(null);
    setResult(null);
    setSpokenTranscript('');
    setInterimText('');
    setUserAudioUrl(null);
    audioChunksRef.current = [];

    // Step 1: Request Microphone Access via navigator.mediaDevices.getUserMedia
    let stream: MediaStream;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Sizning brauzeringiz mikrofon yozishni qo'llab-quvvatlamaydi.");
      }
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      audioStreamRef.current = stream;
    } catch (err: any) {
      console.warn("getUserMedia failed:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage("Mikrofonga ruxsat berilmadi. Iltimos, brauzer manzil qatoridagi qulf belgisini bosib, mikrofonni 'Ruxsat berilgan' (Allow) qilib qo'ying.");
      } else {
        setErrorMessage(`Mikrofonni ochishda xatolik: ${err.message || 'Qurilma topilmadi'}`);
      }
      return;
    }

    // Step 2: Setup MediaRecorder to record audio stream
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(250); // Slice chunks every 250ms
    } catch (recorderErr) {
      console.warn("MediaRecorder init error:", recorderErr);
    }

    // Step 3: Setup AudioContext for Live Microphone Level Visualization
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateLevel = () => {
          if (!audioStreamRef.current) return;
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        };
        updateLevel();
      }
    } catch (audioCtxErr) {
      console.warn("AudioContext visualizer error:", audioCtxErr);
    }

    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        // Auto-stop after 8 seconds
        if (prev >= 7) {
          stopRecording();
          return 8;
        }
        return prev + 1;
      });
    }, 1000);

    // Step 4: Optional Web Speech API progressive enhancement
    let finalTranscript = '';
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = targetLanguage === 'ru' ? 'ru-RU' : 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setSpokenTranscript(finalTranscript.trim());
          }
          setInterimText(interim);
        };

        recognition.onerror = (event: any) => {
          // IMPORTANT: Do NOT fail if speech recognition errors (e.g. iframe restrictions).
          // MediaRecorder is capturing the actual audio stream!
          console.log("Speech recognition notice (recording audio stream directly):", event.error);
        };

        recognition.start();
      } catch (speechErr) {
        console.log("Speech recognition start skipped, using direct audio recorder:", speechErr);
      }
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setMicVolumeLevel(0);
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = async () => {
        const recordedBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm'
        });

        // Create playable audio URL for the user
        const audioUrl = URL.createObjectURL(recordedBlob);
        setUserAudioUrl(audioUrl);
        userAudioPlayerRef.current = new Audio(audioUrl);

        // Process audio or transcript
        const currentTargetText = currentItem?.text || '';
        const transcriptText = spokenTranscript.trim() || interimText.trim();

        if (transcriptText) {
          // If we got text, run text error analysis
          analyzeTextSpeech(currentTargetText, transcriptText);
        } else if (recordedBlob.size > 500) {
          // Otherwise, send recorded audio blob directly to Gemini audio analyzer!
          analyzeAudioBlob(currentTargetText, recordedBlob);
        } else {
          setErrorMessage("Ovoz juda qisqa bo'ldi. Iltimos, mikrofonni bosib gapiring va tugatgach to'xtating.");
        }

        // Clean up tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }
      };

      try {
        recorder.stop();
      } catch (e) {
        console.warn("Recorder stop error:", e);
      }
    } else {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
        audioStreamRef.current = null;
      }
    }
  };

  // Send raw recorded audio Blob to Gemini Audio Analysis
  const analyzeAudioBlob = async (targetText: string, audioBlob: Blob) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await base64Promise;

      const res = await fetch('/api/ai/pronunciation-audio-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetText,
          audioBase64,
          mimeType: audioBlob.type || 'audio/webm',
          language: targetLanguage
        })
      });

      if (!res.ok) {
        throw new Error("Ovozni tahlil qilishda xatolik yuz berdi");
      }

      const data: PronunciationResult = await res.json();
      setResult(data);
      if (data.transcription) {
        setSpokenTranscript(data.transcription);
      }

      setPracticedHistory((prev) => [
        {
          text: targetText,
          score: data.score,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 5)
      ]);
    } catch (err: any) {
      console.error("Audio analyze error:", err);
      setErrorMessage("Ovoz tahlil qilinmoqda, qaytadan urinib ko'rishingiz mumkin.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Perform AI Text-based Speech Analysis
  const analyzeTextSpeech = async (targetText: string, userSpokenText: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/pronunciation-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetText,
          spokenText: userSpokenText,
          language: targetLanguage
        })
      });

      if (!res.ok) {
        throw new Error("Talaffuzni tahlil qilishda xatolik yuz berdi");
      }

      const data: PronunciationResult = await res.json();
      setResult(data);

      setPracticedHistory((prev) => [
        {
          text: targetText,
          score: data.score,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev.slice(0, 5)
      ]);
    } catch (err: any) {
      console.error('Analyze error:', err);
      setErrorMessage(err.message || "Tahlil jarayonida xatolik yuz berdi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualCheck = (manualInput: string) => {
    if (!manualInput.trim() || !currentItem) return;
    setSpokenTranscript(manualInput);
    analyzeTextSpeech(currentItem.text, manualInput);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">{flag}</span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {langTitle} Talaffuz Trenajyori & Jonli Ovozli Xatolarni Topish
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Mikrofon orqali gapiring: AI har bir so'z talaffuzini, urg'usini va fonetik xatolarini 1 soniyada tahlil qilib beradi.
          </p>
        </div>

        {/* Practice Categories */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex-wrap gap-1">
          <button
            onClick={() => updatePracticeList('words')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'words'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lug'at so'zlari</span>
          </button>

          <button
            onClick={() => updatePracticeList('phrases')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'phrases'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Kundalik iboralar</span>
          </button>

          <button
            onClick={() => updatePracticeList('twisters')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'twisters'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Tez aytishlar</span>
          </button>

          <button
            onClick={() => updatePracticeList('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeCategory === 'custom'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Erkin matn</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Trainer Card (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custom Text Input if category is custom */}
          {activeCategory === 'custom' && (
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Talaffuzini sinamoqchi bo'lgan matningizni kiriting:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  placeholder={
                    targetLanguage === 'ru'
                      ? "Masalan: Здравствуйте, меня зовут Умиджон."
                      : "Masalan: I am confident in my communication skills."
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => updatePracticeList('custom')}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  O'rnatish
                </button>
              </div>
            </div>
          )}

          {/* Current Practice Card */}
          {currentItem && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
              {/* Category & Sound badge */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] uppercase tracking-wider">
                    {currentItem.category === 'words' ? 'Lug\'at so\'zi' : currentItem.category === 'twisters' ? 'Tez aytish' : 'Foydali jumla'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[10px]">
                    Daraja: {currentItem.difficulty}
                  </span>
                </div>

                {/* Speed Toggle & Audio */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-[11px] font-semibold">
                    <button
                      onClick={() => setPlaybackSpeed(1.0)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        playbackSpeed === 1.0 ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-500'
                      }`}
                    >
                      1.0x
                    </button>
                    <button
                      onClick={() => setPlaybackSpeed(0.8)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        playbackSpeed === 0.8 ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-500'
                      }`}
                      title="Sekinlashtirilgan namunaviy audio"
                    >
                      0.8x
                    </button>
                  </div>

                  <button
                    onClick={() => playSampleAudio(currentItem.text)}
                    disabled={isPlayingAudio}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Volume2 className={`w-4 h-4 ${isPlayingAudio ? 'animate-bounce text-blue-600' : ''}`} />
                    <span>Namunani tinglash</span>
                  </button>
                </div>
              </div>

              {/* Target Text Hero */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50/20 to-white dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900 border border-slate-200/80 dark:border-slate-700 text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                  "{currentItem.text}"
                </h2>
                
                {currentItem.ipa && (
                  <p className="font-mono text-indigo-600 dark:text-indigo-400 text-sm sm:text-base font-semibold">
                    {currentItem.ipa}
                  </p>
                )}

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic">
                  Tarjimasi: "{currentItem.translationUz}"
                </p>

                {currentItem.focusSoundUz && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] font-medium mt-1">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                    <span>Diqqat qiling: {currentItem.focusSoundUz}</span>
                  </div>
                )}
              </div>

              {/* Central Microphone Area */}
              <div className="py-2 text-center space-y-4">
                <div className="relative inline-block">
                  {/* Glowing Pulse Rings when recording */}
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                      <div className="absolute -inset-2 rounded-full bg-red-500/10 animate-pulse" />
                    </>
                  )}

                  <button
                    onClick={isRecording ? stopRecording : handleStartRecording}
                    disabled={isAnalyzing}
                    className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                      isRecording
                        ? 'bg-red-600 text-white scale-105 shadow-red-500/40'
                        : isAnalyzing
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:scale-105 shadow-blue-500/30'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-7 h-7 fill-white" />
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                          0:0{recordingSeconds} • Stop
                        </span>
                      </>
                    ) : isAnalyzing ? (
                      <>
                        <RefreshCw className="w-8 h-8 animate-spin" />
                        <span className="text-[10px] font-bold mt-1">Tahlil...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-9 h-9" />
                        <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                          Gapiring
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Animated Sound Wave Bars with real Volume Reactivity */}
                {isRecording && (
                  <div className="flex items-center justify-center gap-1.5 h-8">
                    {[30, 60, 95, 70, 85, 50, 80].map((baseHeight, i) => {
                      const dynamicHeight = Math.max(20, Math.min(100, baseHeight * (0.4 + (micVolumeLevel / 100) * 0.8)));
                      return (
                        <div
                          key={i}
                          className="w-1.5 bg-red-500 rounded-full transition-all duration-75"
                          style={{
                            height: `${dynamicHeight}%`
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isRecording
                    ? "🔴 Ovoz yozilmoqda... Gapirib bo'lgach tugmani bosing"
                    : isAnalyzing
                    ? "🤖 AI talaffuz va urg'uni tahlil qilmoqda..."
                    : "Mikrofonni bosib, gapni ovoz chiqarib o'qing"}
                </p>

                {/* Replay User Recorded Voice */}
                {userAudioUrl && !isRecording && (
                  <div className="inline-flex items-center gap-2 p-1.5 px-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                    <Headphones className="w-4 h-4 text-emerald-600" />
                    <span>O'z ovozingizni eshiting:</span>
                    <button
                      onClick={togglePlayUserAudio}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      {isPlayingUserAudio ? <Square className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white" />}
                      <span>{isPlayingUserAudio ? "To'xtatish" : "Tinglash"}</span>
                    </button>
                  </div>
                )}

                {/* Live spoken preview */}
                {(spokenTranscript || interimText) && (
                  <div className="p-3.5 max-w-md mx-auto rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-left">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">
                      Eshitilgan nutq (Transkript):
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm mt-0.5 italic">
                      "{spokenTranscript} {interimText}"
                    </p>
                  </div>
                )}

                {/* Quick speech input field (or test intentional mistakes) */}
                <div className="pt-2 max-w-md mx-auto space-y-2">
                  <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <input
                      type="text"
                      value={testSpeechInput}
                      onChange={(e) => setTestSpeechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && testSpeechInput.trim()) {
                          handleManualCheck(testSpeechInput);
                        }
                      }}
                      placeholder="Yoki nutqni yozma kiritib xatoni toping..."
                      className="flex-1 px-3 py-1.5 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (testSpeechInput.trim()) {
                          handleManualCheck(testSpeechInput);
                        }
                      }}
                      disabled={!testSpeechInput.trim() || isAnalyzing}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
                    >
                      Xatoni topish
                    </button>
                  </div>

                  {/* Quick Intentional Mistake Simulators */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                    <span>Sinov:</span>
                    <button
                      onClick={() => {
                        const correctVal = currentItem.text;
                        setTestSpeechInput(correctVal);
                        handleManualCheck(correctVal);
                      }}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                    >
                      To'g'ri talaffuz (100%)
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => {
                        const words = currentItem.text.split(' ');
                        const mispronounced = words.map((w, idx) => idx % 2 === 1 ? w.slice(0, Math.max(2, w.length - 2)) + 's' : w).join(' ');
                        setTestSpeechInput(mispronounced);
                        handleManualCheck(mispronounced);
                      }}
                      className="text-amber-600 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
                    >
                      Xato bilan sinash
                    </button>
                  </div>
                </div>
              </div>

              {/* Navigation pagination buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <button
                  onClick={() => {
                    setCurrentIndex((prev) => Math.max(0, prev - 1));
                    setResult(null);
                    setSpokenTranscript('');
                    setUserAudioUrl(null);
                  }}
                  disabled={currentIndex === 0}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ← Oldingi
                </button>

                <div className="flex items-center gap-1.5">
                  {practiceList.slice(0, 7).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentIndex(i);
                        setResult(null);
                        setSpokenTranscript('');
                        setUserAudioUrl(null);
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        currentIndex === i
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setCurrentIndex((prev) => Math.min(practiceList.length - 1, prev + 1));
                    setResult(null);
                    setSpokenTranscript('');
                    setUserAudioUrl(null);
                  }}
                  disabled={currentIndex === practiceList.length - 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Keyingi →
                </button>
              </div>
            </div>
          )}

          {/* Error Message banner with Help */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleStartRecording}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
                >
                  Mikrofonni qaytadan ulash
                </button>
              </div>
            </div>
          )}

          {/* AI PRONUNCIATION RESULTS & ERROR DETECTION CARD */}
          {result && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in slide-in-from-bottom-2">
              {/* Header score & rating */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm ${
                    result.score >= 90
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : result.score >= 70
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {result.score}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        Talaffuz aniqligi
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        result.score >= 90
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : result.score >= 70
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300'
                          : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                      }`}>
                        {result.score >= 90 ? "A'lo talaffuz! 🎉" : result.score >= 70 ? "Yaxshi natija 👍" : "Mashq qilish kerak 🎯"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      AI nutq tahlili: {result.accuracyRating === 'excellent' ? 'Tabiiy va ravon' : 'Fonetik xatolar aniqlandi'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {userAudioUrl && (
                    <button
                      onClick={togglePlayUserAudio}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>{isPlayingUserAudio ? "To'xtatish" : "O'z ovozim"}</span>
                    </button>
                  )}

                  <button
                    onClick={handleStartRecording}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Qaytadan aytish</span>
                  </button>
                </div>
              </div>

              {/* WORD-BY-WORD ERROR DETECTION DISPLAY */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-600" />
                    Har bir so'z talaffuzi tahlili:
                  </h4>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> To'g'ri
                    </span>
                    <span className="flex items-center gap-1 text-red-600 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-red-500" /> Xato/Buzilgan
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  {result.wordsAnalysis.map((item, idx) => {
                    const isCorrect = item.status === 'correct';
                    return (
                      <div
                        key={idx}
                        className={`px-3 py-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                          isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                            : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/80 text-red-900 dark:text-red-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {isCorrect ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          )}
                          <span className="font-bold text-sm">{item.word}</span>
                        </div>

                        {item.ipa && (
                          <span className="text-[10px] font-mono opacity-80">
                            {item.ipa}
                          </span>
                        )}

                        {!isCorrect && (
                          <span className="text-[10px] text-red-600 dark:text-red-300 font-medium bg-red-100/60 dark:bg-red-900/60 px-1.5 py-0.2 rounded">
                            Eshitildi: "{item.spokenAs}"
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SPECIFIC PHONETIC EXPLANATIONS */}
              {result.wordsAnalysis.some((w) => w.status !== 'correct' && w.phoneticTipUz) && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Aniqlangan fonetik xatolar bo'yicha maslahatlar:
                  </span>
                  <div className="space-y-2">
                    {result.wordsAnalysis
                      .filter((w) => w.status !== 'correct' && w.phoneticTipUz)
                      .map((w, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs flex items-start gap-2"
                        >
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-900 dark:text-amber-300">
                              "{w.word}" so'zi:
                            </span>
                            <p className="text-amber-800 dark:text-amber-200 mt-0.5">
                              {w.phoneticTipUz}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ACTIONABLE SOUND TIPS */}
              {result.soundTipsUz && result.soundTipsUz.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5 text-xs">
                  <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Fonetika va nutq texnikasi bo'yicha tavsiyalar:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                    {result.soundTipsUz.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Overall AI Summary */}
              {result.summaryUz && (
                <div className="p-3.5 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-300">
                  <span className="font-bold block mb-0.5">AI Tyutor xulosasi:</span>
                  <p>{result.summaryUz}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar: Pronunciation Tips & History (1 col) */}
        <div className="space-y-6">
          {/* Pronunciation Rule Guide Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Talaffuz qoidalari ({langTitle})
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {targetLanguage === 'en' ? (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      1. "TH" tovushi [θ] va [ð]:
                    </span>
                    <p>Til uchini yuqori va pastki tishlar orasiga qo'yib havoni chiqaring (think, that).</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      2. "W" vs "V" tovushlari:
                    </span>
                    <p>"W" aytilganda lablar dumaloq qilinadi (water), "V" da esa yuqori tishlar pastki labga tekkiziladi (very).</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      3. So'z urg'usi (Stress):
                    </span>
                    <p>Ingliz tilida urg'uli bo'g'in balandroq va cho'ziqroq aytiladi, qolgan bo'g'inlar schwa [ə] ga aylanadi.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      1. Reduksiya (Urg'usiz "О"):
                    </span>
                    <p>Rus tilida urg'u tushmagan "О" harfi [а] yoki qisqa [ъ] kabi talaffuz qilinadi (молоко → [мълако]).</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      2. Yumshoq va qattiq undoshlar:
                    </span>
                    <p>И, Е, Ё, Ю, Я va Ь belgilaridan oldingi undoshlar doimo yumshatib aytiladi.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Spoken History */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center justify-between">
              <span>Bugungi urinishlar</span>
              <span className="text-xs text-slate-400 font-normal">{practicedHistory.length} ta mashq</span>
            </h3>

            <div className="space-y-2">
              {practicedHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      "{item.text}"
                    </p>
                    <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-lg font-bold text-xs shrink-0 ${
                    item.score >= 90
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : item.score >= 70
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {item.score}%
                  </span>
                </div>
              ))}

              {practicedHistory.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs italic space-y-1">
                  <Mic className="w-5 h-5 mx-auto text-slate-300" />
                  <p>Hozircha talaffuz yozuvlari yo'q</p>
                  <p className="text-[11px]">Mikrofonni bosib birinchi so'zni ayting</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
