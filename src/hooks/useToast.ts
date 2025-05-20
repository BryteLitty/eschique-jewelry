import { toast as sonnerToast } from 'sonner';

export function useToast() {
  return {
    toast: (props: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
      if (props.variant === 'destructive') {
        return sonnerToast.error(props.description, {
          description: props.title
        });
      }
      return sonnerToast.success(props.description, {
        description: props.title
      });
    }
  };
} 