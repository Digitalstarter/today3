import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from './use-toast';

export function useNotifications(userId?: string) {
  const { toast } = useToast();
  const previousUnreadCount = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialized = useRef<boolean>(false);

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5;
  }, []);

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread-count'],
    enabled: !!userId,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (unreadData) {
      if (previousUnreadCount.current !== null && isInitialized.current) {
        const newMessages = unreadData.count - previousUnreadCount.current;
        
        if (newMessages > 0) {
          audioRef.current?.play().catch(err => {
            console.log('Could not play notification sound:', err);
          });
          
          toast({
            title: "Nieuw bericht!",
            description: `Je hebt ${newMessages} nieuwe ${newMessages === 1 ? 'bericht' : 'berichten'} ontvangen.`,
            duration: 5000,
          });
        }
      }
      
      previousUnreadCount.current = unreadData.count;
      
      if (!isInitialized.current) {
        isInitialized.current = true;
      }
    }
  }, [unreadData, toast]);

  return { unreadCount: unreadData?.count || 0 };
}
