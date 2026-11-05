import { useEffect, useState } from "react";


const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(true)
    
    // checks status
    useEffect(()=>{
        window.addEventListener('offline', ()=>{
            setIsOnline(false)
        })
        
        window.addEventListener('online', ()=>{
            setIsOnline(true)
        })
    },[]);

    // return boolean 
    return isOnline;
};

export default useOnlineStatus;