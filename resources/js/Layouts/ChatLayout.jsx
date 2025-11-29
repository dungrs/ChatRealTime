import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect } from 'react';

const ChatLayout = ({children}) => {
    return (
        <AuthenticatedLayout>
            ChatLayout
            <div>{children}</div>
        </AuthenticatedLayout>
    )
    
}

export default ChatLayout;