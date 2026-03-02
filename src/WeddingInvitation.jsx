import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './WeddingInvitation.css';
import ribbonVideo from './RibbonUnwrap.webm'; // 투명 배경 WebM
import MainPage from './MainPage';

const WeddingInvitation = () => {
  // 상태 관리
  const [isLetterOpen, setIsLetterOpen] = useState(true); // 영상 스킵: 바로 MainPage로
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  
  // 비디오 참조
  const videoRef = useRef(null);
  
  // 드래그 관련 참조
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const isAutoPlayingRef = useRef(false);
  
  // 비디오 드래그 제어
  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    // 비디오 로드 완료 후 첫 프레임에 멈춤
    const setupVideo = () => {
      video.currentTime = 0;
    };
    
    // 드래그 이벤트 핸들러
    const handleDragStart = (y) => {
      if (isAutoPlayingRef.current) return;
      isDraggingRef.current = true;
      dragStartYRef.current = y;
    };
    
    const handleDragMove = (y) => {
      if (!isDraggingRef.current || isAutoPlayingRef.current) return;
      
      // 드래그 거리 계산 (아래로 드래그: 양수)
      const distance = Math.max(0, y - dragStartYRef.current);
      
      // 드래그 거리를 비디오 시간으로 매핑
      // 최대 300px 드래그 = 비디오 50% 지점
      const maxDragDistance = 200;
      const videoDuration = video.duration;
      const triggerPoint = videoDuration * 0.3; // 50% 지점이 트리거
      
      const progress = Math.min(distance / maxDragDistance, 1);
      video.currentTime = progress * triggerPoint;
      
      // 50% 이상 드래그하면 자동 재생 트리거
      if (progress >= 1) {
        isAutoPlayingRef.current = true; // ref를 먼저 설정 (즉시 반영)
        setIsAutoPlaying(true);
        isDraggingRef.current = false;
        video.play(); // 현재 위치(50%)부터 재생
      }
    };
    
    const handleDragEnd = () => {
      if (isAutoPlayingRef.current) return; // ref 체크로 즉시 반영
      isDraggingRef.current = false;
      
      // 충분히 드래그하지 않았으면 비디오를 처음으로 되돌림
      const currentProgress = video.currentTime / (video.duration * 0.3);
      if (currentProgress < 1) {
        video.currentTime = 0;
      }
    };
    
    // 마우스 이벤트 (비디오 요소에 직접 연결)
    const handleMouseDown = (e) => {
      handleDragStart(e.clientY);
    };
    
    const handleMouseMove = (e) => {
      handleDragMove(e.clientY);
    };
    
    const handleMouseUp = () => {
      handleDragEnd();
    };
    
    // 터치 이벤트
    const handleTouchStart = (e) => {
      handleDragStart(e.touches[0].clientY);
    };
    
    const handleTouchMove = (e) => {
      // 드래그 중일 때만 스크롤 방지 (MainPage 스크롤 보호)
      if (isDraggingRef.current) {
        e.preventDefault();
      }
      handleDragMove(e.touches[0].clientY);
    };
    
    const handleTouchEnd = (e) => {
      handleDragEnd();
    };
    
    // 비디오 종료 이벤트
    const handleVideoEnd = () => {
      setIsLetterOpen(true);
    };
    
    // 이벤트 리스너 등록
    video.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    video.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    video.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    video.addEventListener('ended', handleVideoEnd);
    
    // 비디오가 재생 가능할 때
    if (video.readyState >= 2) {
      setupVideo();
    } else {
      video.addEventListener('loadeddata', setupVideo);
    }
    
    return () => {
      video.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      video.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      video.removeEventListener('touchend', handleTouchEnd);
      
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, []); // dependency 제거 - isAutoPlaying state 변경 시 재실행 방지

  // 봉투 애니메이션이 끝나면 메인 페이지를 전체화면으로 전환
  if (isLetterOpen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', minHeight: '100vh' }}
      >
        <MainPage />
      </motion.div>
    );
  }

  return (
    <div className="invitation-container">
      {/* 편지 봉투 */}
      <motion.div
        className="letter-envelope"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 리본 풀리는 비디오 (투명 배경) */}
        <div className="video-wrapper">
          <video
            ref={videoRef}
            src={ribbonVideo}
            className="video-canvas"
            muted
            playsInline
          />

          {/* 드래그 힌트 텍스트 */}
          {!isAutoPlaying && (
            <motion.div
              className="drag-hint"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              아래로 드래그하여 리본을 풀어주세요
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default WeddingInvitation;
