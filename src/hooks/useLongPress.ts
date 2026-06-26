import  {useRef, useCallback} from 'react';

export function useLongPress(onLongPress: ()=> void, delay = 500){
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const start = useCallback(()=> {
       timerRef.current = setTimeout(onLongPress, delay);
    }, [onLongPress, delay]);

    const clear = useCallback(()=> {
        if(timerRef.current){
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    return {
        onMouseDown: start,
        onMouseUp: clear,
        onMouseLeave: clear,
        onTouchStart: start,
        onTouchEnd: clear,
    };
}