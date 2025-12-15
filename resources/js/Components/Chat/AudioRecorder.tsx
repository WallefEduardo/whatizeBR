import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Trash2, Send } from 'lucide-react'

interface AudioRecorderProps {
    onAudioRecorded: (audioBlob: Blob) => void
    onCancel: () => void
}

export default function AudioRecorder({ onAudioRecorded, onCancel }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop()
            }
        }
    }, [])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                stream.getTracks().forEach((track) => track.stop())
            }

            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1)
            }, 1000)
        } catch (error) {
            console.error('Error accessing microphone:', error)
            alert('Não foi possível acessar o microfone. Verifique as permissões.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }

    const handleSend = () => {
        if (audioBlob) {
            onAudioRecorded(audioBlob)
        }
    }

    const handleCancel = () => {
        if (isRecording) {
            stopRecording()
        }
        setAudioBlob(null)
        setRecordingTime(0)
        onCancel()
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Auto-start recording when component mounts
    useEffect(() => {
        startRecording()
    }, [])

    return (
        <div className="flex items-center gap-3 px-4 py-3 bg-dark-50 dark:bg-dark-900 rounded-lg">
            {/* Recording indicator */}
            <div className="flex items-center gap-2">
                {isRecording && (
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                )}
                <Mic className={`w-5 h-5 ${isRecording ? 'text-red-500' : 'text-dark-500'}`} />
            </div>

            {/* Timer */}
            <div className="flex-1">
                <p className="text-sm font-medium text-dark-900 dark:text-dark-50">
                    {isRecording ? 'Gravando...' : 'Gravação finalizada'}
                </p>
                <p className="text-xs text-dark-500">{formatTime(recordingTime)}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
                {isRecording ? (
                    <button
                        onClick={stopRecording}
                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                        title="Parar gravação"
                    >
                        <Square className="w-4 h-4 text-white fill-white" />
                    </button>
                ) : audioBlob ? (
                    <>
                        <button
                            onClick={handleCancel}
                            className="p-2 rounded-full hover:bg-dark-200 dark:hover:bg-dark-700 transition-colors"
                            title="Cancelar"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <button
                            onClick={handleSend}
                            className="p-2 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors"
                            title="Enviar"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </button>
                    </>
                ) : null}
            </div>
        </div>
    )
}
