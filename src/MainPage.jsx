/* global Kakao */
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import './MainPage.css';

/* ──────────────────────────────────────────
   모듈 레벨 스크롤 방향 추적 (React 상태 배치 지연 없음)
────────────────────────────────────────── */
let _scrollDir = 'down';
let _prevY = 0;
if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        _scrollDir = y > _prevY ? 'down' : 'up';
        _prevY = y;
    }, { passive: true });
}

/* ──────────────────────────────────────────
   섹션 공통 애니메이션 래퍼
────────────────────────────────────────── */
const FadeInSection = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const controls = useAnimation();
    const inView = useInView(ref, { once: false, amount: 0.2 });

    useEffect(() => {
        if (inView) {
            // 뷰포트 진입: 현재 방향 기준으로 시작 위치 설정 후 애니메이션
            const startY = _scrollDir === 'down' ? 40 : -40;
            controls.set({ opacity: 0, y: startY });
            controls.start({ opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut', delay } });
        } else {
            // 뷰포트 이탈: 스크롤 방향 반대로 fade out
            const exitY = _scrollDir === 'down' ? -40 : 40;
            controls.start({ opacity: 0, y: exitY, transition: { duration: 0.4, ease: 'easeIn' } });
        }
    }, [inView, controls, delay]);

    return (
        <motion.div ref={ref} animate={controls} initial={{ opacity: 0, y: 40 }}>
            {children}
        </motion.div>
    );
};

/* ──────────────────────────────────────────
   5월 달력 컴포넌트
────────────────────────────────────────── */
const MayCalendar = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    // 2026년 5월 1일은 금요일(index 5)
    const startDay = 5;
    const totalDays = 16;
    const weddingDay = 9;

    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(d);

    return (
        <div className="calendar">
            <div className="invite-title">
                <span>5월</span>
            </div>
            <div className="calendar-grid">
                {days.map((d) => (
                    <div key={d} className="calendar-day-name">{d}</div>
                ))}
                {cells.map((cell, i) => (
                    <div
                        key={i}
                        className={`calendar-cell${cell === weddingDay ? ' wedding-day' : ''}${(i % 7 === 0 && cell) ? ' sunday' : ''
                            }${(i % 7 === 6 && cell) ? ' saturday' : ''}`}
                    >
                        {cell === weddingDay
                            ? <span className="wedding-day-number">{cell}</span>
                            : (cell || '')
                        }
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────
   전화번호 입력 모달
────────────────────────────────────────── */
const PhoneModal = ({ name, onClose }) => {
    const [phone, setPhone] = useState('');
    const handleCall = () => {
        if (phone) window.location.href = `tel:${phone}`;
    };
    return (
        <div className="phone-modal-overlay" onClick={onClose}>
            <div className="phone-modal" onClick={(e) => e.stopPropagation()}>
                <p className="phone-modal-title">{name}에게 연락하기</p>
                <input
                    className="phone-input"
                    type="tel"
                    placeholder="전화번호를 입력하세요"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoFocus
                />
                <div className="phone-modal-buttons">
                    <button className="btn-call" onClick={handleCall}>📞 전화하기</button>
                    <button className="btn-cancel" onClick={onClose}>취소</button>
                </div>
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────
   갤러리 컴포넌트
────────────────────────────────────────── */
const Gallery = () => {
    const [activeIdx, setActiveIdx] = useState(null);
    const [loadedFull, setLoadedFull] = useState({});
    const [showMore, setShowMore] = useState(false);

    const INITIAL_COUNT = 9;
    const TOTAL_COUNT = 15;

    const thumbs = Array.from({ length: TOTAL_COUNT }, (_, i) =>
        `${process.env.PUBLIC_URL}/thumbnails/Sub_Gallery_${String(i + 1).padStart(2, '0')}.jpg`
    );
    const originals = Array.from({ length: TOTAL_COUNT }, (_, i) =>
        `${process.env.PUBLIC_URL}/Sub_Gallery_${String(i + 1).padStart(2, '0')}.jpg`
    );

    const open = (i) => {
        setActiveIdx(i);
        // 원본 이미지 미리 로드 시작
        if (!loadedFull[i]) {
            const img = new Image();
            img.src = originals[i];
            img.onload = () => setLoadedFull((prev) => ({ ...prev, [i]: true }));
        }
    };
    const close = () => setActiveIdx(null);
    const prevImg = (e) => { e?.stopPropagation(); open((activeIdx + originals.length - 1) % originals.length); };
    const nextImg = (e) => { e?.stopPropagation(); open((activeIdx + 1) % originals.length); };

    // 라이트박스 열릴 때 배경 스크롤 잠금
    useEffect(() => {
        if (activeIdx !== null) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [activeIdx]);

    const extraThumbs = thumbs.slice(INITIAL_COUNT);

    return (
        <div className="gallery-section">
            <div className="gallery-grid">
                {thumbs.slice(0, INITIAL_COUNT).map((src, i) => (
                    <div key={i} className="gallery-item" onClick={() => open(i)}>
                        <img src={src} alt={`갤러리 ${i + 1}`} loading="lazy" />
                    </div>
                ))}
                {showMore && extraThumbs.map((src, j) => {
                    /* 행 기준 stagger: 3열 그리드이므로 j/3 으로 행 번호 계산 */
                    const rowDelay = Math.floor(j / 3) * 0.4;
                    return (
                        <motion.div
                            key={INITIAL_COUNT + j}
                            className="gallery-item"
                            onClick={() => open(INITIAL_COUNT + j)}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: rowDelay }}
                        >
                            <img src={src} alt={`갤러리 ${INITIAL_COUNT + j + 1}`} loading="lazy" />
                        </motion.div>
                    );
                })}
            </div>

            {!showMore && (
                <button className="gallery-more-btn" onClick={( ) => setShowMore(true)}>
                    더보기
                </button>
            )}

{createPortal(
                <AnimatePresence>
                    {activeIdx !== null && (
                        <motion.div
                            className="lightbox-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={close}
                        >
                            <motion.img
                                key={activeIdx}
                                className="lightbox-img"
                                src={loadedFull[activeIdx] ? originals[activeIdx] : thumbs[activeIdx]}
                                alt={`갤러리 ${activeIdx + 1}`}
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.85, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={(e, info) => {
                                    e.stopPropagation();
                                    if (Math.abs(info.offset.x) > 50) {
                                        info.offset.x < 0 ? nextImg() : prevImg();
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                                style={{ touchAction: 'pan-y' }}
                            />
                            {!loadedFull[activeIdx] && (
                                <div className="lightbox-loading">불러오는 중...</div>
                            )}
                            <button className="lightbox-btn lightbox-btn--prev" onClick={prevImg}>&#8249;</button>
                            <button className="lightbox-btn lightbox-btn--next" onClick={nextImg}>&#8250;</button>
                            <button className="lightbox-btn lightbox-btn--close" onClick={close}>&#10005;</button>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};

/* ──────────────────────────────────────────
   마음 전하실 곳 — 펼치기 패널
────────────────────────────────────────── */
const AccountPanel = ({ side, accounts }) => {
    const [open, setOpen] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (acc, i) => {
        const text = `${acc.bank} ${acc.number}`;
        const onSuccess = () => {
            setCopiedIndex(i);
            setTimeout(() => setCopiedIndex(null), 1000);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(onSuccess).catch(() => fallbackCopyAccount(text, onSuccess));
        } else {
            fallbackCopyAccount(text, onSuccess);
        }
    };

    const fallbackCopyAccount = (text, onSuccess) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            onSuccess();
        } catch (e) {
            alert(`복사 실패. 직접 입력해주세요:\n${text}`);
        } finally {
            document.body.removeChild(textarea);
        }
    };

    return (
        <div className="account-panel">
            <button
                className={`account-toggle account-toggle--${side === '신랑측' ? 'groom' : 'bride'}`}
                onClick={() => setOpen((v) => !v)}
            >
                {side} &nbsp;<span>{open ? '▲' : '▼'}</span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        className="account-content"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        {accounts.map((acc, i) => (
                            <div key={i} className="account-item">
                                <div className="account-row">
                                    <div className="account-row-inner">
                                        <div className="account-label">{acc.label}</div>
                                        <div className="account-row-detail">
                                            <span className="account-bank">{acc.bank}</span>
                                            <span className="account-number">{acc.number}</span>
                                            <span className="account-name">{acc.name}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="copy-btn"
                                        onClick={() => handleCopy(acc, i)}
                                    >
                                        {copiedIndex === i ? '✓ 복사됨' : '복사'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ──────────────────────────────────────────
   네이버 지도 API 컴포넌트
────────────────────────────────────────── */
const NaverMap = () => {
    const mapRef = useRef(null);

    useEffect(() => {
        const initMap = () => {
            if (!window.naver || !window.naver.maps || !mapRef.current) return;

            const location = new window.naver.maps.LatLng(37.3995, 127.1085);
            const map = new window.naver.maps.Map(mapRef.current, {
                center: location,
                zoom: 16,
            });

            new window.naver.maps.Marker({
                position: location,
                map,
            });
        };

        // 이미 로드된 경우 바로 실행, 아직 로드 중이면 이벤트 대기
        if (window.naver && window.naver.maps) {
            initMap();
        } else {
            window.addEventListener('load', initMap);
            return () => window.removeEventListener('load', initMap);
        }
    }, []);

    return (
        <div className="map-wrapper">
            <div ref={mapRef} className="naver-map-iframe" />
        </div>
    );
};

/* ──────────────────────────────────────────
   하트 이펙트 컴포넌트
────────────────────────────────────────── */
const HeartEffect = () => {
    const [hearts, setHearts] = useState([]);
    const lastTimeRef = useRef(0);

    const spawnHeart = (x, y) => {
        const now = Date.now();
        if (now - lastTimeRef.current < 150) return;
        lastTimeRef.current = now;

        const id = now + Math.random();
        const offsetX = (Math.random() - 0.5) * 20;
        const size = 18 + Math.random() * 14;
        setHearts(prev => [...prev, { id, x: x + offsetX, y, size }]);
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== id));
        }, 1200);
    };

    useEffect(() => {
        const handleClick = (e) => spawnHeart(e.clientX, e.clientY);

        let lastTouchY = 0;
        const handleTouchStart = (e) => {
            lastTouchY = e.touches[0].clientY;
        };
        const handleTouchMove = (e) => {
            const touch = e.touches[0];
            const dy = Math.abs(lastTouchY - touch.clientY);
            if (dy > 5) spawnHeart(touch.clientX, touch.clientY);
            lastTouchY = touch.clientY;
        };

        window.addEventListener('click', handleClick);
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        return () => {
            window.removeEventListener('click', handleClick);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, []);

    return createPortal(
        <div className="heart-fx-container">
            {hearts.map(h => (
                <span
                    key={h.id}
                    className="heart-fx-particle"
                    style={{ left: h.x, top: h.y, fontSize: h.size }}
                >
                    ♥
                </span>
            ))}
        </div>,
        document.body
    );
};

/* ──────────────────────────────────────────
   참석 여부 모달
────────────────────────────────────────── */
const RSVPModal = ({ onClose, onSubmit }) => {
    const [side, setSide] = useState('신랑측');
    const [name, setName] = useState('');
    const [count, setCount] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = () => {
        if (!name.trim()) return;
        setSubmitted(true);
        setTimeout(() => {
            onSubmit();
        }, 1800);
    };

    return (
        <div className="rsvp-overlay" onClick={submitted ? undefined : onClose}>
            <div className="rsvp-modal" onClick={(e) => e.stopPropagation()}>
                {submitted ? (
                    <div className="rsvp-success">
                        <div className="rsvp-success-icon">✓</div>
                        <p className="rsvp-success-msg">등록이 완료되었습니다.</p>
                    </div>
                ) : (
                    <>
                        <button className="rsvp-close-btn" onClick={onClose}>✕</button>
                        <h3 className="rsvp-modal-title">참석 여부 전달</h3>

                        <div className="rsvp-side-group">
                            <button
                                className={`rsvp-side-btn${side === '신랑측' ? ' active' : ''}`}
                                onClick={() => setSide('신랑측')}
                            >신랑측</button>
                            <button
                                className={`rsvp-side-btn${side === '신부측' ? ' active' : ''}`}
                                onClick={() => setSide('신부측')}
                            >신부측</button>
                        </div>

                        <div className="rsvp-field">
                            <label className="rsvp-label">성함</label>
                            <input
                                className="rsvp-input"
                                type="text"
                                placeholder="성함을 입력해주세요"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="rsvp-field">
                            <label className="rsvp-label">본인 포함 총</label>
                            <div className="rsvp-count-row">
                                <input
                                    className="rsvp-input rsvp-input--count"
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    value={count}
                                    onChange={(e) => setCount(e.target.value)}
                                />
                                <span className="rsvp-count-unit">명</span>
                            </div>
                        </div>

                        <button
                            className="rsvp-submit-btn"
                            onClick={handleSubmit}
                            disabled={!name.trim()}
                        >참석여부 등록하기</button>
                    </>
                )}
            </div>
        </div>
    );
};

/* ──────────────────────────────────────────
   메인 페이지
────────────────────────────────────────── */
const MainPage = () => {
    const [copiedTarget, setCopiedTarget] = useState(null);
    const copiedTimerRef = useRef(null);

    const copyPhone = (name, phone) => {
        const onSuccess = () => {
            setCopiedTarget(name);
            if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
            copiedTimerRef.current = setTimeout(() => setCopiedTarget(null), 1000);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            // HTTPS / 최신 브라우저
            navigator.clipboard.writeText(phone).then(onSuccess).catch(() => fallbackCopy(phone, onSuccess));
        } else {
            // HTTP 환경 또는 구형 모바일 브라우저 폴백
            fallbackCopy(phone, onSuccess);
        }
    };

    const fallbackCopy = (text, onSuccess) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            onSuccess();
        } catch (e) {
            alert(`복사 실패. 번호를 직접 입력해주세요:\n${text}`);
        } finally {
            document.body.removeChild(textarea);
        }
    };

    const [isPlaying, setIsPlaying] = useState(false);
    const [showMusicBtn, setShowMusicBtn] = useState(false);
    const [showRsvp, setShowRsvp] = useState(false);
    const audioRef = useRef(null);

    // RSVP 모달 열릴 때 배경 스크롤 잠금
    useEffect(() => {
        if (showRsvp) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showRsvp]);

    // 오디오 객체 초기화
    useEffect(() => {
        const audio = new Audio(`${process.env.PUBLIC_URL}/music/blue_short.mp3`);
        audio.loop = true;
        audio.volume = 0.5;
        audioRef.current = audio;
        return () => { audio.pause(); audio.src = ''; };
    }, []);

    const toggleMusic = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => setIsPlaying(true)).catch(() => { });
        }
    };

    const greetingRef = useRef(null);

    // 카카오 공유 버튼 이벤트 등록
    useEffect(() => {
        const btn = document.getElementById('kakao-share-btn');
        if (!btn) return;
        const handleKakaoShare = () => {
            const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (!isMobile) {
                alert('모바일 버전만 지원됩니다.');
                return;
            }
            Kakao.Share.sendDefault({
                objectType: 'feed',
                content: {
                    title: '박상인 ♥ 남승현 결혼합니다.',
                    description: '2026.05.09 토요일 오후 4시\n엔씨소프트 R&D센터',
                    imageUrl: `${window.location.origin}${process.env.PUBLIC_URL}/thumbnails/Sub_Gallery_04.jpg`,
                    link: {
                        mobileWebUrl: "https://wedding.sangin-seunghyun.com",
                        webUrl: "https://wedding.sangin-seunghyun.com",
                    },
                },
                buttons: [
                    {
                        title: '청첩장 보기',
                        link: {
                            mobileWebUrl: "https://wedding.sangin-seunghyun.com",
                            webUrl: "https://wedding.sangin-seunghyun.com",
                        },
                    },
                ],
            });
        };
        btn.addEventListener('click', handleKakaoShare);
        return () => btn.removeEventListener('click', handleKakaoShare);
    }, []);

    const heroControls = useAnimation();
    const imageControls = useAnimation();
    const heroTriggeredRef = useRef(false);
    const heroAnimatingRef = useRef(false);
    const touchStartYRef = useRef(0);
    const heroImgRef = useRef(null);

    // 이미지 로드 완료 시 이미지만 fade-in
    useEffect(() => {
        const img = heroImgRef.current;
        if (!img) return;
        const triggerFadeIn = () => {
            imageControls.start({ opacity: 1, transition: { duration: 2.4, ease: 'easeOut' } });
        };
        if (img.complete) {
            triggerFadeIn();
        } else {
            img.addEventListener('load', triggerFadeIn);
            return () => img.removeEventListener('load', triggerFadeIn);
        }
    }, [imageControls]);
    useEffect(() => {
        document.body.style.overflow = 'hidden';

        const triggerHeroOut = () => {
            if (heroTriggeredRef.current || heroAnimatingRef.current) return;
            heroAnimatingRef.current = true;
            heroTriggeredRef.current = true;
            setShowMusicBtn(true);
            // 히어로 fade-out 시 음악 재생
            if (audioRef.current && audioRef.current.paused) {
                audioRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
            }
            heroControls
                .start({ opacity: 0, y: -100, transition: { duration: 0.6, ease: 'easeInOut' } })
                .then(() => {
                    heroAnimatingRef.current = false;
                    document.body.style.overflow = '';
                });
        };

        const triggerHeroIn = () => {
            if (!heroTriggeredRef.current || heroAnimatingRef.current) return;
            heroAnimatingRef.current = true;
            heroTriggeredRef.current = false;
            setShowMusicBtn(false);
            document.body.style.overflow = 'hidden';
            heroControls.set({ opacity: 0, y: -100 });
            heroControls
                .start({ opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeInOut' } })
                .then(() => { heroAnimatingRef.current = false; });
        };

        const handleWheel = (e) => {
            if (!heroTriggeredRef.current && e.deltaY > 0) triggerHeroOut();
            if (heroTriggeredRef.current && e.deltaY < 0 && window.scrollY === 0) triggerHeroIn();
        };

        const handleScroll = () => {
            if (heroTriggeredRef.current && window.scrollY === 0) triggerHeroIn();
        };

        const handleTouchStart = (e) => {
            touchStartYRef.current = e.touches[0].clientY;
        };
        const handleTouchMove = (e) => {
            const dy = touchStartYRef.current - e.touches[0].clientY;
            if (!heroTriggeredRef.current && dy > 5) triggerHeroOut();
            if (heroTriggeredRef.current && dy < -5 && window.scrollY === 0) triggerHeroIn();
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [heroControls]);

    const groomAccounts = [
        { label: '신랑', bank: '우리은행', number: '1002-853-166542', name: '박상인' },
        { label: '신랑 어머니', bank: '기업은행', number: '477-025352-01-016', name: '한미숙' },
        { label: '신랑 아버지', bank: '기업은행', number: '596-004600-01-015', name: '박은홍' },
    ];
    const brideAccounts = [
        { label: '신부', bank: '국민은행', number: '59730-10-4103507', name: '남승현' },
        { label: '신부 어머니', bank: '신한은행', number: '110-207-375477', name: '김현영' },
    ];

    return (
        <div className="main-page">
            <HeartEffect />

            {/* 음악 토글 스위치 — 히어로 이후 우측 하단 고정 */}
            {showMusicBtn && (
                <div className="music-fab">
                    <button
                        className={`music-toggle-switch${isPlaying ? ' on' : ''}`}
                        onClick={toggleMusic}
                        title={isPlaying ? '음악 끄기' : '음악 켜기'}
                    >
                        <span className="music-toggle-label-inner">{isPlaying ? 'ON' : 'OFF'}</span>
                        <span className="music-toggle-thumb">♪</span>
                    </button>
                </div>
            )}

            {/* ① 히어로 — fixed 오버레이, 10px 스크롤 후 자동 위로 fade-out */}
            <motion.section
                className="hero-section"
                initial={{ opacity: 1, y: 0 }}
                animate={heroControls}
            >
                <motion.img
                    ref={heroImgRef}
                    className="hero-image"
                    src={`${process.env.PUBLIC_URL}/Main_Gallery.jpg`}
                    alt="메인 웨딩 사진"
                    initial={{ opacity: 0 }}
                    animate={imageControls}
                />
                <div className="scroll-hint">↓ 스크롤</div>
            </motion.section>

            {/* 히어로 아래 콘텐츠 — 히어로와 독립적, 페이지 맨 위부터 시작 */}
            <div className="content-over-hero">
                {/* ②-1 인사사진 섹션 — 콘텐츠 최상단 */}
                <section ref={greetingRef} className="mp-section mp-section-greeting">
                    <FadeInSection>
                        <div className="greeting-zone">
                            <div className="invite-main-title-wrap">
                                <p className="invite-main-title">we are getting married</p>
                            </div>
                            <div className="greeting-message-box">
                                <p className="greeting-message">
                                    함께 더 오래 그리고 멀리 가고자 하는<br />
                                    그 첫 길에 함께하여 축복해주시면 감사하겠습니다
                                </p>
                            </div>
                        </div>
                        <div className="greeting-zone">
                            <div className="greeting-photo-wrap">
                                <img
                                    src={`${process.env.PUBLIC_URL}/Main/SubImage.jpg`}
                                    alt="커플 사진"
                                    className="greeting-photo"
                                />
                            </div>
                        </div>
                        <div className="greeting-zone greeting-zone--3">
                            <div className="family-list">
                                <div className="family-row">
                                    <span className="family-desc">박은홍 · 한미숙의 장남</span>
                                    <span className="family-name">박상인</span>
                                </div>
                                <div className="family-row">
                                    <span className="family-desc">남성우 · 김현영의 장녀</span>
                                    <span className="family-name">남승현</span>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </section>

                {/* ④ 예식 안내 */}
                <div className="section-divider--tall" />
                <section className="mp-section mp-section--ceremony">
                    <FadeInSection>
                        <div className="invite-title">예식 안내</div>
                        <p className="ceremony-date">2026년 5월 9일 토요일 오후 4시</p>
                        <p className="ceremony-venue">엔씨소프트 R&D센터</p>
                    </FadeInSection>
                </section>
                <div className="section-divider--tall" />

                {/* ⑤ 갤러리 */}
                <section className="mp-section">
                    <FadeInSection>
                        <div className="invite-title">갤러리</div>
                        <br />
                    </FadeInSection>
                    <FadeInSection delay={0.1}>
                        <Gallery />
                    </FadeInSection>
                </section>

                <section className="mp-section">
                    <FadeInSection delay={0.15}>
                        <MayCalendar />
                    </FadeInSection>
                </section>

                {/* ⑥ 오시는 길 */}
                <section className="mp-section">
                    <FadeInSection>
                        <div className="invite-title">오시는 길</div>
                        <p
                            className="venue-address"
                            onClick={() => {
                                const addr = '경기 성남시 분당구 삼평동 668번지 엔씨소프트 R&D센터';
                                const onSuccess = () => {
                                    setCopiedTarget('address');
                                    setTimeout(() => setCopiedTarget(null), 1500);
                                };
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                    navigator.clipboard.writeText(addr).then(onSuccess).catch(() => fallbackCopy(addr, onSuccess));
                                } else {
                                    fallbackCopy(addr, onSuccess);
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >경기 성남시 분당구 삼평동 668번지 엔씨소프트 R&D센터</p>
                        <NaverMap />

                        {/* 교통 안내 */}
                        <div className="transport-guide">
                            <div className="transport-item">
                                <div className="transport-header">
                                    <img src={`${process.env.PUBLIC_URL}/icon/subway_icon.svg`} alt="지하철" className="transport-icon" />
                                    <span className="transport-title">지하철</span>
                                </div>
                                <div className="transport-content">
                                    <p>신분당선 <strong>판교역</strong> 1번 출구 또는 4번 출구호 나온 후, 도보 10분</p>
                                </div>
                            </div>

                            <div className="transport-divider" />

                            <div className="transport-item">
                                <div className="transport-header">
                                    <img src={`${process.env.PUBLIC_URL}/icon/bus_icon.svg`} alt="버스" className="transport-icon" />
                                    <span className="transport-title">버스</span>
                                </div>
                                <div className="transport-content">
                                    <p><strong>엔씨소프트, 안랩</strong> 정류장 하차: 309, 9007</p>
                                </div>
                                <div className="transport-content">
                                    <p><strong>금토천교</strong> 정류장 하차: 1007, 5600, 5700, 6800, 6900</p>
                                </div>
                            </div>

                            <div className="transport-divider" />

                            <div className="transport-item">
                                <div className="transport-header">
                                    <img src={`${process.env.PUBLIC_URL}/icon/car_icon.svg`} alt="자가용" className="transport-icon" />
                                    <span className="transport-title">자가용</span>
                                </div>
                                <div className="transport-content">
                                    <p>네비게이션 <strong>엔씨소프트</strong> 검색. (건물 내 지하 주차장 무료 이용) </p>
                                    <p>경기 성남시 분당구 삼평동 668</p>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </section>

                <br />

                {/* ⑦ 마음 전하실 곳 */}
                <section className="mp-section">
                    <FadeInSection>
                        <div className="invite-title">마음 전하실 곳</div>
                        <p className="account-desc">
                            멀리서도 축하의 마음을<br />
                            전하고 싶으실 분들을 위해<br />
                            계좌번호를 안내드립니다.<br />
                            <br />
                            소중한 축하를 보내주셔서 감사드리며,<br />
                            따뜻한 마음에 깊이 감사드립니다.
                        </p>
                        <AccountPanel side="신랑측" accounts={groomAccounts} />
                        <AccountPanel side="신부측" accounts={brideAccounts} />
                    </FadeInSection>
                </section>

                {/* ⑧ 참석 여부 */}
                <section className="mp-section">
                    <FadeInSection>
                        <div className="invite-title">참석 여부</div>
                        <p className="rsvp-desc">결혼식 참석 여부를 체크해주세요</p>
                        <button className="rsvp-open-btn" onClick={() => setShowRsvp(true)}>
                            참석 여부 체크하기
                        </button>
                    </FadeInSection>
                </section>

                {/* ⑨ 공유 */}
                <section className="mp-section">
                    <FadeInSection>
                        <div className="invite-title">공유하기</div>
                        <div className="share-icon-group">
                            <button id="kakao-share-btn" className="share-icon-btn">
                                <div className="share-icon-img">
                                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="24" cy="24" r="24" fill="#FEE500"/>
                                        <path d="M24 12c-7.18 0-13 4.48-13 10.01 0 3.57 2.3 6.7 5.77 8.53l-1.47 5.44 6.34-4.18c.76.1 1.54.16 2.36.16 7.18 0 13-4.48 13-10.01S31.18 12 24 12z" fill="#3C1E1E"/>
                                    </svg>
                                </div>
                                <span className="share-icon-label">카카오톡</span>
                            </button>

                            <button
                                className="share-icon-btn"
                                onClick={() => {
                                    const url = window.location.href;
                                    if (navigator.clipboard && navigator.clipboard.writeText) {
                                        navigator.clipboard.writeText(url).then(() => {
                                            setCopiedTarget('url');
                                            setTimeout(() => setCopiedTarget(null), 1500);
                                        }).catch(() => {
                                            fallbackCopy(url, () => {
                                                setCopiedTarget('url');
                                                setTimeout(() => setCopiedTarget(null), 1500);
                                            });
                                        });
                                    } else {
                                        fallbackCopy(url, () => {
                                            setCopiedTarget('url');
                                            setTimeout(() => setCopiedTarget(null), 1500);
                                        });
                                    }
                                }}
                            >
                                <div className="share-icon-img share-icon-img--link">
                                    <img src={`${process.env.PUBLIC_URL}/icon/link_icon.svg`} alt="링크복사" style={{ width: '50%', height: '50%' }} />
                                </div>
                                <span className="share-icon-label">
                                    {copiedTarget === 'url' ? '✓ 복사됨' : '링크복사'}
                                </span>
                            </button>
                        </div>
                    </FadeInSection>
                </section>

                {/* 토스트 */}
                {copiedTarget && (
                    <div className="copy-toast">
                        {copiedTarget === 'rsvp' ? '등록되었습니다' : '복사됨'}
                    </div>
                )}

                {/* 참석 여부 모달 */}
                {showRsvp && (
                    <RSVPModal
                        onClose={() => setShowRsvp(false)}
                        onSubmit={() => {
                            setShowRsvp(false);
                            setCopiedTarget('rsvp');
                            if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
                            copiedTimerRef.current = setTimeout(() => setCopiedTarget(null), 2000);
                        }}
                    />
                )}

                {/* Footer */}
                <footer className="main-footer">
                    <div className="footer-logo">✦ Sangin &amp; Seunghyun ✦</div>
                    <p className="footer-copy">
                        COPYRIGHT Sangini & Seunghyuni. All rights reserved.
                    </p>
                </footer>
            </div>{/* /content-over-hero */}
        </div>
    );
};

export default MainPage;
