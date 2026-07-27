// Calls & Video Conferencing Feature Module
export interface CallSession {
    roomId: string;
    callType: 'audio' | 'video';
    token: string;
}
