import React, { useRef, useState } from 'react';

const useRecorder = () => {

    const [isRecording, setIsRecording]=useState(false);
    const [recordingTime, setRecordingTime]=useState(0);
    const [audioBlob, setAudioBlob]=useState(null);
    const [audioUrl, setAudioUrl]=useState(null);
    const [audioData, setAudioData]=useState(new Uint8Array(0)); // 파형 데이터

    const mediaRecordRef=useRef(null);
    const chunksRef=useRef([]);
    const timerRef=useRef(null);
    const streamRef=useRef(null);
    const audioContextRef=useRef(null);
    const analyserRef=useRef(null);
    const animationRef=useRef(null);

    const startRecording=async()=>{
        try {
            // 기존 타이머 먼저 제거
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            const stream=await navigator.mediaDevices.getUserMedia({audio: true});
            streamRef.current=stream;

            // AudioContext 생성(파형 분석)
            audioContextRef.current=new(window.AudioContext || window.webkitAudioContext)();
            analyserRef.current=audioContextRef.current.createAnalyser();
            const source=audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize=2048;

            mediaRecordRef.current=new MediaRecorder(stream, {
                mimeType: 'audio/webm',
            });
            chunksRef.current=[];

            mediaRecordRef.current.ondataavailable=(e)=>{
                if(e.data.size>0){
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecordRef.current.onstop=()=>{
                const blob=new Blob(chunksRef.current, {type: 'audio/webm'});
                const url=URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);

                if (streamRef.current){
                    streamRef.current.getTracks().forEach((track) => track.stop());
                }

                // AudioContext 정리
                if (audioContextRef.current){
                    audioContextRef.current.close();
                }
                if (animationRef.current){
                    cancelAnimationFrame(animationRef.current);
                }
            };

            mediaRecordRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);


            // 타이머 시작
            timerRef.current=setInterval(()=>{
                setRecordingTime((prev)=>{
                    return prev+1;
                });
            }, 1000);

            // 파형 데이터 업데이트 시작
            updateAudioData();
        } catch (error){
            console.error('Recording error:', error);
            alert('마이크 접근 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
        }
    };

    // 실시간 파형 데이터 업데이트
    const updateAudioData=()=>{
        if(!analyserRef.current){
            return;
        }

        const bufferLength=analyserRef.current.frequencyBinCount;
        const dataArray=new Uint8Array(bufferLength);
        let lastUpdate=0;

        const draw=(timestamp)=>{
            if(!analyserRef.current) return;

            analyserRef.current.getByteTimeDomainData(dataArray);

            if (timestamp - lastUpdate >= 150) {
                setAudioData(new Uint8Array(dataArray));
                lastUpdate = timestamp;
            }

            animationRef.current=requestAnimationFrame(draw);
        };

        animationRef.current=requestAnimationFrame(draw);
    };

    const stopRecording=()=>{
        if (mediaRecordRef.current&&isRecording){
            mediaRecordRef.current.stop();
            setIsRecording(false);

            if (timerRef.current){
                clearInterval(timerRef.current);
                timerRef.current=null;
            }

            if (animationRef.current){
                cancelAnimationFrame(animationRef.current);
                animationRef.current=null;
            }
        }
    };

    const resetRecording=()=>{
        if (audioUrl){
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setAudioData(new Uint8Array(0)); // 파형 데이터 초기화
        chunksRef.current=[];
    };

    const formatTime=(seconds)=>{
        const mins=Math.floor(seconds/60);
        const secs=seconds%60;
        return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
    };


    return {
        isRecording,
        recordingTime,
        audioBlob,
        audioUrl,
        audioData,
        startRecording,
        stopRecording,
        resetRecording,
        formatTime,
    };
};

export default useRecorder;