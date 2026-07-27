'use client';

import { ControlBar, LiveKitRoom, RoomAudioRenderer, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import axios from 'axios';
import { ArrowLeft, Check, Copy, Loader2, PhoneCall } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useProjectStore } from '@/features/projects/store/useProjectStore';

export default function ProjectCallPage() {
    const router = useRouter();
    const { id: projectId } = useParams();
    const searchParams = useSearchParams();
    const projects = useProjectStore((state) => state.projects);
    const [copied, setCopied] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
    const [callError, setCallError] = useState<string | null>(null);
    const [isJoining, setIsJoining] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [isCheckingConfig, setIsCheckingConfig] = useState(true);
    const [isConfigReady, setIsConfigReady] = useState(false);

    const room = searchParams.get('room') || (typeof projectId === 'string' ? `project-${projectId}` : 'project-room');
    const callType = searchParams.get('type') === 'video' ? 'video' : 'audio';

    const projectName = useMemo(() => {
        if (typeof projectId !== 'string') {
            return 'Project Call';
        }

        const project = projects.find((item) => item._id === projectId);
        return project?.name || 'Project Call';
    }, [projectId, projects]);

    const joinLink = useMemo(() => {
        if (typeof window === 'undefined' || typeof projectId !== 'string') {
            return '';
        }

        return `${window.location.origin}/projects/${projectId}/call?room=${encodeURIComponent(room)}&type=${callType}`;
    }, [callType, projectId, room]);

    const handleCopy = async () => {
        if (!joinLink) {
            return;
        }

        await navigator.clipboard.writeText(joinLink);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    useEffect(() => {
        let isMounted = true;

        const checkLiveKitConfig = async () => {
            setIsCheckingConfig(true);
            try {
                const response = await axios.get('/api/livekit/health');
                const ready = Boolean(response.data?.data?.ready);
                if (!isMounted) {
                    return;
                }

                setIsConfigReady(ready);
                if (!ready) {
                    setCallError('LiveKit is not ready. Please verify server URL and API credentials.');
                }
            } catch (error: any) {
                if (!isMounted) {
                    return;
                }

                setIsConfigReady(false);
                const serverMessage = error?.response?.data?.error || error?.response?.data?.message;
                setCallError(serverMessage || 'LiveKit credentials are invalid for the configured server.');
            } finally {
                if (isMounted) {
                    setIsCheckingConfig(false);
                }
            }
        };

        checkLiveKitConfig();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleJoinCall = useCallback(async () => {
        if (!isConfigReady) {
            setCallError('LiveKit is not ready yet. Please fix configuration and refresh this page.');
            return;
        }

        setCallError(null);
        setIsJoining(true);

        try {
            const response = await axios.post('/api/livekit/token', {
                room,
                callType,
            });

            const data = response.data?.data;
            if (!data?.token || !data?.url) {
                setCallError('Unable to join call: token response is incomplete.');
                return;
            }

            setToken(data.token);
            setLivekitUrl(data.url);
        } catch (error: any) {
            const serverMessage = error?.response?.data?.error || error?.response?.data?.message;
            setToken(null);
            setCallError(serverMessage || 'Unable to join call right now.');
        } finally {
            setIsJoining(false);
        }
    }, [room, callType, isConfigReady]);

    const handleLeaveLiveCall = useCallback(() => {
        setToken(null);
        setIsConnected(false);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="mx-auto w-full max-w-3xl rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Call Room</p>
                        <h1 className="text-xl font-semibold text-gray-900 mt-1">{projectName}</h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.push(`/projects/${projectId}/chatroom`)}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chat
                    </button>
                </div>

                <div className="px-6 py-8 space-y-6">
                    {callError && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {callError}
                        </div>
                    )}

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                            <div className="rounded-full bg-blue-600 text-white p-2">
                                <PhoneCall className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-blue-900">{callType === 'video' ? 'Video' : 'Audio'} call room</h2>
                                <p className="text-sm text-blue-800 mt-1">Room: {room}</p>
                                <p className="text-sm text-blue-800">Share the link below so members can join the same room.</p>
                            </div>
                        </div>
                    </div>

                    {!isConnected && (
                        <div className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Ready to join this call</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {isCheckingConfig
                                        ? 'Checking LiveKit configuration...'
                                        : 'Microphone and camera permissions may be requested by your browser.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleJoinCall}
                                disabled={isJoining || isCheckingConfig || !isConfigReady}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                            >
                                {isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
                                {isJoining ? 'Joining...' : `Join ${callType === 'video' ? 'Video' : 'Audio'} Call`}
                            </button>
                        </div>
                    )}

                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Join Link</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                readOnly
                                value={joinLink}
                                className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center justify-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy link'}
                            </button>
                        </div>
                    </div>

                    {!token && !livekitUrl && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            {isCheckingConfig
                                ? 'Validating LiveKit configuration...'
                                : isConfigReady
                                    ? 'LiveKit is configured and ready.'
                                    : 'LiveKit credentials do not match the configured server. Update env values and restart the server.'}
                        </div>
                    )}

                    {token && livekitUrl && (
                        <div className="rounded-xl overflow-hidden border border-gray-200">
                            <div className="h-[70vh] min-h-115 bg-gray-950" data-lk-theme="default">
                                <LiveKitRoom
                                    token={token}
                                    serverUrl={livekitUrl}
                                    connect
                                    video={callType === 'video'}
                                    audio
                                    onConnected={() => setIsConnected(true)}
                                    onDisconnected={() => setIsConnected(false)}
                                    onError={(error) => setCallError(error.message || 'LiveKit connection failed')}
                                >
                                    <VideoConference />
                                    <RoomAudioRenderer />
                                    <ControlBar variation="minimal" />
                                </LiveKitRoom>
                            </div>
                            <div className="bg-white px-4 py-3 border-t border-gray-200 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleLeaveLiveCall}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                                >
                                    Leave Call Session
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
