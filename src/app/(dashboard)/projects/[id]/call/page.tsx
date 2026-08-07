'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ControlBar, LiveKitRoom, RoomAudioRenderer, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import Header from '@/components/layout/Header';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useProjectStore } from '@/features/projects/store/useProjectStore';

export default function ProjectCallPage() {
    const router = useRouter();
    const { id: projectId } = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth(true);
    const { projects, fetchProjects } = useProjectStore();

    const [token, setToken] = useState<string | null>(null);
    const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
    const [callError, setCallError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isCheckingConfig, setIsCheckingConfig] = useState(true);
    const [isConfigReady, setIsConfigReady] = useState(false);
    const [copied, setCopied] = useState(false);

    const room = searchParams.get('room') || (typeof projectId === 'string' ? `project-${projectId}` : 'project-room');
    const callType = searchParams.get('type') === 'audio' ? 'audio' : 'video';

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const project = projects.find((p) => p.id === projectId);
    const projectName = project?.name || 'Project Call';

    const joinLink = useMemo(() => {
        if (typeof window === 'undefined' || typeof projectId !== 'string') return '';
        return `${window.location.origin}/projects/${projectId}/call?room=${encodeURIComponent(room)}&type=${callType}`;
    }, [callType, projectId, room]);

    const handleCopy = async () => {
        if (!joinLink) return;
        await navigator.clipboard.writeText(joinLink);
        setCopied(true);
        toast.success('Meeting link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        let isMounted = true;
        const checkLiveKitConfig = async () => {
            setIsCheckingConfig(true);
            try {
                const response = await axios.get('/api/livekit/health');
                const ready = Boolean(response.data?.data?.ready);
                if (!isMounted) return;
                setIsConfigReady(ready);
                if (!ready) {
                    setCallError('LiveKit service is not configured properly.');
                }
            } catch (error: any) {
                if (!isMounted) return;
                setIsConfigReady(false);
                setCallError(error?.response?.data?.message || 'LiveKit server health check failed.');
            } finally {
                if (isMounted) setIsCheckingConfig(false);
            }
        };

        checkLiveKitConfig();
        return () => { isMounted = false; };
    }, []);

    const handleJoinCall = useCallback(async () => {
        if (!isConfigReady) {
            setCallError('LiveKit configuration is not ready. Please check server credentials.');
            return;
        }

        setCallError(null);
        setIsJoining(true);

        try {
            const response = await axios.post('/api/livekit/token', {
                room,
                identity: user?.id || user?.email || `user-${Date.now()}`,
                name: user?.name || 'Team Member',
            });

            if (!response.data?.data?.token) {
                throw new Error(response.data?.error || 'Failed to issue LiveKit room access token');
            }

            setToken(response.data.data.token);
            setLivekitUrl(response.data.data.url);
            setIsConnected(true);
        } catch (error: any) {
            setCallError(error?.response?.data?.error || error.message || 'Could not connect to call room.');
        } finally {
            setIsJoining(false);
        }
    }, [isConfigReady, room, user]);

    const handleLeaveCall = () => {
        setToken(null);
        setLivekitUrl(null);
        setIsConnected(false);
        toast('Left conference session', { icon: '👋' });
    };

    return (
        <div className="h-screen w-screen bg-[#F8FAFC] overflow-hidden flex flex-col text-[#1b1b24] relative">
            {/* Standard Single Header with Go Back Button */}
            <Header user={user} />

            {/* Meeting Sub-Header Toolbar */}
            <div className="h-14 px-6 bg-white border-b border-[#E2E8F0] flex items-center justify-between z-10 shrink-0 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[#10B981]/10 text-[#047857] px-2.5 py-1 rounded-full text-xs font-bold border border-[#10B981]/20">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                        LIVE CONFERENCE
                    </div>
                    <h1 className="text-sm font-bold text-[#1b1b24] truncate max-w-xs md:max-w-md">
                        {projectName}
                    </h1>
                    <span className="text-xs text-[#777587] font-mono hidden sm:inline-block">
                        ({room})
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f2ff] hover:bg-[#eae6f4] border border-[#e4e1ee] text-[#4f46e5] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">
                            {copied ? 'check' : 'content_copy'}
                        </span>
                        {copied ? 'Copied' : 'Share Link'}
                    </button>
                    <button
                        onClick={() => router.push(`/projects/${projectId}/chatroom`)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Back to Chat
                    </button>
                </div>
            </div>

            {/* Standalone Full-Width Video Canvas */}
            <div className="flex-1 overflow-hidden p-4 md:p-6 bg-[#F8FAFC] flex flex-col items-center justify-center">
                {!isConnected ? (
                    /* Pre-Join Card */
                    <div className="max-w-md w-full bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-level-1 text-center space-y-6 animate-in fade-in zoom-in duration-200">
                        <div className="w-20 h-20 rounded-full bg-[#4f46e5]/10 border border-[#4f46e5]/20 text-[#4f46e5] flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-4xl">
                                {callType === 'video' ? 'videocam' : 'mic'}
                            </span>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-[#1b1b24] mb-1">
                                Join {projectName} Meeting
                            </h2>
                            <p className="text-xs text-[#777587] leading-relaxed">
                                Click below to enter the live {callType === 'video' ? 'video' : 'voice'} call session with your team.
                            </p>
                        </div>

                        {callError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-medium">
                                {callError}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                onClick={handleJoinCall}
                                disabled={isJoining || isCheckingConfig}
                                className="w-full py-3 px-6 bg-[#4f46e5] hover:bg-[#4338CA] text-white font-bold rounded-2xl transition-all shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {isJoining ? (
                                    <>
                                        <span className="material-symbols-outlined text-base animate-spin">
                                            progress_activity
                                        </span>
                                        Connecting to LiveKit...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-base">
                                            meeting_room
                                        </span>
                                        Enter Meeting Room
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Active Fullscreen Meeting Stage */
                    <div className="w-full h-full bg-white rounded-3xl border border-[#E2E8F0] shadow-level-1 overflow-hidden flex flex-col relative">
                        {token && livekitUrl && (
                            <div className="flex-1 relative overflow-hidden" data-lk-theme="default">
                                <LiveKitRoom
                                    token={token}
                                    serverUrl={livekitUrl}
                                    connect
                                    video={callType === 'video'}
                                    audio
                                    onDisconnected={handleLeaveCall}
                                    onError={(err) => setCallError(err.message)}
                                    className="h-full w-full flex flex-col"
                                >
                                    <VideoConference />
                                    <RoomAudioRenderer />
                                    <ControlBar variation="minimal" />
                                </LiveKitRoom>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
