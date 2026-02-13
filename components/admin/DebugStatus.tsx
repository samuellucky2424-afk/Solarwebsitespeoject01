import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';

const DebugStatus: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [installError, setInstallError] = useState<string | null>(null);
    const [insertResult, setInsertResult] = useState<string | null>(null);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
    };

    const testInsert = async () => {
        setLoading(true);
        setInsertResult('Testing insert...');
        try {
            const { data, error } = await supabase.from('greenlife_hub').insert([{
                type: 'debug_test',
                name: 'Debug Item',
                status: 'Test',
                metadata: { timestamp: Date.now() }
            }]).select();

            if (error) {
                console.error("Insert Error:", error);
                setInsertResult(`FAILED: ${error.message} (Code: ${error.code})`);
            } else {
                setInsertResult(`SUCCESS: Inserted ID ${data?.[0]?.id}`);
            }
        } catch (err: any) {
            setInsertResult(`EXCEPTION: ${err.message}`);
        }
        setLoading(false);
    };

    return (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-black p-4 rounded-xl border border-red-500 shadow-2xl z-[9999] max-w-sm text-xs">
            <h3 className="font-bold text-red-600 mb-2">Supabase Debugger</h3>
            <div className="mb-2">
                <span className="font-bold">Auth Status: </span>
                {session ? <span className="text-green-600">Authenticated ({session.user.email})</span> : <span className="text-red-500">No Session (Anon)</span>}
            </div>
            <div className="mb-2">
                <span className="font-bold">Role: </span>
                {session?.user?.role || 'N/A'}
            </div>
            <button
                onClick={testInsert}
                disabled={loading}
                className="w-full bg-red-100 text-red-700 py-1 rounded font-bold hover:bg-red-200 mb-2"
            >
                {loading ? 'Testing...' : 'Test Database Write'}
            </button>
            {insertResult && (
                <div className="bg-gray-100 p-2 rounded break-words font-mono">
                    {insertResult}
                </div>
            )}
        </div>
    );
};

export default DebugStatus;
